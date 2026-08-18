import type { OcrResult } from "@/lib/types/ocr";

interface MockDocumentFixture {
  fileName: string;
  docType: string;
  extractedFields: Record<string, { value: string; confidence: number }>;
  overallConfidence: number;
}

const MOCK_FIXTURES: MockDocumentFixture[] = [
  {
    fileName: "aadhaar-clean.svg",
    docType: "identity_proof",
    extractedFields: {
      name: { value: "Ramesh Kumar Sharma", confidence: 0.95 },
      dob: { value: "15/03/1985", confidence: 0.92 },
      gender: { value: "Male", confidence: 0.98 },
      address: {
        value: "12, Nehru Nagar, Jaipur, Rajasthan, 302001",
        confidence: 0.88,
      },
      idNumber: { value: "XXXX XXXX 1234", confidence: 0.9 },
    },
    overallConfidence: 0.92,
  },
  {
    fileName: "aadhaar-name-mismatch.svg",
    docType: "identity_proof",
    extractedFields: {
      name: { value: "Ramesh K. Sharma", confidence: 0.88 },
      dob: { value: "15/03/1985", confidence: 0.9 },
      gender: { value: "Male", confidence: 0.97 },
      address: {
        value: "12, Nehru Nagar, Jaipur, Rajasthan, 302001",
        confidence: 0.85,
      },
      idNumber: { value: "XXXX XXXX 5678", confidence: 0.87 },
    },
    overallConfidence: 0.89,
  },
  {
    fileName: "address-proof-clean.svg",
    docType: "address_proof",
    extractedFields: {
      name: { value: "Ramesh Kumar Sharma", confidence: 0.93 },
      address: {
        value: "12, Nehru Nagar, Jaipur, Rajasthan, 302001",
        confidence: 0.91,
      },
      documentType: { value: "Electricity Bill", confidence: 0.95 },
    },
    overallConfidence: 0.93,
  },
  {
    fileName: "address-proof-mismatch.svg",
    docType: "address_proof",
    extractedFields: {
      name: { value: "Ramesh Kumar Sharma", confidence: 0.9 },
      address: {
        value: "45, MI Road, Jodhpur, Rajasthan, 342001",
        confidence: 0.87,
      },
      documentType: { value: "Rent Agreement", confidence: 0.92 },
    },
    overallConfidence: 0.89,
  },
  {
    fileName: "salary-slip-ramesh.svg",
    docType: "income_proof_salaried",
    extractedFields: {
      name: { value: "Ramesh Kumar Sharma", confidence: 0.94 },
      employer: { value: "Rajasthan State Electronics Dev. Corp", confidence: 0.88 },
      monthlySalary: { value: "35000", confidence: 0.91 },
      period: { value: "July 2026", confidence: 0.93 },
    },
    overallConfidence: 0.91,
  },
  {
    fileName: "salary-slip-sunita.svg",
    docType: "income_proof_salaried",
    extractedFields: {
      name: { value: "Sunita Devi", confidence: 0.92 },
      employer: { value: "Mahila Vikas Samiti NGO", confidence: 0.85 },
      monthlySalary: { value: "18000", confidence: 0.89 },
      period: { value: "July 2026", confidence: 0.91 },
    },
    overallConfidence: 0.89,
  },
  {
    fileName: "photo-passport.svg",
    docType: "photo",
    extractedFields: {
      name: { value: "Ramesh Kumar Sharma", confidence: 0.88 },
      type: { value: "Passport Size Photo", confidence: 0.99 },
    },
    overallConfidence: 0.93,
  },
  {
    fileName: "aadhaar-low-quality.svg",
    docType: "identity_proof",
    extractedFields: {
      name: { value: "Priya Sharma", confidence: 0.55 },
      dob: { value: "22/07/1990", confidence: 0.48 },
      gender: { value: "Female", confidence: 0.7 },
      address: {
        value: "78, Civil Lines, Jaipur, Rajasthan, 302006",
        confidence: 0.42,
      },
    },
    overallConfidence: 0.54,
  },
  {
    fileName: "itr-priya.svg",
    docType: "income_proof_nonsalaried",
    extractedFields: {
      name: { value: "Priya Sharma", confidence: 0.9 },
      pan: { value: "XXXXX1234Y", confidence: 0.93 },
      annualIncome: { value: "240000", confidence: 0.87 },
      assessmentYear: { value: "2026-27", confidence: 0.91 },
    },
    overallConfidence: 0.9,
  },
];

const fixturesByFileName = new Map(
  MOCK_FIXTURES.map((f) => [f.fileName, f])
);

export async function extractOcr(
  mockFileName: string,
  _docType: string
): Promise<OcrResult> {
  if (!process.env.OPENAI_API_KEY) {
    const fixture = fixturesByFileName.get(mockFileName);
    if (fixture) {
      return {
        fields: fixture.extractedFields,
        overallConfidence: fixture.overallConfidence,
      };
    }
    return {
      fields: {
        name: { value: "Unknown", confidence: 0.3 },
      },
      overallConfidence: 0.3,
    };
  }

  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `Extract structured data from this ${_docType} document image.
Return a JSON object with field names and each field having "value" and "confidence" (0-1).
For identity proofs: extract name, dob, gender, address, idNumber.
For income proofs: extract name, employer/annualIncome, period/assessmentYear.
For address proofs: extract name, address, documentType.
For photos: extract name, type.
Return ONLY the JSON, no markdown.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: `/mock-docs/${mockFileName}` },
          },
        ],
      },
    ],
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as Record<
      string,
      { value: string; confidence: number }
    >;
    const confidences = Object.values(parsed)
      .map((f) => f.confidence)
      .filter((c) => typeof c === "number");
    const avgConfidence =
      confidences.length > 0
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length
        : 0.5;

    return {
      fields: parsed,
      overallConfidence: avgConfidence,
    };
  } catch {
    return {
      fields: { raw: { value: cleaned, confidence: 0.3 } },
      overallConfidence: 0.3,
    };
  }
}
