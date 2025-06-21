"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Instagram,
  Youtube,
  Music,
  Search,
  Target,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Component() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<
    "existing" | "new" | null
  >(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<string | null>(
    null
  );
  const [selectedMethod, setSelectedMethod] = useState<
    "similar" | "search" | null
  >(null);
  const [accounts, setAccounts] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [currentNavView, setCurrentNavView] = useState<
    "research" | "campaigns" | "conversations"
  >("research");

  const platformSectionRef = useRef<HTMLDivElement>(null);
  const evaluationSectionRef = useRef<HTMLDivElement>(null);
  const methodSectionRef = useRef<HTMLDivElement>(null);
  const accountsSectionRef = useRef<HTMLDivElement>(null);

  const navItems = [
    {
      id: "research" as const,
      label: "Research",
      icon: Search,
    },
    {
      id: "campaigns" as const,
      label: "Campaigns",
      icon: Target,
    },
    {
      id: "conversations" as const,
      label: "Conversations",
      icon: MessageSquare,
    },
  ];

  const existingCampaigns = [
    {
      id: 1,
      name: "Summer Fashion 2024",
      createdDate: "March 15, 2024",
    },
    {
      id: 2,
      name: "Tech Review Series",
      createdDate: "February 28, 2024",
    },
    {
      id: 3,
      name: "Dance Challenge",
      createdDate: "January 10, 2024",
    },
  ];

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

  const evaluationOptions = [
    { value: "engagement", label: "Engagement Rate" },
    { value: "reach", label: "Reach & Impressions" },
    { value: "authenticity", label: "Authenticity Score" },
    { value: "brand-fit", label: "Brand Fit Analysis" },
    { value: "audience-quality", label: "Audience Quality" },
  ];

  const onNavigate = (view: "research" | "campaigns" | "conversations") => {
    setCurrentNavView(view);
    if (view === "research") {
      setCurrentView("dashboard");
    }
  };

  const resetSelections = () => {
    setSelectedOption(null);
    setSelectedCampaign(null);
    setCampaignName("");
    setSelectedPlatform(null);
    setSelectedEvaluation(null);
    setSelectedMethod(null);
    setAccounts("");
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const getSelectedCampaignName = () => {
    if (selectedCampaign) {
      const campaign = existingCampaigns.find((c) => c.id === selectedCampaign);
      return campaign?.name || "";
    }
    return campaignName;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-end h-16">
            {/* Navigation Items */}
            <div className="flex items-center justify-end space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentNavView === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => onNavigate(item.id)}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Current Campaigns Dropdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Campaigns</h2>
          <div className="space-y-2">
            <Select
              value={selectedCampaign?.toString() || ""}
              onValueChange={(value) => {
                const campaignId = Number.parseInt(value);
                setSelectedCampaign(campaignId);

                const campaign = existingCampaigns.find(
                  (c) => c.id === campaignId
                );
                if (campaign) {
                  router.push(
                    `/Campaign?campaign=${encodeURIComponent(campaign.name)}`
                  );
                }

                scrollToSection(platformSectionRef);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {existingCampaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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

        {/* Existing Campaigns */}
        {false && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Existing Campaigns</h2>
            <div className="grid gap-4">
              {existingCampaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => {
                    setSelectedCampaign(campaign.id);
                    scrollToSection(platformSectionRef);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {campaign.createdDate}
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
              <h3 className="text-lg font-semibold text-primary">
                {getSelectedCampaignName()}
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
                    disabled={!accounts.trim()}
                    onClick={() => {
                      router.push(
                        `/Campaign?campaign=${encodeURIComponent(campaignName)}`
                      );
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
