"use client";

import React, { useState, useEffect } from "react";
import { Creator } from "@/types/creator";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { VideoPerformanceModal } from "./video-performance-modal";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { GradientButton } from "./ui/gradient-button";

const placeholders = [
  "Summarize this creator's latest performance.",
  "Generate an email pitch for this creator.",
  "What brand would fit best for this creator?",
  "Suggest a campaign idea using this creator's strengths.",
  "Analyze engagement trends from recent content.",
  "How can this creator grow their TikTok reach?",
  "Write a tweet highlighting this creator's impact.",
  "Create a report for brand-fit evaluation.",
  "Recommend 3 video ideas based on their content style.",
  "Translate their value prop into 3 bullet points.",
];

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type VideoSummary = {
  mean_views?: number;
  median_views?: number;
  most_viewed?: number;
  total_views?: number;
};

type VideoDistributionItem = {
  count: number;
  range: string;
  percentage: number;
};

type NegotiationItem = {
  id: number;
  created_at: string;
  negotiation_summary: string;
  direction: "inbound" | "outbound";
  sender: string;
};

type Rate = {
  id: number;
  creator_id: number;
  name: string;
  media_type: string;
  platform: string;
  duration_sec: number;
  cross_posted: boolean;
  price: number;
  currency: string;
  unit: string;
  notes: string;
  raw_text: string;
  created_at: string;
};

type CreatorCardProps = {
  creator: Creator;
};

export function CreatorCard({ creator }: CreatorCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [negotiations, setNegotiations] = useState<NegotiationItem[]>([]);
  const [negotiationsLoading, setNegotiationsLoading] = useState(true);
  const [rates, setRates] = useState<Rate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const router = useRouter();

  // Get the public URL for the screenshot from Supabase storage
  useEffect(() => {
    const fetchImageUrl = async () => {
      if (creator?.screenshot_path && !imageError) {
        try {
          // Get public URL for the image from the screenshots bucket
          const { data } = supabase.storage
            .from("screenshots")
            .getPublicUrl(creator.screenshot_path);

          if (data && data.publicUrl) {
            // Make sure the URL is properly encoded
            const url = new URL(data.publicUrl);
            setImageUrl(url.toString());
            setImageError(false);
          }
        } catch (error) {
          console.error("Error fetching image URL:", error);
          setImageError(true);
        }
      }
    };

    fetchImageUrl();
  }, [creator?.screenshot_path, imageError]);

  // Fetch negotiation history
  useEffect(() => {
    const fetchNegotiationHistory = async () => {
      if (!creator.conversation_id) {
        setNegotiationsLoading(false);
        return;
      }

      setNegotiationsLoading(true);
      try {
        // Query messages table for negotiation summaries
        const { data, error } = await supabase
          .from("messages")
          .select("id, created_at, negotiation_summary, direction, sender")
          .eq("conversation_id", creator.conversation_id)
          .not("negotiation_summary", "is", null)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setNegotiations(data || []);
      } catch (error) {
        console.error("Error fetching negotiation history:", error);
      } finally {
        setNegotiationsLoading(false);
      }
    };

    fetchNegotiationHistory();
  }, [creator.conversation_id]);

  useEffect(() => {
    const getRates = async () => {
      setRatesLoading(true);
      try {
        const { data, error } = await supabase
          .from("deliverables")
          .select("*")
          .eq("creator_id", creator.id);

        if (error) {
          throw error;
        }
        setRates(data || []);
      } catch (error) {
        console.error("Error fetching rates:", error);
      } finally {
        setRatesLoading(false);
      }
    };

    getRates();
  }, [creator.id]);

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsProcessingAI(true);
    toast.loading("Processing AI action...", { id: "ai-action" });

    try {
      const response = await fetch("https://kiko-test.replit.app/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creator_id: creator.id,
          conversation_id: creator.conversation_id,
          instructions: aiPrompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("AI Action Result:", result);

      // Show success toast
      toast.success("AI action completed successfully!", { id: "ai-action" });

      // Clear the input after successful submission
      setAiPrompt("");
    } catch (error) {
      console.error("Error processing AI request:", error);

      // Show error toast
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process AI action";
      toast.error(`Error: ${errorMessage}`, { id: "ai-action" });
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Generate a random color for placeholder if no screenshot is available
  const getRandomColor = () => {
    const colors = [
      "bg-blue-500",
      "bg-red-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
    ];
    // Use the first character of the username to ensure the same creator always gets the same color
    const index = creator.username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Format followers count for display
  const formatNumber = (count: number | null | undefined): string => {
    if (!count) return "0";
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  // Get video performance stats
  const getVideoPerformanceText = (): string => {
    try {
      if (!creator.platform_info?.video_analysis)
        return "No video performance data available";

      const analysis = creator.platform_info.video_analysis as Record<
        string,
        unknown
      >;
      if (typeof analysis["Data Summary"] === "string") {
        return analysis["Data Summary"];
      } else if (typeof analysis.Data_Summary === "string") {
        return analysis.Data_Summary;
      }

      // Fallback: try to construct from other fields
      const distribution =
        (analysis.last_15_videos_distribution_relative_to_median as VideoDistributionItem[]) ||
        [];
      const medianRange = distribution.find(
        (d) => d.range === "1–2×" || d.range === "1-2×"
      );

      if (medianRange) {
        return `This creator's content typically performs within 1-2x of their median view count, with ${medianRange.percentage}% of videos falling in this range.`;
      }

      return "Video performance data available in platform_info.video_analysis";
    } catch (error) {
      console.error("Error parsing video performance:", error);
      return "Unable to parse video performance data";
    }
  };

  // Get brand fit text based on evaluation score
  const getBrandFitText = (): { text: string; colorClass: string } => {
    if (creator.evaluation_score === 3) {
      return { text: "Excellent", colorClass: "color-p600" };
    } else if (creator.evaluation_score === 2) {
      return { text: "Good", colorClass: "color-p500" };
    } else {
      return { text: "N/A", colorClass: "text-gray-500" };
    }
  };

  // Get video summary data
  const getVideoSummary = (): VideoSummary => {
    try {
      if (!creator.platform_info?.video_analysis) return {};

      const analysis = creator.platform_info.video_analysis as Record<
        string,
        unknown
      >;
      if (analysis.last_15_videos_summary) {
        return analysis.last_15_videos_summary as VideoSummary;
      }

      return {};
    } catch (error) {
      console.error("Error parsing video summary:", error);
      return {};
    }
  };

  // Get outlier rate from video distribution
  const getOutlierRate = (): string => {
    try {
      if (!creator.platform_info?.video_analysis) return "N/A";

      const analysis = creator.platform_info.video_analysis as Record<
        string,
        unknown
      >;
      const distribution =
        (analysis.last_15_videos_distribution_relative_to_median as VideoDistributionItem[]) ||
        [];

      // Consider outliers as videos with views outside 0.5-2x median
      const outliers = distribution.filter(
        (d) => !["0.5–1×", "1–2×", "0.5-1×", "1-2×"].includes(d.range)
      );

      if (outliers.length > 0) {
        const totalPercentage = outliers.reduce(
          (sum, item) => sum + item.percentage,
          0
        );
        return `${totalPercentage.toFixed(0)}%`;
      }

      return "0%";
    } catch (error) {
      console.error("Error calculating outlier rate:", error);
      return "N/A";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const videoSummary = getVideoSummary();

  // Generate platform URL based on core_platform and username
  const getPlatformUrl = (): string => {
    if (!creator.core_platform || !creator.username) return "#";

    switch (creator.core_platform.toLowerCase()) {
      case "youtube":
        return `https://www.youtube.com/channel/${creator.username}`;
      case "tiktok":
        return `https://www.tiktok.com/@${creator.username}`;
      case "instagram":
        return `https://www.instagram.com/${creator.username}`;
      default:
        return "#";
    }
  };

  return (
    <>
      <div className="flex w-full h-full gap-4">
        {/* Image Card */}
        <div className="w-[450px] flex items-center justify-center ">
          <div className="border rounded-lg shadow-sm bg-white w-full h-full flex flex-col items-center justify-center overflow-hidden">
            <a
              href={getPlatformUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full flex items-center justify-center"
            >
              <div className="relative w-full h-full overflow-hidden">
                {/* Platform badge */}
                {/* {creator.core_platform && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white flex items-center justify-center bg-white">
                      {creator.core_platform === "instagram" && (
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      )}
                      {creator.core_platform === "tiktok" && (
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-1.16-.53-2.23-1.31-3.15-2.19v9.02c-.08 1.53-.83 3.01-2.02 4.1-1.98 1.92-5.03 2.44-7.63 1.31-2.07-.88-3.71-2.67-4.4-4.77-.36-1.08-.51-2.22-.5-3.36.1-3.68 2.96-6.96 6.67-7.56.77-.14 1.56-.13 2.34-.08v4.15c-.45-.14-.92-.16-1.39-.11-1.56.13-2.96 1.28-3.49 2.77-.15.39-.22.8-.25 1.21-.13 1.68.8 3.39 2.33 4.08 1.73.78 3.95.21 5.05-1.33.32-.44.54-.95.65-1.48.18-.81.17-1.65.2-2.48h.02V.03c-.01 0-.01-.01-.01-.01z" />
                        </svg>
                      )}
                      {creator.core_platform === "youtube" && (
                        <svg
                          className="h-5 w-5 text-red-600"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      )}
                    </div>
                  </div>
                )} */}
                {/* Creator image or colorful placeholder */}
                {imageUrl && !imageError ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={imageUrl}
                      alt={creator.username}
                      fill
                      className="object-fit"
                      sizes="(max-width: 768px) 100vw, 25vw"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${getRandomColor()}`}
                  >
                    <span className="text-4xl font-bold text-white">
                      {creator.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </a>
          </div>
        </div>

        {/* Details Card */}
        <div className="w-3/4 flex flex-col">
          <div className="border rounded-lg shadow-sm bg-white w-full h-full flex flex-col">
            {/* Creator Header */}
            <div className="p-3 border-b">
              <div className="font-semibold [font-family:var(--font-gt-america)] color-n900">
                {creator.username}
              </div>
            </div>

            {/* Metrics Sections */}
            <div className="flex-1 grid grid-cols-2 gap-0">
              {/* Creator Metrics Section */}
              <div className="p-3 border-t border-r">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="font-normal [font-family:var(--font-gt-america)] text-gray-500">
                      Brand Fit
                    </div>
                    <div className="font-medium text-sm">
                      <span
                        className={`text-sm font-semibold [font-family:var(--font-gt-america)] ${
                          getBrandFitText().colorClass
                        }`}
                      >
                        {getBrandFitText().text}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="font-normal [font-family:var(--font-gt-america)] text-gray-500">
                      Followers
                    </div>
                    <div className="text-sm font-semibold [font-family:var(--font-gt-america)]">
                      {formatNumber(creator.platform_info?.followers)}
                    </div>
                  </div>

                  <div>
                    <div className="font-normal [font-family:var(--font-gt-america)] text-gray-500">
                      Rates
                    </div>
                    <div className="mt-3 max-h-32 overflow-y-auto space-y-2">
                      {ratesLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : rates.length === 0 ? (
                        <div className="text-xs font-normal [font-family:var(--font-gt-america)] text-gray-500 py-2">
                          No rates available
                        </div>
                      ) : (
                        rates.map((rate) => (
                          <div
                            key={rate.id}
                            className="flex justify-between bg-p50 p-2 rounded-md border border-p200"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="font-medium text-xs color-p600">
                                {rate.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {rate.notes}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-sm color-p600">
                                {rate.price} {rate.currency} / {rate.unit}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Performance Section */}
              <div className="p-3 border-t max-h-64 overflow-y-auto">
                {/* Video Performance Summary */}
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs font-normal [font-family:var(--font-gt-america)] text-gray-500">
                        Median Views
                      </div>
                      <div className="font-semibold [font-family:var(--font-gt-america)] text-sm">
                        {formatNumber(videoSummary.median_views)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-normal [font-family:var(--font-gt-america)] text-gray-500">
                        Mean Views
                      </div>
                      <div className="font-semibold [font-family:var(--font-gt-america)] text-sm">
                        {formatNumber(videoSummary.mean_views)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-normal [font-family:var(--font-gt-america)] text-gray-500">
                        Most Viewed
                      </div>
                      <div className="font-semibold [font-family:var(--font-gt-america)] text-sm">
                        {formatNumber(videoSummary.most_viewed)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-normal [font-family:var(--font-gt-america)] text-gray-500">
                        Total Views
                      </div>
                      <div className="font-semibold [font-family:var(--font-gt-america)] text-sm">
                        {formatNumber(videoSummary.total_views)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Distribution Chart */}
                {creator.platform_info?.video_analysis &&
                  (() => {
                    const analysis = creator.platform_info
                      .video_analysis as Record<string, unknown>;
                    const distributionData =
                      (analysis.last_15_videos_distribution_relative_to_median as VideoDistributionItem[]) ||
                      [];
                    const sampleSize =
                      (analysis.sample_size_videos as number) || 0;

                    return distributionData.length > 0 ? (
                      <div className="mb-4">
                        <h4 className="uppercase text-xs font-medium text-gray-500 mb-2">
                          LAST {sampleSize} VIDEOS DISTRIBUTION
                        </h4>
                        <p className="text-xs text-gray-500 mb-3">
                          Relative to median views
                        </p>

                        <div className="space-y-3">
                          {distributionData.map(
                            (item: VideoDistributionItem, index: number) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-normal [font-family:var(--font-gt-america)]">
                                    {item.range}
                                  </span>
                                  <span className="font-medium [font-family:var(--font-gt-america)]">
                                    {item.count} ({item.percentage.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div
                                    className="bg-p600 h-2 rounded-full"
                                    style={{ width: `${item.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()}
              </div>
            </div>

            {/* AI Input Section */}
            <div className="p-3 border-t">
              <form onSubmit={handleAISubmit} className="flex gap-2">
                <PlaceholdersAndVanishInput
                  placeholders={placeholders}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onSubmit={() => {}}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      aiPrompt.trim() &&
                      !isProcessingAI
                    ) {
                      e.preventDefault();
                      handleAISubmit(e);
                    }
                  }}
                />
                {/* <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="What do you want the AI to do with this creator?"
                  className="text-xs resize-none flex-1 min-h-8"
                  rows={2}
                  disabled={isProcessingAI}
                /> */}
                <GradientButton
                  disabled={!aiPrompt.trim() || isProcessingAI}
                  className="bg-p500 color-n000 hover:bg-p600"
                  onClick={handleAISubmit}
                >
                  {isProcessingAI ? (
                    <div className="flex items-center justify-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-current"></div>
                      Processing...
                    </div>
                  ) : (
                    "Execute with AI"
                  )}
                </GradientButton>
                {/* <Button
                  type="submit"
                  disabled={!aiPrompt.trim() || isProcessingAI}
                  className="text-xs self-stretch px-4 py-3"
                  variant="outline"
                >
                  {isProcessingAI ? (
                    <div className="flex items-center justify-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-current"></div>
                      Processing...
                    </div>
                  ) : (
                    "Execute with AI"
                  )}
                </Button> */}
              </form>
            </div>

            {/* Conversation Summary Section */}
            <div className="p-3 border-t">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs color-p600 font-semibold">
                  Conversation Summary
                </div>
                <button
                  className="py-1.5 px-3 text-center text-xs rounded-md bg-p500 color-n000 hover:bg-p600"
                  onClick={() =>
                    router.push(`/email/${creator.conversation_id}`)
                  }
                >
                  View Email Thread
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto">
                {negotiationsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : negotiations.length === 0 ? (
                  <div className="text-xs text-gray-500 py-2">
                    No conversation history available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {negotiations.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2 rounded text-xs border-l-4 ${
                          item.direction === "inbound"
                            ? "bg-p50 border-p200"
                            : "bg-p200 border-p600"
                        }`}
                      >
                        <div className="flex justify-between mb-1">
                          {item.direction === "inbound" ? (
                            <span className="font-semibold text-xs">
                              Creator
                            </span>
                          ) : (
                            <span className="font-medium text-xs">
                              Our Team
                            </span>
                          )}
                          <span className="font-light text-xs text-gray-500">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        <p className="fotn-normal text-xs text-gray-700">
                          {item.negotiation_summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Performance Modal */}
      <VideoPerformanceModal
        videoAnalysis={
          (creator.platform_info?.video_analysis as Record<string, unknown>) ||
          null
        }
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />
    </>
  );
}
