export type Dimension =
  | "attention_grab"
  | "clarity"
  | "brand_visibility"
  | "clutter"
  | "emotional_pull"
  | "cta_strength";

export interface DimensionScore {
  key: Dimension;
  label: string;
  score: number;
  reasoning: string;
}

export interface AttentionRegion {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rank: number;
}

export interface AnalysisResult {
  overallScore: number;
  oneLineVerdict: string;
  dimensions: DimensionScore[];
  attentionRegions: AttentionRegion[];
  fixes: string[];
  riskFlags: string[];
}
