"use client";

import CreatorDashboard from "@/components/dashboard";
import React, { useEffect, useState } from "react";
import { Campaign } from "@/types";
import axiosInstance from "@/lib/axios";
import { useParams } from "next/navigation";

const CampaignPage = () => {
  const [fetchedCampaign, setFetchedCampaign] = useState<Campaign | null>(null);
  const params = useParams();
  const campaignId = params.id as string;

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await axiosInstance.get(
          `/campaigns/${campaignId}/overview`
        );
        setFetchedCampaign(response.data);
      } catch (error) {
        console.error("Failed to fetch campaign", error);
      }
    };

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  if (!fetchedCampaign) return <div>Loading...</div>;

  return <CreatorDashboard campaign={fetchedCampaign} />;
};

export default CampaignPage;
