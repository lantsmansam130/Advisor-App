// netlify/functions/generate.js
// Serverless proxy to the Anthropic API. Keeps your API key server-side.

const PROMPTS = {
  client_recap: (notes, tone) => `You are an executive assistant for a registered financial advisor. Convert the rough meeting notes below into a polished, ${tone.toLowerCase()}-toned client recap email.

Strict requirements:
- Subject line at top, prefixed "Subject: "
- Open with thanks for the meeting and reference the date if mentioned
- Recap discussion topics in clean bullets (life updates, financial concerns, goals discussed)
- List agreed next steps with clear owners ("I will..." for advisor, "You will..." for client) and timelines
- Reference any documents the client agreed to provide (statements, tax returns, beneficiary forms)
- Close with availability for follow-up
- DO NOT include specific investment recommendations, performance projections, or guarantees
- DO NOT use language that could be construed as a solicitation
- End with this exact disclosure on its own line: "This communication is for informational purposes only and does not constitute investment advice. Please refer to your advisory agreement and ADV for complete details."

Rough notes:
${notes}`,

  discovery_call: (notes, tone) => `You are an executive assistant for a registered financial advisor. Convert the rough notes from a discovery call (a first meeting with a prospective client) into a polished, ${tone.toLowerCase()}-toned follow-up summary.

Strict requirements:
- Subject line at top, prefixed "Subject: " — keep it warm but professional
- Open with thanks for the conversation; reference the date if mentioned
- Recap discussion in clean sections:
  GOALS & PRIORITIES — what the prospect said they want to accomplish
  CURRENT SITUATION — family, work, accounts, existing advisors mentioned
  CONCERNS RAISED — anything they flagged as keeping them up at night
  WHAT WE DISCUSSED — the topics you covered, framed as exploration not advice
- List clear next steps with owners ("I will..." / "You will...") and timelines
- Reference any documents the prospect agreed to send (statements, tax returns, estate documents)
- Close with a warm forward-looking line and your availability for follow-up
- DO NOT make recommendations, claims about returns, or anything that could be construed as advice or solicitation
- DO NOT assume the prospect has decided to engage your services; preserve their optionality
- End with this exact disclosure on its own line: "This message is for informational purposes only and is not investment advice. No advisory relationship is established by this communication."

Rough notes:
${notes}`,

  crm_note: (notes, tone) => `You are organizing a financial advisor's CRM entry (Redtail / Wealthbox / Salesforce style). Convert the rough notes below into a structured meeting note.

Format exactly as:
MEETING TYPE: [Annual Review / Discovery / Plan Presentation / Service / Prospect — infer from notes]
DATE: [if mentioned, otherwise "Not specified"]
ATTENDEES: [list]

KEY DISCUSSION POINTS
- [point]

LIFE EVENTS / CHANGES
- [marriage, birth, job change, inheritance, health, etc. — or "None reported"]

FINANCIAL CONCERNS RAISED
- [concern]

ACTION ITEMS — ADVISOR
- [ ] [action] — due [date if mentioned]

ACTION ITEMS — CLIENT
- [ ] [action] — due [date if mentioned]

DOCUMENTS REQUESTED
- [list, or "None"]

NEXT MEETING: [date/timeframe if mentioned, otherwise "TBD"]

Tone: ${tone.toLowerCase()}. Be factual. No interpretation beyond what is in the notes. Mark unclear items [needs clarification].

Rough notes:
${notes}`,

  compliance_log: (notes, tone) => `You are drafting an audit-ready compliance memo for a registered financial advisor. Convert the rough notes below into a Suitability & Compliance Memo.

Structure:
1. CLIENT & MEETING CONTEXT (1-2 sentences: who, when, meeting purpose)

2. CLIENT CIRCUMSTANCES DISCUSSED
   - Time horizon: [if mentioned]
   - Risk tolerance: [if mentioned or inferred from discussion]
   - Liquidity needs: [if mentioned]
   - Tax situation: [if mentioned]
   - Other relevant: [life events, dependents, debts, etc.]

3. RECOMMENDATIONS DISCUSSED
   - [list any recommendations made or considered]

4. SUITABILITY RATIONALE
   - [why each recommendation aligns with client circumstances above]

5. RISKS & ALTERNATIVES DISCLOSED
   - [risks discussed with client]
   - [alternatives presented]

6. CLIENT ACKNOWLEDGMENT
   - [what the client agreed to or requested time to consider]

7. FOLLOW-UP REQUIRED
   - [next steps with deadlines]

Tone: ${tone.toLowerCase()} and factual. This is a regulatory record. If the notes are insufficient to support a section, write "Not documented in source notes — follow up required." Do NOT invent facts.

Rough notes:
${notes}`,

  ips_update: (notes, tone) => `You are drafting an Investment Policy Statement (IPS) Change Summary based on a client meeting. Convert the rough notes below into proposed IPS updates.

Structure:
PROPOSED IPS UPDATES — [Client Name if mentioned, else "Client"]
Effective Date: [date if mentioned, else "Pending client signature"]

1. CHANGES TO OBJECTIVES
   - Previous: [if referenced in notes]
   - Proposed: [new objective]
   - Reason: [from discussion]

2. CHANGES TO TIME HORIZON
   - [or "No change"]

3. CHANGES TO RISK TOLERANCE
   - [or "No change"]

4. CHANGES TO ASSET ALLOCATION TARGETS
   - [or "No change" — list specific % shifts if discussed]

5. CHANGES TO CONSTRAINTS
   - Liquidity: [or "No change"]
   - Tax considerations: [or "No change"]
   - Legal/regulatory: [or "No change"]
   - Unique circumstances: [ESG preferences, concentrated positions, etc., or "No change"]

6. REBALANCING & REVIEW
   - [any updates to rebalancing thresholds or review frequency]

REQUIRED SIGNATURES: Client and Advisor
NEXT REVIEW DATE: [if discussed]

Tone: ${tone.toLowerCase()}. If the notes don't support a change, write "No change discussed." Do not fabricate allocation percentages or risk metrics.

Rough notes:
${notes}`,

  task_list: (notes, tone) => `You are organizing post-meeting follow-up tasks for a financial advisor's practice. Convert the rough notes below into a clean, ${tone.toLowerCase()}-toned internal task list.

Format exactly as:
POST-MEETING TASK LIST — [Client name if mentioned, else "Client"]
Meeting date: [if mentioned, else "Not specified"]

FOR THE ADVISOR
- [ ] [task] — due [date if mentioned, else "TBD"]

FOR THE TEAM (Assistant / Paraplanner / Operations)
- [ ] [task] — due [date if mentioned, else "TBD"] — owner: [if mentioned, else "TBD"]

FOR THE CLIENT
- [ ] [task] — requested by [date if mentioned, else "TBD"]

DOCUMENTS TO REQUEST
- [list, or "None"]

ITEMS TO RESEARCH BEFORE NEXT TOUCH
- [topics requiring follow-up research, or "None"]

NEXT TOUCH POINT: [meeting type, date/timeframe, or "TBD"]

Tone: ${tone.toLowerCase()}. Be operational and specific. If a task is implied but unclear, write it with [needs clarification]. Do not invent tasks not supported by the notes. This is an internal document — no client-facing language, no disclosures needed.

Rough notes:
${notes}`,

  document_decoder: (notes, tone) => {
    // For document_decoder, "tone" is repurposed to carry "docType|readingLevel"
    // e.g., "Annuity contract|General client"
    const [docType, readingLevel] = (tone || "Other / Unknown|General client").split("|");
    const isSophisticated = readingLevel && readingLevel.toLowerCase().includes("sophisticated");
    const audienceGuidance = isSophisticated
      ? "The output reader is a sophisticated client (e.g., a doctor, lawyer, or business owner) who can handle technical concepts but isn't a financial professional. Use precise terminology where it earns its place; don't oversimplify."
      : "The output reader is a general client with no financial background. Use everyday language, short sentences, and define any term that isn't common knowledge.";

    return `You are helping a registered financial advisor decode a section of a complex financial or legal document for a client conversation. The document type is: ${docType}. Convert the document section below into a structured, plain-language breakdown.

${audienceGuidance}

Output exactly three labeled sections, in this order:

A. WHAT THIS SECTION SAYS
A plain-language paragraph (or two short paragraphs maximum) summarizing what the section actually says. Preserve all numbers, dates, percentages, named products, and named parties exactly as written in the source. If a term is defined elsewhere in the contract and you can see the definition in the excerpt, use it. If a term is referenced but not defined in the excerpt provided, do NOT guess what it means — flag it for the next section instead.

B. WATCH FOR
A bullet list of 2-5 things the advisor should pay attention to. These can include:
- Time-bound restrictions (lock-up periods, surrender periods, vesting schedules)
- Terms referenced but not defined in the excerpt
- Language that is intentionally vague, ambiguous, or could mean different things
- Common conditions or exceptions that aren't mentioned in this excerpt but typically exist (e.g., "death benefit waivers are common but not mentioned here — verify in the full document")
- Anything in the section that could surprise a client

These should be observations grounded in what the document says (or doesn't say) — never recommendations about what the client should do. Do not write "this is bad for the client" or "you should not sign this." Write what to verify and what's notable, not what to decide.

C. QUESTIONS TO ASK THE ISSUER OR ATTORNEY
A numbered list of 3-5 specific questions the advisor (or the client's attorney/CPA/insurance agent as appropriate) should ask before signing, taking action, or counseling the client. Questions should be answerable by the issuer or appropriate professional and should help fill in the gaps the excerpt doesn't cover.

Hard rules:
- This is NOT legal, tax, or insurance advice. Do not write anything that sounds like advice. The advisor will use this output to prepare for a conversation, not to replace consultation with the right professional.
- Do not invent facts the document doesn't state. If something isn't in the excerpt, say so.
- Do not soften, omit, or editorialize about anything the document says.
- Do not predict the issuer's intent, the company's reliability, or the product's quality. Stick to what the words on the page say.
- Preserve all required regulatory or disclosure language verbatim if it appears in the source. Do not paraphrase it.

Document section to decode:
${notes}`;
  },
};

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server is missing ANTHROPIC_API_KEY env var." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { notes, tone, outputType } = body;
  if (!notes || !tone || !outputType) {
    return new Response(JSON.stringify({ error: "Missing notes, tone, or outputType" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const promptFn = PROMPTS[outputType];
  if (!promptFn) {
    return new Response(JSON.stringify({ error: "Unknown outputType" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Length guard. Document decoder allows much longer text since legal/insurance docs are dense.
  const lengthCap = outputType === "document_decoder" ? 15000 : 8000;
  if (notes.length > lengthCap) {
    return new Response(JSON.stringify({ error: `Text too long. Please keep under ${lengthCap.toLocaleString()} characters.` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: outputType === "document_decoder" ? 3000 : 2000,
        messages: [{ role: "user", content: promptFn(notes, tone) }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return new Response(JSON.stringify({ error: `Anthropic API error: ${errText}` }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await anthropicRes.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
