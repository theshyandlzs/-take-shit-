export type Screen = 'home' | 'record' | 'academy' | 'report' | 'profile' | 'analysis';

export interface StoolRecord {
  id: string;
  timestamp: Date;
  smoothness: 'smooth' | 'normal' | 'hard';
  shape: number; // 1-7 Bristol scale
  color: string;
  phoneUsed: boolean;
  strained: boolean;
  incomplete: boolean;
  painful: boolean;
  posture: string;
  image?: string; // base64 string
}

export interface AnalysisResult {
  status: string;
  confidence: number;
  observations: {
    title: string;
    description: string;
    type: 'positive' | 'neutral' | 'negative';
  }[];
  advice: {
    category: string;
    content: string;
  }[];
  metrics: {
    label: string;
    value: number; // 0-100
    status: string;
  }[];
}
