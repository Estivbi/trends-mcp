export type TrendSource = "youtube" | "reddit" | "tiktok" | "instagram";
export type TrendType = "audio" | "video" | "keyword";

export interface TrendItem {
  id: string;
  title: string;
  source: TrendSource;
  url: string;
  momentumScore: number;
  type: TrendType;
  timestamp?: string;
}
