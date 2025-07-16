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
import CampaignsView from "./campaigns-view";
import ConversationsView from "./conversations-view";
import { Campaign } from "@/types";
import axiosInstance from "@/lib/axios";
import { Run, RunDetails } from "@/types/run_details";

interface ResearchOverview {
  platform: string;
  total_creators_found_on_platform: number;
  total_runs_on_platform: number;
}

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

const statusOptions = [
  { id: "all", name: "All Status" },
  { id: "active", name: "Active" },
  { id: "error", name: "Error" },
  { id: "completed", name: "Completed" },
];

const platformColorMap: Record<string, string> = {
  instagram: "bg-pink-500",
  tiktok: "bg-black",
  youtube: "bg-red-500",
};

interface CreatorDashboardProps {
  campaign: Campaign;
}

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h > 0 ? `${h}h ` : ""}${m}m`;
}

export default function CreatorDashboard({ campaign }: CreatorDashboardProps) {
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedRun, setSelectedRun] = React.useState<string>("");
  const [runDetailsMap, setRunDetailsMap] = React.useState<
    Record<string, RunDetails>
  >({});
  const [currentView, setCurrentView] = React.useState<
    "dashboard" | "creators"
  >("dashboard");
  const [currentNavView] = React.useState<
    "research" | "campaigns" | "conversations"
  >("research");

  const campaignStatusSummary = React.useMemo(() => {
    type Platform = "instagram" | "tiktok" | "youtube";

    const summary: Record<
      Platform,
      { active: number; completed: number; error: number }
    > = {
      instagram: { active: 0, completed: 0, error: 0 },
      tiktok: { active: 0, completed: 0, error: 0 },
      youtube: { active: 0, completed: 0, error: 0 },
    };
    campaign?.campaign_status_by_platform?.forEach((status) => {
      const {
        platform,
        active_runs_count,
        completed_runs_count,
        error_runs_count,
      } = status;
      if (platform in summary) {
        summary[platform as Platform] = {
          active: active_runs_count,
          completed: completed_runs_count,
          error: error_runs_count,
        };
      }
    });
    return summary;
  }, [campaign]);
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

  const fetchRunDetails = async (campaignId: string, runId: number) => {
    const res = await axiosInstance.get<RunDetails>(
      `/campaigns/${campaignId}/runs/${runId}`
    );
    return res.data;
  };

  React.useEffect(() => {
    const run = (campaign?.runs_summary_list as Run[])?.find(
      (r) => r.run_id !== undefined && r.run_id.toString() === selectedRun
    );
    if (run?.run_id !== undefined && !runDetailsMap[run.run_id]) {
      fetchRunDetails(String(campaign.campaign_id), run.run_id!).then(
        (data) => {
          setRunDetailsMap((prev) => ({ ...prev, [run.run_id!]: data }));
        }
      );
    }
  }, [selectedRun, campaign, runDetailsMap]);

  return (
    <div className="min-h-screen bg-background">
      {/* <Navigation
        currentView={currentNavView}
        onNavigate={handleNavigation}
        title={title}
      /> */}
      <div className="p-6">
        {currentView === "creators" ? (
          <CreatorsTable
            campaignId={campaign.campaign_id || 0}
            runs_summary_list={campaign.runs_summary_list || []}
          />
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
                  <CardTitle
                    className="text-sm font-medium"
                    onClick={() => {
                      console.log("CAmpaign", campaign);
                    }}
                  >
                    Total Good-fit Creators Identified
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaign?.total_good_fit_creators_identified_all_time}
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
                    {(campaign?.research_overview as ResearchOverview[])?.map(
                      (overview) => (
                        <div
                          key={overview.platform}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                platformColorMap[overview.platform] ||
                                "bg-gray-400"
                              }`}
                            ></div>
                            <span className="text-sm font-medium">
                              {overview.platform.charAt(0).toUpperCase() +
                                overview.platform.slice(1)}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">
                              {overview.total_creators_found_on_platform}{" "}
                              creators
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {overview.total_runs_on_platform} runs
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Status Summary - Separate Cards */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Campaign Status</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {(["instagram", "tiktok", "youtube"] as const).map(
                  (platform) => (
                    <Card key={platform}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${platformColorMap[platform]}`}
                          />
                          <CardTitle className="text-base font-medium">
                            {platform.charAt(0).toUpperCase() +
                              platform.slice(1)}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Active
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {campaignStatusSummary[platform].active}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Completed
                          </span>
                          <span className="text-lg font-bold">
                            {campaignStatusSummary[platform].completed}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Error
                          </span>
                          <span className="text-lg font-bold text-red-600">
                            {campaignStatusSummary[platform].error}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>

            {/* Platform Tabs */}
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="instagram" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="instagram"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      Instagram
                    </TabsTrigger>
                    <TabsTrigger
                      value="tiktok"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                      TikTok
                    </TabsTrigger>
                    <TabsTrigger
                      value="youtube"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      YouTube
                    </TabsTrigger>
                  </TabsList>

                  {Object.entries(platformData).map(([platform]) => (
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
                            type="multiple"
                            defaultValue={campaign?.runs_summary_list
                              ?.filter(
                                (run: Run) =>
                                  run.platform === platform &&
                                  run.run_id !== undefined
                              )
                              .map((run: Run) => run.run_id!.toString())}
                          >
                            {campaign?.runs_summary_list
                              ?.filter((run: Run) => run.platform === platform)
                              .map(
                                (run: Run) =>
                                  run.run_id !== undefined && (
                                    <AccordionItem
                                      key={run.run_id}
                                      value={run?.run_id.toString()}
                                    >
                                      <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">
                                            {run.run_name || "Unnamed Run"}
                                          </span>
                                          {run.discovery_method && (
                                            <Badge
                                              variant="outline"
                                              className={`text-xs ${
                                                run.discovery_method ===
                                                "search"
                                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                                  : "bg-purple-50 text-purple-700 border-purple-200"
                                              }`}
                                            >
                                              {run.discovery_method
                                                .charAt(0)
                                                .toUpperCase() +
                                                run.discovery_method.slice(1)}
                                            </Badge>
                                          )}
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
                                                  campaign?.name ??
                                                    "Untitled Campaign",
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
                                                {runDetailsMap[run.run_id]
                                                  ?.current_processing_step ||
                                                  "—"}
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
                                                    variant={
                                                      runDetailsMap[run.run_id]
                                                        ?.current_step_status ===
                                                      "completed"
                                                        ? "default"
                                                        : runDetailsMap[
                                                            run.run_id
                                                          ]
                                                            ?.current_step_status ===
                                                          "error"
                                                        ? "destructive"
                                                        : "outline"
                                                    }
                                                    className={
                                                      runDetailsMap[run.run_id]
                                                        ?.current_step_status ===
                                                      "completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : runDetailsMap[
                                                            run.run_id
                                                          ]
                                                            ?.current_step_status ===
                                                          "error"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                    }
                                                  >
                                                    {runDetailsMap[run.run_id]
                                                      ?.current_step_status ||
                                                      "—"}
                                                  </Badge>
                                                  <p className="text-xs text-muted-foreground">
                                                    {runDetailsMap[run.run_id]
                                                      ?.error_details
                                                      ?.error_message ||
                                                      "No error"}
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
                                                  {formatDuration(
                                                    runDetailsMap[run.run_id]
                                                      ?.total_research_time_seconds
                                                  )}
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
                                                  {runDetailsMap[run.run_id]
                                                    ?.current_action_description ||
                                                    "—"}
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
                                                Creator filtering and
                                                qualification process
                                              </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                              <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm font-medium text-green-600">
                                                    Good Creators Found:
                                                  </span>
                                                  <span className="text-sm font-bold">
                                                    {runDetailsMap[run.run_id]
                                                      ?.dropoff_metrics
                                                      ?.good_creators_found ??
                                                      0}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm text-muted-foreground">
                                                    Total profiles from network:
                                                  </span>
                                                  <span className="text-sm">
                                                    {runDetailsMap[run.run_id]
                                                      ?.dropoff_metrics
                                                      ?.total_profiles_from_network ??
                                                      0}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm text-muted-foreground">
                                                    Brands removed:
                                                  </span>
                                                  <span className="text-sm">
                                                    {runDetailsMap[run.run_id]
                                                      ?.dropoff_metrics
                                                      ?.brands_removed?.count ??
                                                      0}{" "}
                                                    <span className="text-xs text-muted-foreground">
                                                      (
                                                      {runDetailsMap[run.run_id]
                                                        ?.dropoff_metrics
                                                        ?.brands_removed
                                                        ?.profiles_remaining ??
                                                        0}{" "}
                                                      left)
                                                    </span>
                                                  </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm text-muted-foreground">
                                                    Not a good fit:
                                                  </span>
                                                  <span className="text-sm">
                                                    {runDetailsMap[run.run_id]
                                                      ?.dropoff_metrics
                                                      ?.evaluation_removed
                                                      ?.count ?? 0}{" "}
                                                    <span className="text-xs text-muted-foreground">
                                                      (
                                                      {runDetailsMap[run.run_id]
                                                        ?.dropoff_metrics
                                                        ?.evaluation_removed
                                                        ?.profiles_remaining ??
                                                        0}{" "}
                                                      left)
                                                    </span>
                                                  </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm text-muted-foreground">
                                                    No email accounts removed:
                                                  </span>
                                                  <span className="text-sm">
                                                    {runDetailsMap[run.run_id]
                                                      ?.dropoff_metrics
                                                      ?.no_email_accounts_removed
                                                      ?.count ?? 0}{" "}
                                                    <span className="text-xs text-muted-foreground">
                                                      (
                                                      {runDetailsMap[run.run_id]
                                                        ?.dropoff_metrics
                                                        ?.no_email_accounts_removed
                                                        ?.profiles_remaining ??
                                                        0}{" "}
                                                      left)
                                                    </span>
                                                  </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm text-muted-foreground">
                                                    Follower count removed:
                                                  </span>
                                                  <span className="text-sm">
                                                    {runDetailsMap[run.run_id]
                                                      ?.dropoff_metrics
                                                      ?.follower_count_removed
                                                      ?.count ?? 0}{" "}
                                                    <span className="text-xs text-muted-foreground">
                                                      (
                                                      {runDetailsMap[run.run_id]
                                                        ?.dropoff_metrics
                                                        ?.follower_count_removed
                                                        ?.profiles_remaining ??
                                                        0}{" "}
                                                      left)
                                                    </span>
                                                  </span>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  )
                              )}
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
