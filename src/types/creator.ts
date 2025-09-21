export interface Creator {
  id: string;
  handle: string;
  avatar: string;
  metrics: {
    summary: {
      views: { amount: string; rank: number };
      rate: { amount: string; rank: number };
      cpm: { amount: string; rank: number };
    };
    detailed: {
      followers: string;
      brand_fit: string;
      median_views: string;
      mean_views: string;
      most_viewed: string;
      total_views: string;
    };
  };
  rates: {
    status: string;
    packages: Array<{
      title: string;
      description: string;
      price: string;
    }>;
  };
  videos: Array<{
    id: string;
    title: string;
    thumbnail: string;
    posted: string;
    views: string;
  }>;
  conversation: {
    summary: string;
    history: Array<{
      author: "Our Team" | "Creator";
      timestamp: string;
      body: string;
    }>;
  };
}

export interface ProgressData {
  current: number;
  total: number;
}

export interface DecisionCounts {
  pass: number;
  maybe: number;
  favorite: number;
}