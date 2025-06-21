"use client";
import React, { useEffect, useState } from "react";
import CreatorDashboard from "../../dashboard";

const Campaign = () => {
  const [campaign, setCampaign] = useState<string | "">("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setCampaign(params.get("campaign") || "");
    }
  }, []);
  return <CreatorDashboard title={campaign} />;
};

export default Campaign;
