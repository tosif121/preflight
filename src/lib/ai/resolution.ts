export interface ResolutionResult {
  plainLanguageFix: string;
}

const MOCK_RESOLUTIONS: Record<string, string> = {
  name_consistency:
    "The name on one document doesn't match another. Re-upload a document where the name matches exactly as registered — check spelling, initials vs full name, and middle names.",
  address_consistency:
    "The addresses on your documents don't match. Upload an address proof that matches the address on the Aadhaar card, or update the application with the correct current address.",
  income_coverage:
    "Every earning family member needs at least one income proof document (salary slip, Form 16, ITR, or bank statement). Upload the missing document for the member(s) listed above.",
  certificate_use_by_date:
    "The intended use deadline is outside the certificate's 12-month validity window. Set a deadline within 12 months of the expected issuance date.",
  document_quality:
    "One or more documents have low image quality. Re-upload a clearer, well-lit scan where all text is readable.",
};

export async function generateResolution(
  ruleId: string,
  _message: string,
  _extractedFields?: Record<string, unknown>
): Promise<ResolutionResult> {
  if (MOCK_RESOLUTIONS[ruleId]) {
    return { plainLanguageFix: MOCK_RESOLUTIONS[ruleId] };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      plainLanguageFix:
        "Please review the flagged issue and re-upload the required document(s).",
    };
  }

  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `You are a helpful assistant for an eMitra kiosk operator in Rajasthan.
A preflight check for a Family Income Certificate application has failed or needs review.

Rule: ${ruleId}
Message: ${_message}
${_extractedFields ? `Relevant extracted data: ${JSON.stringify(_extractedFields)}` : ""}

Generate ONE short, plain-language, actionable fix instruction (1-2 sentences).
Do NOT generate any declaration, affidavit, or document meant to be signed.
Do NOT claim the document is "verified" or "official".
Only provide a fix instruction.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
  });

  const fix =
    response.choices[0]?.message?.content?.trim() ??
    "Please review the flagged issue and re-upload the required document(s).";

  return { plainLanguageFix: fix };
}
