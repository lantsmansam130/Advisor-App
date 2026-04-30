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

  // Basic input length guard to prevent runaway API costs
  if (notes.length > 8000) {
    return new Response(JSON.stringify({ error: "Notes too long. Please keep under 8000 characters." }), {
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
        max_tokens: 2000,
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
