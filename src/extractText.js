// Shared text-extraction helpers. Used by DecoderPage (uploads a long doc to decode)
// and AdvisorChatPage (attach a file to a chat turn). PDF.js + worker are imported
// dynamically so the ~1.2MB worker chunk only loads when a user actually drops a file.

export async function extractPdfText(file) {
  const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const parts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it) => ("str" in it ? it.str : "")).join(" ");
    parts.push(strings);
  }
  return parts.join("\n\n").replace(/\s+\n/g, "\n").trim();
}

export async function extractTextFromFile(file) {
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdfText(file);
  }
  if (name.endsWith(".txt") || name.endsWith(".md") || (file.type || "").startsWith("text/")) {
    return await file.text();
  }
  throw new Error("Unsupported file type. Upload a PDF or .txt file, or paste text directly.");
}
