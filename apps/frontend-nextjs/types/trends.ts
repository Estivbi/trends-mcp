export type TrendSource = "youtube" | "reddit" | "tiktok" | "twitter" | "news";
export type TrendType = "audio" | "video" | "text" | "hashtag";

export interface TrendItem {
  id: string;
  title: string;
  source: TrendSource;
  url: string;
  momentumScore: number;
  type: TrendType;
}
