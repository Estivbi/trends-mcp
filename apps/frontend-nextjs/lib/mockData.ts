import { TrendItem } from "@/types/trends";

export const mockTrends: TrendItem[] = [
  {
    id: "1",
    title: "Viral Sound - Timeless Remix",
    source: "tiktok",
    url: "https://tiktok.com/@trending/1",
    momentumScore: 98,
    type: "audio",
  },
  {
    id: "2",
    title: "Como el Agua - Morning Edit",
    source: "youtube",
    url: "https://youtube.com/watch?v=abc1",
    momentumScore: 91,
    type: "audio",
  },
  {
    id: "3",
    title: "r/Music: Top Weekly Picks",
    source: "reddit",
    url: "https://reddit.com/r/music/top",
    momentumScore: 84,
    type: "text",
  },
  {
    id: "4",
    title: "Flowers (Acoustic Cover)",
    source: "youtube",
    url: "https://youtube.com/watch?v=abc2",
    momentumScore: 79,
    type: "video",
  },
  {
    id: "5",
    title: "#TrendingNow Challenge",
    source: "tiktok",
    url: "https://tiktok.com/tag/trendingnow",
    momentumScore: 73,
    type: "hashtag",
  },
];

export const mockMomentum48h = [
  { time: "00h", score: 42 },
  { time: "04h", score: 55 },
  { time: "08h", score: 67 },
  { time: "12h", score: 72 },
  { time: "16h", score: 81 },
  { time: "20h", score: 76 },
  { time: "24h", score: 83 },
  { time: "28h", score: 91 },
  { time: "32h", score: 88 },
  { time: "36h", score: 95 },
  { time: "40h", score: 89 },
  { time: "44h", score: 97 },
  { time: "48h", score: 93 },
];

export const mockSourceDistribution = [
  { name: "YouTube", value: 38, color: "#ef4444" },
  { name: "TikTok", value: 35, color: "#6366f1" },
  { name: "Reddit", value: 18, color: "#f97316" },
  { name: "Twitter", value: 9, color: "#38bdf8" },
];
