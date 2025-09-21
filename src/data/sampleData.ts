import { Creator, ProgressData, DecisionCounts } from '../types/creator';

export const sampleCreator: Creator = {
  id: "creator_01",
  handle: "athienor6",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
  metrics: {
    summary: {
      views: { amount: "169.8K", rank: 41 },
      rate: { amount: "$22", rank: 7 },
      cpm: { amount: "$0.13", rank: 3 }
    },
    detailed: {
      followers: "637.0K",
      brand_fit: "Excellent",
      median_views: "0",
      mean_views: "0",
      most_viewed: "0",
      total_views: "0"
    }
  },
  rates: {
    status: "Initial rate - negotiating",
    packages: [
      {
        title: "YouTube Integration",
        description: "Standard rate for integration",
        price: "$1,000 USD / per_post"
      },
      {
        title: "YouTube CPM Deal",
        description: "$22 per 1,000 views in the first 14 days",
        price: "$22 USD / per_package"
      }
    ]
  },
  videos: [
    {
      id: "video_01",
      title: "My Morning Routine That Changed Everything",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      posted: "3 days ago",
      views: "2.4M"
    },
    {
      id: "video_02",
      title: "Best Coffee Shops in NYC - Hidden Gems",
      thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop",
      posted: "1 week ago",
      views: "1.8M"
    },
    {
      id: "video_03",
      title: "Productivity Tips That Actually Work",
      thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300&h=200&fit=crop",
      posted: "2 weeks ago",
      views: "3.1M"
    }
  ],
  conversation: {
    summary: "No email",
    history: [
      {
        author: "Our Team",
        timestamp: "Sep 2, 2025, 7:39 PM",
        body: "Acknowledged receipt of Athieno's rates and informed that the team will review them and respond soon."
      },
      {
        author: "Creator",
        timestamp: "Sep 2, 2025, 8:38 AM",
        body: "Joey, Athieno's business manager, provided YouTube integration rates: $1,000 standard rate or CPM at $22 per 1,000 views. Awaiting response if these pricing structures work."
      },
      {
        author: "Our Team",
        timestamp: "Sep 1, 2025, 3:15 PM",
        body: "Initial outreach completed. Sent introduction email with campaign details and rate request."
      },
      {
        author: "Creator",
        timestamp: "Sep 1, 2025, 11:22 AM",
        body: "Thanks for reaching out! I'm definitely interested in collaborating. Let me connect you with Joey who handles all my business partnerships."
      },
      {
        author: "Our Team",
        timestamp: "Aug 30, 2025, 2:45 PM",
        body: "Reviewed creator's content - great fit for our gaming campaign. Content style aligns perfectly with target audience."
      },
      {
        author: "Creator",
        timestamp: "Aug 30, 2025, 10:30 AM",
        body: "Hello! Just wanted to follow up on the collaboration opportunity you mentioned. Very excited to potentially work together!"
      },
      {
        author: "Our Team",
        timestamp: "Aug 29, 2025, 4:20 PM",
        body: "Found creator through gaming hashtag research. Strong engagement rates and consistent posting schedule."
      }
    ]
  }
};

export const progressData: ProgressData = {
  current: 5,
  total: 265
};

export const decisionCounts: DecisionCounts = {
  pass: 12,
  maybe: 8,
  favorite: 23
};