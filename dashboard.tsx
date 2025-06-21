"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MousePointer,
  Settings,
  Target,
  Download,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CreatorsTable from "./creators-table";
import Navigation from "./navigation";
import CampaignsView from "./campaigns-view";
import ConversationsView from "./conversations-view";
import { useRouter } from "next/navigation";

// Platform data
const platformData = {
  instagram: {
    progress: 75,
    status: "error",
    step: "on-network",
    totalTime: "2h 34m",
    lastAction: "Browsing Network",
  },
  tiktok: {
    progress: 60,
    status: "error",
    step: "on-network",
    totalTime: "1h 45m",
    lastAction: "Browsing Network",
  },
  youtube: {
    progress: 85,
    status: "error",
    step: "on-network",
    totalTime: "3h 12m",
    lastAction: "Browsing Network",
  },
};

// Campaign data
const campaigns = [
  { id: "fitness-influencers", name: "Fitness Influencers", type: "Search" },
  { id: "tech-reviewers", name: "Tech Reviewers", type: "Similar" },
  { id: "lifestyle-creators", name: "Lifestyle Creators", type: "Search" },
  { id: "gaming-streamers", name: "Gaming Streamers", type: "Similar" },
];

const statusOptions = [
  { id: "all", name: "All Status" },
  { id: "active", name: "Active" },
  { id: "error", name: "Error" },
  { id: "completed", name: "Completed" },
];

// Summary data
const summaryData = {
  totalGoodFitCreators: 1247,
  runsByNetwork: {
    instagram: 8,
    tiktok: 6,
    youtube: 4,
  },
  creatorsByNetwork: {
    instagram: 542,
    tiktok: 389,
    youtube: 316,
  },
};

// Campaign status summary
const campaignStatusSummary = {
  instagram: {
    active: 3,
    completed: 4,
    error: 1,
  },
  tiktok: {
    active: 2,
    completed: 3,
    error: 1,
  },
  youtube: {
    active: 1,
    completed: 2,
    error: 1,
  },
};

interface CreatorDashboardProps {
  title: string;
}

export default function CreatorDashboard({ title }: CreatorDashboardProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedRun, setSelectedRun] = React.useState<string>("");
  const [currentView, setCurrentView] = React.useState<
    "dashboard" | "creators"
  >("dashboard");
  const [currentNavView, setCurrentNavView] = React.useState<
    "research" | "campaigns" | "conversations"
  >("research");

  const handleDownloadCSV = (runName: string, platform: string) => {
    // Simulate CSV download
    console.log(`Downloading CSV for ${runName} on ${platform}`);
    // In a real app, this would trigger an actual download
  };

  const handleViewCreators = () => {
    setCurrentView("creators");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  const handleNavigation = (
    view: "research" | "campaigns" | "conversations"
  ) => {
    setCurrentNavView(view);
    console.log("A");
    if (view === "research") {
      router.push(`/`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentView={currentNavView}
        onNavigate={handleNavigation}
        title={title}
      />
      <div className="p-6">
        {currentView === "creators" ? (
          <CreatorsTable onBack={handleBackToDashboard} />
        ) : currentNavView === "campaigns" ? (
          <CampaignsView />
        ) : currentNavView === "conversations" ? (
          <ConversationsView />
        ) : (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* View Creators Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleViewCreators}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                View Creators
              </Button>
            </div>

            {/* Rest of the existing dashboard content remains the same */}
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Total Good-fit Creators Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Good-fit Creators Identified
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summaryData.totalGoodFitCreators.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Creators identified to date
                  </p>
                </CardContent>
              </Card>

              {/* Research Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Research Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        <span className="text-sm font-medium">Instagram</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {summaryData.creatorsByNetwork.instagram} creators
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {summaryData.runsByNetwork.instagram} runs
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        <span className="text-sm font-medium">TikTok</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {summaryData.creatorsByNetwork.tiktok} creators
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {summaryData.runsByNetwork.tiktok} runs
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">YouTube</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {summaryData.creatorsByNetwork.youtube} creators
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {summaryData.runsByNetwork.youtube} runs
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Status Summary - Separate Cards */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Campaign Status</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {/* Instagram Status Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <CardTitle className="text-base font-medium">
                        Instagram
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Active
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {campaignStatusSummary.instagram.active}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Completed
                      </span>
                      <span className="text-lg font-bold">
                        {campaignStatusSummary.instagram.completed}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Error
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        {campaignStatusSummary.instagram.error}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* TikTok Status Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-black rounded-full"></div>
                      <CardTitle className="text-base font-medium">
                        TikTok
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Active
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {campaignStatusSummary.tiktok.active}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Completed
                      </span>
                      <span className="text-lg font-bold">
                        {campaignStatusSummary.tiktok.completed}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Error
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        {campaignStatusSummary.tiktok.error}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* YouTube Status Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <CardTitle className="text-base font-medium">
                        YouTube
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Active
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {campaignStatusSummary.youtube.active}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Completed
                      </span>
                      <span className="text-lg font-bold">
                        {campaignStatusSummary.youtube.completed}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Error
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        {campaignStatusSummary.youtube.error}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Platform Tabs */}
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="instagram" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="instagram"
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      Instagram
                    </TabsTrigger>
                    <TabsTrigger
                      value="tiktok"
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                      TikTok
                    </TabsTrigger>
                    <TabsTrigger
                      value="youtube"
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      YouTube
                    </TabsTrigger>
                  </TabsList>

                  {Object.entries(platformData).map(([platform, data]) => (
                    <TabsContent
                      key={platform}
                      value={platform}
                      className="space-y-4 mt-6"
                    >
                      {/* Status Selector and Runs Accordion */}
                      <div className="space-y-4">
                        <Select
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Runs Accordion */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Runs
                          </h3>
                          <Accordion
                            type="single"
                            collapsible
                            value={selectedRun}
                            onValueChange={setSelectedRun}
                          >
                            {campaigns.map((campaign) => (
                              <AccordionItem
                                key={campaign.id}
                                value={campaign.id}
                              >
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                      {campaign.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        campaign.type === "Search"
                                          ? "bg-blue-50 text-blue-700 border-blue-200"
                                          : "bg-purple-50 text-purple-700 border-purple-200"
                                      }`}
                                    >
                                      {campaign.type}
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  {/* Content for when accordion is expanded */}
                                  <div className="space-y-4 pt-2">
                                    {/* Download CSV Button */}
                                    <div className="flex justify-end">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleDownloadCSV(
                                            campaign.name,
                                            platform
                                          )
                                        }
                                        className="flex items-center gap-2"
                                      >
                                        <Download className="h-4 w-4" />
                                        Download CSV
                                      </Button>
                                    </div>

                                    {/* Step Card */}
                                    <Card>
                                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                          Step
                                        </CardTitle>
                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                      </CardHeader>
                                      <CardContent>
                                        <div className="text-2xl font-bold">
                                          {data.step}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          Current processing step
                                        </p>
                                      </CardContent>
                                    </Card>

                                    <div className="grid gap-4 grid-cols-3">
                                      {/* Status Card */}
                                      <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                          <CardTitle className="text-sm font-medium">
                                            Status
                                          </CardTitle>
                                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-2">
                                            <Badge
                                              variant="destructive"
                                              className="bg-red-100 text-red-800 hover:bg-red-100"
                                            >
                                              {data.status}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                              Error: Evaluation
                                            </p>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      {/* Total Research Time Card */}
                                      <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                          <CardTitle className="text-sm font-medium">
                                            Total Research Time
                                          </CardTitle>
                                          <Clock className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                          <div className="text-2xl font-bold">
                                            {data.totalTime}
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            Active research session
                                          </p>
                                        </CardContent>
                                      </Card>

                                      {/* Actions Card */}
                                      <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                          <CardTitle className="text-sm font-medium">
                                            Actions
                                          </CardTitle>
                                          <MousePointer className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                          <div className="text-2xl font-bold">
                                            {data.lastAction}
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            Just now
                                          </p>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Dropoff Card */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">
                                          Dropoff
                                        </CardTitle>
                                        <CardDescription>
                                          Creator filtering and qualification
                                          process
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-3">
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-green-600">
                                              Good Creators Found:
                                            </span>
                                            <span className="text-sm font-bold">
                                              325
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                              Total profiles from network:
                                            </span>
                                            <span className="text-sm">
                                              1,987
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                              Brands removed:
                                            </span>
                                            <span className="text-sm">
                                              322{" "}
                                              <span className="text-xs text-muted-foreground">
                                                (1,665 left)
                                              </span>
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                              Not a good fit:
                                            </span>
                                            <span className="text-sm">
                                              1,022{" "}
                                              <span className="text-xs text-muted-foreground">
                                                (643 left)
                                              </span>
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                              No email accounts removed:
                                            </span>
                                            <span className="text-sm">
                                              318{" "}
                                              <span className="text-xs text-muted-foreground">
                                                (325 left)
                                              </span>
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                              Follower count removed:
                                            </span>
                                            <span className="text-sm">
                                              0{" "}
                                              <span className="text-xs text-muted-foreground">
                                                (325 left)
                                              </span>
                                            </span>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
