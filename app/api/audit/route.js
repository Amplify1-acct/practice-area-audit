import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 300;

const SYSTEM_PROMPT = `You are a practice area page auditor for law firm websites. You audit pages against a 15-point gold standard derived from pbglaw.com's best-in-class pages.

THE 15 REQUIRED ELEMENTS:
1. Named Attorney Author Byline with Photo — specific attorney name + headshot, not "the firm"
2. Third-Party Editor Credit — separate editor credited, ideally external
3. Fact-Checked Badge / Trust Signal — visible badge + "why you can trust this" disclosure
4. State-Specific Legal Summary in Opening — first 100-150 words answer the legal question with state statute, who can file, deadline/SOL, state-specific programs
5. "You May Have a Claim If" Checklist — scenario-based bullets in plain language (NOT legal element language)
6. Anchor-Linked Table of Contents — TOC with working jump links to H2 sections
7. H2 Sub-Topic Sections — clear H2 structure, each section answers a specific question
8. Internal Link Hub / Information Center — sidebar/block linking to related sub-pages
9. Attorney FAQ Videos — 5+ baseline, 10-20 ideal, on-camera attorney clips
10. Full Verbatim Transcripts Below Each Video — non-negotiable for SEO
11. Data Callouts — 4-6 visually formatted statistics, sourced and specific
12. FAQ Text Section — 8-12 Q&A pairs mirroring real search queries
13. Mid-Page Google Reviews — 2-3 testimonials embedded in body content
14. Results / Verdicts Slider — case results with dollar amounts, appearing 2x on page
15. Mid-Page CTAs — "Free Consultation" CTA repeated 2-3 times within body

AUDIT INSTRUCTIONS:
- Use web_fetch to retrieve the URL, then evaluate every element
- Evaluate content QUALITY not just presence (a 3-question FAQ is "present" but inadequate — flag it)
- The transcript element (#10) is most commonly missing and most impactful — flag prominently
- Check that TOC anchor links actually jump to sections
- Generic content that could apply to any state is a major weakness
- Scenario language vs legal language matters for #5

OUTPUT FORMAT (use this exact markdown structure):

## Page audited
**URL:** [url]
**Firm:** [firm name]
**Practice area:** [area]
**Overall score:** [X/15] — [Gold Standard ✅ / Strong, needs refinement ⚠️ / Below standard 🔶 / Needs complete rebuild 🔴]

## 15-point checklist

| # | Element | Status | Notes |
|---|---------|--------|-------|
| 1 | Named attorney byline + photo | ✅/⚠️/❌ | brief detail |
| 2 | Editor credit | ... | ... |
(continue for all 15)

## Priority fixes
[3-5 missing elements with greatest impact. For each: one paragraph explaining why it matters and what to do.]

## Full recommendations
[For every missing or partial element, a specific actionable recommendation tailored to this firm and practice area.]

GRADING:
- 13-15 present: Gold Standard ✅
- 9-12 present: Strong, needs refinement ⚠️
- 5-8 present: Below standard 🔶
- 0-4 present: Needs complete rebuild 🔴`;

export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      defaultHeaders: { "anthropic-beta": "web-fetch-2025-09-10" },
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: "web_fetch_20250910",
          name: "web_fetch",
          max_uses: 3,
        },
      ],
      messages: [
        {
          role: "user",
          content: `Audit this practice area page against the 15-point gold standard. Fetch the page with web_fetch, evaluate every element, and produce the full report in the specified format.\n\nURL: ${url}`,
        },
      ],
    });

    const text = (response.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n\n");

    return Response.json({ report: text });
  } catch (err) {
    console.error("Audit error:", err);
    return Response.json(
      { error: err.message || "Audit failed" },
      { status: 500 }
    );
  }
}
