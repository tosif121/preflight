export interface ExtractedField {
  value: string;
  confidence: number;
}

export interface OcrResult {
  fields: Record<string, ExtractedField>;
  overallConfidence: number;
}
