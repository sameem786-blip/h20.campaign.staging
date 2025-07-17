"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { CampaignTimeline } from "@/components/campaign-timeline";
import { Campaign, ConversationStageSlug, StageCount } from "@/types/campaign";
import { Creator } from "@/types/creator";
import { CreatorCarousel } from "@/components/creator-carousel";
import { useNavbarStore } from "@/store/navbar";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [currentStage, setCurrentStage] = useState<ConversationStageSlug>(
    "share_creative_brief"
  );
  const { navbarText, setNavbarText } = useNavbarStore();
  const [stageCounts, setStageCounts] = useState<StageCount[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreatorsForStage = React.useCallback(
    async (campaignId: number, stage: ConversationStageSlug) => {
      try {
        let query = supabase
          .from("vw_conversation_details")
          .select("*")
          .eq("campaign_id", campaignId);

        if (stage === "none") {
          if (!currentCampaign?.campaign_type_id) {
            query = query.is("last_message_stage", null);
          } else {
            const { data: definedStages } = await supabase
              .from("conversation_stages")
              .select("slug")
              .eq("campaign_type_id", currentCampaign.campaign_type_id);

            const definedStageSlugs = definedStages?.map((ds) => ds.slug) || [];

            if (definedStageSlugs.length > 0) {
              query = query.or(
                `last_message_stage.is.null,last_message_stage.not.in.(${definedStageSlugs.join(
                  ","
                )})`
              );
            } else {
              query = query.is("last_message_stage", null);
            }
          }
        } else {
          query = query.eq("last_message_stage", stage);
        }

        const { data: creatorData, error: dataError } = await query;
        if (dataError) throw dataError;

        const uniqueCreatorIds = new Set<number>();
        const transformedCreators: Creator[] = [];

        creatorData?.forEach((item) => {
          if (!uniqueCreatorIds.has(item.creator_id)) {
            uniqueCreatorIds.add(item.creator_id);
            transformedCreators.push({
              id: item.creator_id,
              creator_campaign_id: item.creator_id,
              username: item.creator_username || item.platform_username || "",
              conversation_id: item.conversation_id,
              stage: item.last_message_stage as ConversationStageSlug,
              screenshot_path: item.screenshot_path,
              core_platform: item.core_platform,
              evaluation_score: item.evaluation_score,
              platform_info: {
                followers: item.platform_followers,
                bio: item.platform_bio,
                video_analysis: item.platform_video_analysis,
              },
            });
          }
        });

        setCreators(transformedCreators);
      } catch (error) {
        console.error("Error fetching creators:", error);
        throw error;
      }
    },
    [currentCampaign]
  );

  // Fetch all campaigns
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const { data, error } = await supabase
          .from("campaigns")
          .select("id, name, campaign_type_id, company_details")
          .order("id");

        if (error) throw error;

        if (data && data.length > 0) {
          setCampaigns(data);
          setCurrentCampaign(data[0]);
          setNavbarText(data[0].name || "Campaigns");
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setError("Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    }

    fetchCampaigns();
  }, []);

  // Fetch stage counts and creators for current campaign
  useEffect(() => {
    if (!currentCampaign) return;

    async function fetchCampaignData() {
      setLoading(true);
      try {
        // We've already checked currentCampaign is not null above
        const campaign = currentCampaign!;

        // Use the vw_campaign_conversation_stage_counts view to get stage counts
        const { data: stageCountData, error: stageError } = await supabase
          .from("vw_campaign_conversation_stage_counts")
          .select("stage_slug, stage_name, conversation_count, stage_order")
          .eq("campaign_id", campaign.id)
          .order("stage_order");

        if (stageError) throw stageError;

        // Transform the data to match StageCount type
        const stageCounts: StageCount[] =
          stageCountData?.map((row) => ({
            stage: row.stage_slug as ConversationStageSlug,
            count: row.conversation_count,
          })) || [];

        setStageCounts(stageCounts);

        // Set currentStage to first available stage if not set or not available for this campaign
        if (stageCounts.length > 0) {
          const availableStages = stageCounts.map((sc) => sc.stage);
          if (!availableStages.includes(currentStage)) {
            setCurrentStage(availableStages[0]);
          }
        }

        // Get creator details from the new view
        await fetchCreatorsForStage(campaign.id, currentStage);
      } catch (error) {
        console.error("Error fetching campaign data:", error);
        setError("Failed to load campaign data");
      } finally {
        setLoading(false);
      }
    }

    fetchCampaignData();
  }, [currentCampaign, currentStage, fetchCreatorsForStage]);

  // Fetch creators when stage changes
  useEffect(() => {
    if (!currentCampaign) return;

    async function refreshCreators() {
      setLoading(true);
      try {
        // We've already checked currentCampaign is not null above
        const campaign = currentCampaign!;
        await fetchCreatorsForStage(campaign.id, currentStage);
      } catch (error) {
        console.error("Error refreshing creators:", error);
        setError("Failed to load creators");
      } finally {
        setLoading(false);
      }
    }

    refreshCreators();
  }, [currentStage, currentCampaign, fetchCreatorsForStage]);

  // Helper function to fetch creators for a stage

  const handleCampaignChange = (campaign: Campaign) => {
    setCurrentCampaign(campaign);
    setNavbarText(campaign.name || "Campaigns");
  };

  const handleStageClick = (stage: ConversationStageSlug) => {
    setCurrentStage(stage);
  };

  if (loading && !currentCampaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2 playfair-font">
      {currentCampaign && (
        <CampaignTimeline
          stages={stageCounts}
          currentStage={currentStage}
          campaigns={campaigns}
          currentCampaign={currentCampaign}
          onStageClick={handleStageClick}
          onCampaignChange={handleCampaignChange}
        />
      )}

      <div className="mt-8 p-4">
        <CreatorCarousel creators={creators} loading={loading} />
      </div>
    </div>
  );
}
