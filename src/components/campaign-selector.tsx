"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Instagram, Youtube, Music } from "lucide-react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Campaign } from "@/types";

export default function Component() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<
    "existing" | "new" | null
  >(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<
    "similar" | "search" | null
  >(null);
  const [accounts, setAccounts] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [campaignName, setCampaignName] = useState("");

  const platformSectionRef = useRef<HTMLDivElement>(null);
  const evaluationSectionRef = useRef<HTMLDivElement>(null);
  const methodSectionRef = useRef<HTMLDivElement>(null);
  const accountsSectionRef = useRef<HTMLDivElement>(null);
  const [existingCampaigns, setExistingCampaigns] = useState<Campaign[] | null>(
    null
  );
  const [langfusePrompts, setLangfusePrompts] = useState<string[]>([]);

  // Add filter states at the top, after other useState hooks
  const [filterFollowerEnabled, setFilterFollowerEnabled] = useState(false);
  const [filterCountriesEnabled, setFilterCountriesEnabled] = useState(false);
  const [followerMin, setFollowerMin] = useState("");
  const [followerMax, setFollowerMax] = useState("");
  const [countryInput, setCountryInput] = useState("");
  const [countries, setCountries] = useState<string[]>([]);

  const platforms = [
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "bg-pink-500",
    },
    { id: "tiktok", name: "TikTok", icon: Music, color: "bg-black" },
    { id: "youtube", name: "YouTube", icon: Youtube, color: "bg-red-500" },
  ];

  const evaluationOptions = langfusePrompts.length > 0
    ? langfusePrompts.map((prompt) => ({ value: prompt, label: prompt }))
    : [
        { value: "engagement", label: "Engagement Rate" },
        { value: "reach", label: "Reach & Impressions" },
        { value: "authenticity", label: "Authenticity Score" },
        { value: "brand-fit", label: "Brand Fit Analysis" },
        { value: "audience-quality", label: "Audience Quality" },
      ];

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const createCampaign = async (method: string) => {
    setIsLoading(true);
    try {
      console.log("Creating campaign with method:", method);
      if(selectedCampaign){
        // If an existing campaign is selected, we can directly create a run
        const response = await axiosInstance.post(
          `/campaigns/${selectedCampaign.campaign_id}/runs`,
          {
            run_name: `${selectedCampaign.campaign_name} ${method}`,
            platform: selectedPlatform,
            discovery_method: method,
            input_list: accounts.split("\n").map((acc) => acc.trim()).filter(Boolean),
            prompt_id: selectedEvaluation,
            country_list: countries
          }
        );

        console.log("Run created:", response);
        router.push(`/Campaign/${selectedCampaign.campaign_id}`);
      }else{
        // If no existing campaign is selected, we need to create a new campaign first
        if (!campaignName.trim()) {
          alert("Please enter a campaign name");
          setIsLoading(false);
          return;
        }

        const response = await axiosInstance.post("/campaigns", {
          campaign_name: campaignName,
        });

        const newCampaign: Campaign = response.data;

        if (newCampaign?.campaign_id) {
          const runResponse = await axiosInstance.post(
            `/campaigns/${newCampaign.campaign_id}/runs`,
            {
              run_name: `${newCampaign.campaign_name} ${method}`,
              platform: selectedPlatform,
              discovery_method: method,
              input_list: accounts.split("\n").map((acc) => acc.trim()).filter(Boolean),
              prompt_id: selectedEvaluation,
              minimum_followers: Number(followerMin),
              maximum_followers: Number(followerMax),
              country_list: countries

            }
          );

          console.log("Run created:", runResponse);
          setSelectedCampaign(newCampaign);
          router.push(`/Campaign/${newCampaign.campaign_id}`);
        }
      }
      
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const getLangfuseprompts = async () => {
    try {
      const response = await axiosInstance.get("/langfuse/prompts");
      if (response.data && Array.isArray(response.data)) {
        setLangfusePrompts(response.data);
      }
    } catch (error) {
      console.error("Error fetching Langfuse prompts:", error);
    }
  }

  const fetchActiveCampaigns = async () => {
    try {
      const response = await axiosInstance.get("/campaigns");

      setExistingCampaigns(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchActiveCampaigns();
    getLangfuseprompts(); 
  }, []);

  // Add a color palette for country tags
  const countryColors = [
    'bg-green-100 text-green-800',
    'bg-blue-100 text-blue-800',
    'bg-yellow-100 text-yellow-800',
    'bg-pink-100 text-pink-800',
    'bg-purple-100 text-purple-800',
    'bg-red-100 text-red-800',
    'bg-indigo-100 text-indigo-800',
    'bg-teal-100 text-teal-800',
    'bg-orange-100 text-orange-800',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Current Campaigns Dropdown */}

        {/* Select Campaign Option */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create a new campaign</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedOption === "existing" ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => {
                setSelectedOption("existing");
                setSelectedPlatform(null);
                setSelectedEvaluation(null);
                setSelectedMethod(null);
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-full" />
                  </div>
                  Choose Existing Campaign
                </CardTitle>
                <CardDescription>
                  Select from your previously created campaigns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedOption === "new" ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => {
                setSelectedCampaign(null);
                setSelectedOption("new");
                // Scroll will happen when campaign name is entered
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-green-600" />
                  </div>
                  Create New Campaign
                </CardTitle>
                <CardDescription>
                  Start fresh with a new campaign setup
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Campaigns</h2>
          <div className="space-y-2">
            <Select
              value={selectedCampaign?.campaign_id?.toString() || ""}
              onValueChange={(value) => {
                const campaign = existingCampaigns?.find(
                  (c) =>
                    typeof c.campaign_id !== "undefined" &&
                    c.campaign_id.toString() === value
                );
                if (campaign) {
                  setSelectedCampaign(campaign);
                  if (selectedOption === "existing") {
                    scrollToSection(platformSectionRef);
                  } else {
                    router.push(`/Campaign/${campaign.campaign_id}`);
                  }
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {existingCampaigns?.map((campaign) => {
                  if (!campaign.campaign_name) return null;
                  return (
                    <SelectItem
                      key={campaign.campaign_id}
                      value={campaign.campaign_id?.toString() ?? ""}
                    >
                      {campaign.campaign_name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Existing Campaigns */}
        {false && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Existing Campaigns</h2>
            <div className="grid gap-4">
              {existingCampaigns &&
                existingCampaigns?.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      scrollToSection(platformSectionRef);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {campaign.created_at}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* New Campaign Flow */}
        {selectedOption === "new" && (
          <div className="space-y-8">
            {/* Campaign Name Input */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Campaign Name</h2>
              <div className="space-y-2">
                <Label htmlFor="campaignName">
                  Enter a name for your new campaign:
                </Label>
                <input
                  id="campaignName"
                  type="text"
                  placeholder="e.g., Spring Fashion 2024"
                  value={campaignName}
                  onChange={(e) => {
                    setCampaignName(e.target.value);
                    if (e.target.value.trim()) {
                      scrollToSection(platformSectionRef);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Campaign Header - shows selected campaign name */}
        {(selectedCampaign ||
          (selectedOption === "new" && campaignName.trim())) && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="text-center">
              <h3
                className="text-lg font-semibold text-primary"
                onClick={() => console.log("campaign_id", selectedCampaign)}
              >
                {selectedCampaign
                  ? selectedCampaign.campaign_name
                  : campaignName}
              </h3>
            </div>
          </div>
        )}

        {/* For existing campaigns or new campaigns with name */}
        {(selectedCampaign ||
          (selectedOption === "new" && campaignName.trim())) && (
          <div className="space-y-8">
            {/* Choose Platform */}
            <div className="space-y-4" ref={platformSectionRef}>
              <h2 className="text-xl font-semibold">Choose Platform</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {platforms.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <Card
                      key={platform.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPlatform === platform.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedPlatform(platform.id);
                        scrollToSection(methodSectionRef);
                      }}
                    >
                      <CardContent className="p-6 text-center space-y-2">
                        <div
                          className={`w-12 h-12 ${platform.color} rounded-full flex items-center justify-center mx-auto`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-medium">{platform.name}</h3>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Choose Discovery Method */}
            {selectedPlatform && (
              <div className="space-y-4" ref={methodSectionRef}>
                <h2 className="text-xl font-semibold">
                  Choose Discovery Method
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedMethod === "similar" ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      
                      setSelectedMethod("similar");
                      scrollToSection(evaluationSectionRef);
                    }}
                  >
                    <CardHeader>
                      <CardTitle>Find Similar</CardTitle>
                    </CardHeader>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedMethod === "search" ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedMethod("search");
                      scrollToSection(evaluationSectionRef);
                    }}
                  >
                    <CardHeader>
                      <CardTitle>Search</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            )}

            {/* Evaluation */}
            {selectedMethod && (
              <div className="space-y-4" ref={evaluationSectionRef}>
                <h2 className="text-xl font-semibold">Evaluate</h2>
                <div className="space-y-2">
                  <Select
                    value={selectedEvaluation || ""}
                    onValueChange={(value) => {
                      setSelectedEvaluation(value);
                      scrollToSection(accountsSectionRef);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose Evaluator" />
                    </SelectTrigger>
                    <SelectContent>
                      {evaluationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {/* Filtering Section */}
            {selectedMethod && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Filtering</h2>
                <div className="p-4 border rounded-lg space-y-6">
                  {/* Follower Count */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Follower Count</Label>
                      <button
                        type="button"
                        className={`w-10 cursor-pointer h-6 rounded-full ${filterFollowerEnabled ? "bg-black" : "bg-gray-300"} flex items-center`}
                        onClick={() => setFilterFollowerEnabled((v) => !v)}
                      >
                        <span
                          className={`block ml-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${filterFollowerEnabled ? "translate-x-4" : ""}`}
                        />
                      </button>
                    </div>
                    {filterFollowerEnabled && (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Minimum"
                          value={followerMin}
                          onChange={(e) => setFollowerMin(e.target.value)}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Maximum"
                          value={followerMax}
                          onChange={(e) => setFollowerMax(e.target.value)}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                  {/* Countries */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label onClick={() => {
                        console.log("Countries clicked", countries);
                      }}>Countries</Label>
                      <button
                        type="button"
                        className={`w-10 cursor-pointer h-6 rounded-full ${filterCountriesEnabled ? "bg-black" : "bg-gray-300"} flex items-center`}
                        onClick={() => setFilterCountriesEnabled((v) => !v)}
                      >
                        <span
                          className={`block ml-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${filterCountriesEnabled ? "translate-x-4" : ""}`}
                        />
                      </button>
                    </div>
                    {filterCountriesEnabled && (
                      <div className="flex border border-gray-300 rounded-md shadow-sm p-2 flex-wrap gap-2 mb-2">
                        {countries.map((country, idx) => (
                          <span
                            key={country}
                            className={`flex items-center px-3 py-1 rounded-full text-sm ${countryColors[idx % countryColors.length]}`}
                          >
                            {country}
                            <button
                              type="button"
                              className="ml-2 cursor-pointer text-gray-500 hover:text-red-500"
                              onClick={() => setCountries(countries.filter((c, i) => i !== idx))}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder="Type and press space..."
                          value={countryInput}
                          onChange={(e) => setCountryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (
                              (e.key === " " || e.key === "Enter") &&
                              countryInput.trim() &&
                              !countries.includes(countryInput.trim().toLowerCase())
                            ) {
                              setCountries([...countries, countryInput.trim().toLowerCase()]);
                              setCountryInput("");
                              e.preventDefault();
                            }
                          }}
                          className="flex-1 min-w-[180px] px-3 py-2 rounded-md focus:outline-black"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* List Accounts */}
            {selectedEvaluation && (
              <div className="space-y-4" ref={accountsSectionRef}>
                <h2 className="text-xl font-semibold">
                  {selectedMethod === "similar"
                    ? "List Reference Accounts"
                    : "List Target Terms"}
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="accounts">
                    {selectedMethod === "similar"
                      ? "Enter accounts you want to find similar influencers to (one per line):"
                      : "Enter account names or keywords to search for (one per line):"}
                  </Label>
                  <Textarea
                    id="accounts"
                    placeholder={
                      selectedMethod === "similar"
                        ? "example_account\nanother_account\nreference_account"
                        : "@target_account\nfashion blogger\ntech reviewer"
                    }
                    value={accounts}
                    onChange={(e) => setAccounts(e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    disabled={!accounts.trim() || isLoading}
                    onClick={() => {
                      createCampaign(selectedMethod || "similar");
                    }}
                  >
                    Start Research
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
