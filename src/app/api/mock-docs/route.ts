import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";

const MOCK_DOCS = [
  { fileName: "aadhaar-clean.svg", label: "Aadhaar — Clean (Ramesh Kumar Sharma)", docType: "identity_proof" },
  { fileName: "aadhaar-name-mismatch.svg", label: "Aadhaar — Name Mismatch (Ramesh K. Sharma)", docType: "identity_proof" },
  { fileName: "address-proof-clean.svg", label: "Electricity Bill — Jaipur", docType: "address_proof" },
  { fileName: "address-proof-mismatch.svg", label: "Rent Agreement — Jodhpur (Mismatch)", docType: "address_proof" },
  { fileName: "salary-slip-ramesh.svg", label: "Salary Slip — Ramesh Kumar Sharma", docType: "income_proof_salaried" },
  { fileName: "salary-slip-sunita.svg", label: "Salary Slip — Sunita Devi", docType: "income_proof_salaried" },
  { fileName: "photo-passport.svg", label: "Passport Photo — Ramesh", docType: "photo" },
  { fileName: "aadhaar-low-quality.svg", label: "Aadhaar — Low Quality (Priya)", docType: "identity_proof" },
  { fileName: "itr-priya.svg", label: "ITR — Priya Sharma", docType: "income_proof_nonsalaried" },
];

export async function GET(_request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  return Response.json(MOCK_DOCS);
}
