"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GradientButton } from "@/components/ui/gradient-button";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs2";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { GridBackground } from "@/components/ui/glowing-card";
import { Component } from "@/components/ui/animate-sparkle-toggle-with-magical-effects";
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "@/components/ui/data-table";
import {
  addMonths,
  endOfMonth,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRightIcon } from "lucide-react";
import { Creator } from "@/types";
import HolographicCard from "@/components/ui/holographic-card";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// Types for the API responses - all fields are optional
interface AudienceAnalysis {
  title?: string;
  macro_persona?: string;
  micro_segments?: {
    segment?: string;
    views_pool_share_percent?: number;
    core_interests?: string[];
    creator_ids?: number[];
  }[];
  network_cheatsheet?: {
    views_pool_share_ranked?: {
      segment?: string;
      share_percent?: number;
    }[];
    rate_bands?: string;
    network_breakdown?: {
      instagram_only?: number;
      cross_post_bundles?: number;
      tiktok_only?: number;
      youtube_only?: number;
    };
  };
}

interface CPMPerformerEntry {
  creator?: string;
  cpm_usd?: number;
  note?: string;
}

interface CPMAnalysis {
  key_takeaways?: {
    cheatsheet?: {
      low_cpm?: number;
      high_cpm?: number;
      median_cpm?: number;
      average_cpm?: number;
    };
    top_performers?: CPMPerformerEntry[];
    solid_value?: CPMPerformerEntry[];
    caution_zone?: CPMPerformerEntry[];
  };
  table?: {
    rank?: number;
    handle?: string;
    brand_fit?: number;
    rate_usd?: number;
    mean_views?: number;
    cpm_usd?: number;
    outlier_rate_pct?: number;
  }[];
}

export default function CampaignAnalysisPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [currentStage, setCurrentStage] = useState<
    "qualitative" | "quantitative"
  >("qualitative");
  const [audienceData, setAudienceData] = useState<AudienceAnalysis | null>(
    null
  );
  const [cpmData, setCpmData] = useState<CPMAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewPersona1Creators, setViewPersona1Creators] = useState(false);
  const [viewPersona2Creators, setViewPersona2Creators] = useState(false);
  const [viewPersona3Creators, setViewPersona3Creators] = useState(false);
  const [selectedPersonaCreators, setSelectedPersonaCreators] = useState(null);
  const [creatorImage, setCreatorImage] = useState<string | null>(null);

  const onStageClick = (key: "qualitative" | "quantitative") => {
    setCurrentStage(key);
  };

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [audienceResponse, cpmResponse] = await Promise.all([
        fetch(
          `https://kiko-test.replit.app/audience-analysis?campaign_id=${campaignId}`,
          {
            method: "POST",
          }
        ),
        fetch(
          `https://kiko-test.replit.app/cpm-analysis?campaign_id=${campaignId}`,
          {
            method: "POST",
          }
        ),
      ]);

      if (!audienceResponse.ok || !cpmResponse.ok) {
        throw new Error("Failed to fetch analysis data");
      }

      const audienceResult = await audienceResponse.json();
      const cpmResult = await cpmResponse.json();

      setAudienceData(audienceResult);
      setCpmData(cpmResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchAnalysisData();
    }

    const { data } = supabase.storage
      .from("screenshots")
      .getPublicUrl("instagram/mikaylasbookcorner.png");

    if (data && data.publicUrl) {
      // Make sure the URL is properly encoded
      const url = new URL(data.publicUrl);
      setCreatorImage(url.toString());
    }
  }, [campaignId]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return `$${num.toFixed(2)}`;
  };

  const timelineStages = [
    {
      value: "qualitative",
      label: "Qualitative",
      count: audienceData?.micro_segments?.length || 0,
    },
    {
      value: "quantitative",
      label: "Quantitative",
      count: cpmData?.table?.length || 0,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading analysis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white playfair-font">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="relative w-full h-16 flex items-center">
          {/* Centered Toggle Row */}
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="flex flex-row items-center gap-8">
              <span className="text-gray-700 font-medium cursor-default">
                Community
              </span>
              <div className="h-5 w-8 flex items-center justify-center border border-md border-red-500 rounded-full bg-white shadow">
                <div className="scale-50">
                  <Component
                    checked={currentStage === "quantitative"}
                    onToggle={(checked) =>
                      setCurrentStage(checked ? "quantitative" : "qualitative")
                    }
                  />
                </div>
              </div>
              <span className="text-gray-700 font-medium cursor-default">
                Numbers
              </span>
            </div>
          </div>

          {/* Run Analysis Button aligned right */}
          <div className="ml-auto pr-4">
            <GradientButton
              className="gradient-button"
              onClick={fetchAnalysisData}
            >
              Run Analysis
            </GradientButton>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {currentStage === "qualitative" && audienceData && (
          <div className="space-y-8">
            {/* Macro Persona */}
            <div className="text-center max-w-4xl mx-auto">
              {audienceData.title && (
                <h1 className="text-2xl font-bold mb-4">
                  {audienceData.title}
                </h1>
              )}
              {audienceData.macro_persona && (
                <p className="text-gray-700 leading-relaxed">
                  {audienceData.macro_persona}
                </p>
              )}
            </div>

            {/* Micro Personas */}
            {audienceData.micro_segments &&
              audienceData.micro_segments.length > 0 && (
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-6">
                    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm cursor-default">
                      Personas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {audienceData.micro_segments
                      .slice(0, 3)
                      .map((segment, index) => {
                        const toggleStates = [
                          viewPersona1Creators,
                          viewPersona2Creators,
                          viewPersona3Creators,
                        ];
                        const setToggleStates = [
                          setViewPersona1Creators,
                          setViewPersona2Creators,
                          setViewPersona3Creators,
                        ];

                        // Updated toggle logic: only one can be true at a time
                        const handleToggle = (checked: boolean) => {
                          setViewPersona1Creators(
                            index === 0 ? checked : false
                          );
                          setViewPersona2Creators(
                            index === 1 ? checked : false
                          );
                          setViewPersona3Creators(
                            index === 2 ? checked : false
                          );
                        };

                        return (
                          <CardSpotlight
                            key={index}
                            className="h-96 w-96 flex flex-col justify-between"
                          >
                            <div>
                              <p className="text-xl font-bold relative z-20 mt-2 text-black cursor-default">
                                {segment?.segment || "Unknown Segment"}
                              </p>
                              <div className="text-black mt-4 relative z-20 cursor-default">
                                {segment?.views_pool_share_percent || 0}% Views
                                Pool Share
                                <ul className="list-none mt-2">
                                  {(segment?.core_interests || []).map(
                                    (interest, idx) => (
                                      <Step key={idx} title={interest} />
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>

                            <div className="mt-6 flex flex-col items-center">
                              <p className="text-sm text-gray-600 mb-2">
                                View Creators
                              </p>
                              <div className="h-5 w-8 flex items-center justify-center border border-md border-red-500 rounded-full bg-white shadow">
                                <div className="scale-50">
                                  <Component
                                    checked={toggleStates[index]}
                                    onToggle={handleToggle}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardSpotlight>
                        );
                      })}
                  </div>
                </div>
              )}

            {viewPersona1Creators && (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center justify-items-center mx-10">
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center justify-items-center mx-10">
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center justify-items-center mx-10">
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
              </div>
              </>
            )}
            {viewPersona2Creators && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center justify-items-center mx-10">
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
              </div>
            )}
            {viewPersona3Creators && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center justify-items-center mx-10">
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
                <HolographicCard className="w-full flex justify-center items-center">
                  <Image
                    src={creatorImage || ""}
                    alt="Creator"
                    fill
                    className="object-cover opacity-80 rounded-lg"
                  />
                </HolographicCard>
              </div>
            )}

            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6">
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm cursor-default">
                  Network Breakdown
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                <CardSpotlight className="">
                  {audienceData.network_cheatsheet?.network_breakdown && (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold relative z-20 mt-2 text-black cursor-default">
                          Deliverable Breakdown
                        </p>
                        <p className="text-xl font-bold relative z-20 mt-2 text-black cursor-default">
                          0
                        </p>
                      </div>
                      <div className="text-black mt-4 relative z-20">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Step title="Instagram Only:" />
                            <span className="font-medium cursor-default">
                              {audienceData.network_cheatsheet.network_breakdown
                                .instagram_only || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Step title="Cross Post Bundles:" />
                            <span className="font-medium cursor-default">
                              {audienceData.network_cheatsheet.network_breakdown
                                .cross_post_bundles || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Step title="Tiktok Only:" />
                            <span className="font-medium cursor-default">
                              {audienceData.network_cheatsheet.network_breakdown
                                .tiktok_only || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Step title="Youtube Only:" />
                            <span className="font-medium cursor-default">
                              {audienceData.network_cheatsheet.network_breakdown
                                .youtube_only || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardSpotlight>
              </div>
            </div>

            {/* Rate Bands */}
            {/* {audienceData.network_cheatsheet?.rate_bands && (
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold mb-4">Rate Bands</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-gray-600">{audienceData.network_cheatsheet.rate_bands}</span>
                  </div>
                </div>
              </div>
            )} */}

            {/* Deliverable Breakdown */}
            {/* {audienceData.network_cheatsheet?.network_breakdown && (
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold mb-4">Deliverable Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Instagram Only:</span>
                    <span className="font-medium">{audienceData.network_cheatsheet.network_breakdown.instagram_only || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Cross Post Bundles:</span>
                    <span className="font-medium">{audienceData.network_cheatsheet.network_breakdown.cross_post_bundles || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Tiktok Only:</span>
                    <span className="font-medium">{audienceData.network_cheatsheet.network_breakdown.tiktok_only || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Youtube Only:</span>
                    <span className="font-medium">{audienceData.network_cheatsheet.network_breakdown.youtube_only || 0}</span>
                  </div>
                </div>
              </div>
            )} */}

            {/* No Data Message */}
            {!audienceData.macro_persona &&
              (!audienceData.micro_segments ||
                audienceData.micro_segments.length === 0) &&
              !audienceData.network_cheatsheet && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg cursor-default">
                    No qualitative analysis data available
                  </p>
                </div>
              )}
          </div>
        )}

        {currentStage === "quantitative" && cpmData && (
          <div className="space-y-8">
            {/* Cheatsheet */}
            {cpmData.key_takeaways?.cheatsheet && (
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 cursor-default">
                  Cheatsheet
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <GridBackground
                    title={formatCurrency(
                      cpmData.key_takeaways.cheatsheet.low_cpm || 0
                    )}
                    className="cursor-default"
                    description="Low CPM"
                  />

                  <GridBackground
                    title={formatCurrency(
                      cpmData.key_takeaways.cheatsheet.high_cpm || 0
                    )}
                    className="cursor-default"
                    description="High CPM"
                  />

                  <GridBackground
                    title={formatCurrency(
                      cpmData.key_takeaways.cheatsheet.median_cpm || 0
                    )}
                    className="cursor-default"
                    description="Median CPM"
                  />

                  <GridBackground
                    title={formatCurrency(
                      cpmData.key_takeaways.cheatsheet.average_cpm || 0
                    )}
                    className="cursor-default"
                    description="Average CPM"
                  />
                </div>
              </div>
            )}

            {/* Key Takeaways */}
            {cpmData.key_takeaways && (
              <div className="max-w-6xl mx-auto">
                <h3 className="text-xl font-bold mb-6 cursor-default">
                  Key Takeaways
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Top Performers */}
                  {cpmData.key_takeaways.top_performers &&
                    cpmData.key_takeaways.top_performers.length > 0 && (
                      <CardSpotlight color={"#BBF7D0"} className="h-96 w-96">
                        <p className="text-xl font-bold relative z-20 mt-2 text-green-800 cursor-default">
                          Top Performers
                        </p>
                        <div className="text-black mt-4 relative z-20">
                          <ul className="list-none  mt-2 flex flex-col gap-2">
                            {cpmData.key_takeaways.top_performers.map(
                              (performer, index) => (
                                <div key={index} className="">
                                  <div className="font-medium text-green-800 text-lg mt-1 cursor-default">
                                    {performer?.note || ""}
                                  </div>
                                  <div className="font-normal text-green-700 text-md cursor-default">
                                    {performer?.creator || "Unknown"}
                                  </div>
                                  <div className="font-normal text-md text-green-700 cursor-default">
                                    CPM:{" "}
                                    {formatCurrency(performer?.cpm_usd || 0)}
                                  </div>
                                </div>
                              )
                            )}
                          </ul>
                        </div>
                      </CardSpotlight>
                    )}

                  {/* Solid Value */}
                  {cpmData.key_takeaways.solid_value &&
                    cpmData.key_takeaways.solid_value.length > 0 && (
                      <CardSpotlight color={"#BFDBFE"} className="h-96 w-96">
                        <p className="text-xl font-bold relative z-20 mt-2 text-blue-800 cursor-default">
                          Solid Value
                        </p>
                        <div className="text-black mt-4 relative z-20">
                          <ul className="list-none mt-2 flex flex-col gap-2">
                            {cpmData.key_takeaways.solid_value.map(
                              (performer, index) => (
                                <div key={index} className="">
                                  <div className="font-medium text-blue-800 text-lg mt-1 cursor-default">
                                    {performer?.note || ""}
                                  </div>
                                  <div className="font-normal text-blue-700 text-md cursor-default">
                                    {performer?.creator || "Unknown"}
                                  </div>
                                  <div className="font-normal text-blue-700 text-md cursor-default">
                                    CPM:{" "}
                                    {formatCurrency(performer?.cpm_usd || 0)}
                                  </div>
                                </div>
                              )
                            )}
                          </ul>
                        </div>
                      </CardSpotlight>
                    )}

                  {/* Caution Zone */}
                  {cpmData.key_takeaways.caution_zone &&
                    cpmData.key_takeaways.caution_zone.length > 0 && (
                      <CardSpotlight color={"#d0516fff"} className="h-96 w-96">
                        <p className="text-xl font-bold relative z-20 mt-2 text-red-800 cursor-default">
                          Caution Zone
                        </p>
                        <div className="text-black mt-4 relative z-20">
                          <ul className="list-none mt-2 flex flex-col gap-2">
                            {cpmData.key_takeaways.caution_zone.map(
                              (performer, index) => (
                                <div key={index} className="">
                                  <div className="font-medium text-lg text-red-800 mt-1 cursor-default">
                                    {performer?.note || ""}
                                  </div>
                                  <div className="font-normal text-red-700 text-md cursor-default">
                                    {performer?.creator || "Unknown"}
                                  </div>
                                  <div className="font-normal text-red-700 text-md cursor-default">
                                    CPM:{" "}
                                    {formatCurrency(performer?.cpm_usd || 0)}
                                  </div>
                                </div>
                              )
                            )}
                          </ul>
                        </div>
                      </CardSpotlight>
                    )}
                </div>
              </div>
            )}

            {/* Creator Performance Table */}
            {cpmData.table && cpmData.table.length > 0 && (
              <div className="max-w-6xl mx-auto">
                <h3 className="text-xl font-bold mb-6 cursor-default">
                  Creator Performance
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left cursor-default">
                          Rank
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left cursor-default">
                          Handle
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left cursor-default">
                          Rate (USD)
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left cursor-default">
                          CPM (USD)
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left cursor-default">
                          Mean Views
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left cursor-default">
                          Brand Fit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cpmData.table.map((creator, index) => (
                        <tr
                          key={creator?.rank || index}
                          className="hover:bg-gray-50"
                        >
                          <td className="border border-gray-200 px-4 py-2 cursor-default">
                            {creator?.rank || "-"}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 cursor-default font-medium">
                            {creator?.handle || "Unknown"}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 cursor-default">
                            ${Number(creator?.rate_usd || 0).toLocaleString()}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 cursor-default">
                            {formatCurrency(creator?.cpm_usd || 0)}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 cursor-default">
                            {formatNumber(creator?.mean_views || 0)}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 cursor-default">
                            {creator?.brand_fit || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Data Message */}
            {!cpmData.key_takeaways &&
              (!cpmData.table || cpmData.table.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No quantitative analysis data available
                  </p>
                </div>
              )}
          </div>
        )}

        {/* No data at all message */}
        {currentStage === "qualitative" && !audienceData && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg cursor-default">
              No qualitative analysis data available
            </p>
            <p className="text-gray-400 text-sm mt-2 cursor-default">
              Click &quot;Run Analysis&quot; to generate analysis data
            </p>
          </div>
        )}

        {currentStage === "quantitative" && !cpmData && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg cursor-default">
              No quantitative analysis data available
            </p>
            <p className="text-gray-400 text-sm mt-2 cursor-default">
              Click &quot;Run Analysis&quot; to generate analysis data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const Step = ({ title }: { title: string }) => {
  return (
    <li className="flex gap-2 items-start">
      <CheckIcon />
      <p className="text-black cursor-default">{title}</p>
    </li>
  );
};

const CheckIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-[#FFA87D] mt-1 flex-shrink-0 cursor-default"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M12 2c-.218 0 -.432 .002 -.642 .005l-.616 .017l-.299 .013l-.579 .034l-.553 .046c-4.785 .464 -6.732 2.411 -7.196 7.196l-.046 .553l-.034 .579c-.005 .098 -.01 .198 -.013 .299l-.017 .616l-.004 .318l-.001 .324c0 .218 .002 .432 .005 .642l.017 .616l.013 .299l.034 .579l.046 .553c.464 4.785 2.411 6.732 7.196 7.196l.553 .046l.579 .034c.098 .005 .198 .01 .299 .013l.616 .017l.642 .005l.642 -.005l.616 -.017l.299 -.013l.579 -.034l.553 -.046c4.785 -.464 6.732 -2.411 7.196 -7.196l.046 -.553l.034 -.579c.005 -.098 .01 -.198 .013 -.299l.017 -.616l.005 -.642l-.005 -.642l-.017 -.616l-.013 -.299l-.034 -.579l-.046 -.553c-.464 -4.785 -2.411 -6.732 -7.196 -7.196l-.553 -.046l-.579 -.034a28.058 28.058 0 0 0 -.299 -.013l-.616 -.017l-.318 -.004l-.324 -.001zm2.293 7.293a1 1 0 0 1 1.497 1.32l-.083 .094l-4 4a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 1.32 -1.497l.094 .083l1.293 1.292l3.293 -3.292z"
        fill="currentColor"
        strokeWidth="0"
      />
    </svg>
  );
};
