"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/lib/axios";
import Papa from "papaparse";

interface Creator {
  id: string;
  full_name: string;
  first_name: string;
  instagram_profile_url: string;
  instagram_followers: number;
  instagram_profile_bio: string;
  tiktok_profile_url: string;
  tiktok_followers: number;
  tiktok_profile_bio: string;
  youtube_channel_url: string;
  youtube_subscribers: number;
  youtube_channel_bio: string;
  evaluation_score: number;
  evaluation_reasoning: string;
  public_email: string;
  instagram_email: string;
  tiktok_email: string;
  youtube_email: string;
  youtube_video_id: string;
  source: string;
  source_network: string;
}

// Sample creator data

interface CreatorsTableProps {
  campaignId: Number;
  runs_summary_list: any[];
}

export default function CreatorsTable({
  campaignId,
  runs_summary_list,
}: CreatorsTableProps) {
  const [networkFilter, setNetworkFilter] = React.useState("all");
  const [creators, setCreators] = React.useState<Creator[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [selectedRun, setSelectedRun] = React.useState<string>("");

  const filteredCreators = creators.filter((creator) => {
    if (networkFilter === "all") return true;
    return (
      creator.source_network?.toLowerCase() === networkFilter.toLowerCase()
    );
  });

  const formatFollowers = (count: number | null | undefined) => {
    if (!count || isNaN(count)) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleRunChange = (value: string) => {
    setSelectedRun(value);
    setPage(1);
    setCreators([]);
  };

const handleExportCSV = async () => {
  try {
    if (filteredCreators.length === 0) {
      alert("No data to export. Please apply different filters to export data.");
      return;
    }

    const run = selectedRun || "all";
    const network = networkFilter || "all";

    const res = await axiosInstance.get(
      `/csv/campaigns/${campaignId}/runs/${run}/networks/${network}`
    );

    const csvUrl = res.data?.csv_url;
    if (!csvUrl) throw new Error("CSV URL not found in response.");

    // Fetch CSV content as blob
    const response = await fetch(csvUrl);
    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `creators-${network}-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    alert("Failed to export CSV. Please try again.");
  }
};



  const truncateText = (text: string | null | undefined, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const getSourceNetworkBadge = (network: string) => {
    const colors = {
      Instagram: "bg-pink-100 text-pink-800",
      TikTok: "bg-gray-100 text-gray-800",
      YouTube: "bg-red-100 text-red-800",
    };
    return (
      colors[network as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  React.useEffect(() => {
    const fetchInitialCreators = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          selectedRun && selectedRun !== "all"
            ? `/campaigns/${campaignId}/runs/${selectedRun}/creators/1`
            : `/campaigns/${campaignId}/creators/1`
        );

        const data: Creator[] = res.data.creators || [];
        setCreators(data);
        setPage(1);
        setHasMore(data.length === 10);
      } catch (err) {
        console.error("Error fetching initial creators:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialCreators();
  }, [campaignId, selectedRun]);

  React.useEffect(() => {
    if (page === 1) return;

    const fetchMore = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          selectedRun && selectedRun !== "all"
            ? `/campaigns/${campaignId}/runs/${selectedRun}/creators/${page}`
            : `/campaigns/${campaignId}/creators/${page}`
        );

        const data: Creator[] = res.data.creators || [];
        setCreators((prev) => [...prev, ...data]);
        setHasMore(data.length === 10);
      } catch (err) {
        console.error("Error loading more creators:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMore();
  }, [page]);

  return (
    <div className="max-w-full mx-auto space-y-6 overflow-x-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Creators</h1>
            <p className="text-muted-foreground">
              {filteredCreators.length} of {creators.length} creators
            </p>
          </div>
        </div>
        <Button onClick={handleExportCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Combined Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-end gap-4 justify-start">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Run Filter */}
              <Select value={selectedRun} onValueChange={handleRunChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Runs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Runs</SelectItem>
                  {runs_summary_list?.map((run: any) => (
                    <SelectItem key={run.run_id} value={run.run_id.toString()}>
                      {run.run_name || `Run ${run.run_id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Network Filter */}
              <Select value={networkFilter} onValueChange={setNetworkFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Networks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Networks</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Load More Button */}
            {hasMore && (
              <Button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Creators Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Full Name</TableHead>
                  <TableHead className="min-w-[200px]">
                    Instagram Profile URL
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    Evaluation Score
                  </TableHead>
                  <TableHead className="min-w-[300px]">
                    Evaluation Reasoning
                  </TableHead>
                  <TableHead className="min-w-[80px]">ID</TableHead>
                  <TableHead className="min-w-[100px]">First Name</TableHead>
                  <TableHead className="min-w-[120px]">
                    Instagram Followers
                  </TableHead>
                  <TableHead className="min-w-[250px]">Instagram Bio</TableHead>
                  <TableHead className="min-w-[200px]">
                    TikTok Profile URL
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    TikTok Followers
                  </TableHead>
                  <TableHead className="min-w-[200px]">
                    TikTok Signature
                  </TableHead>
                  <TableHead className="min-w-[200px]">
                    YouTube Channel URL
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    YouTube Subscribers
                  </TableHead>
                  <TableHead className="min-w-[250px]">YouTube Bio</TableHead>
                  <TableHead className="min-w-[200px]">Primary Email</TableHead>
                  <TableHead className="min-w-[200px]">
                    Instagram Email
                  </TableHead>
                  <TableHead className="min-w-[200px]">TikTok Email</TableHead>
                  <TableHead className="min-w-[200px]">YouTube Email</TableHead>
                  <TableHead className="min-w-[150px]">
                    YouTube Video ID
                  </TableHead>
                  <TableHead className="min-w-[200px]">Source</TableHead>
                  <TableHead className="min-w-[120px]">
                    Source Network
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCreators.map((creator) => (
                  <TableRow key={creator.id + creator.full_name}>
                    <TableCell className="font-medium">
                      {creator.full_name}
                    </TableCell>
                    <TableCell>
                      <a
                        href={creator.instagram_profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {truncateText(creator.instagram_profile_url, 30)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {creator.evaluation_score ?? "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span title={creator.evaluation_reasoning}>
                        {truncateText(creator.evaluation_reasoning ?? "", 50)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {creator.id}
                    </TableCell>
                    <TableCell>{creator.first_name ?? "N/A"}</TableCell>
                    <TableCell className="font-medium">
                      {formatFollowers(creator.instagram_followers)}
                    </TableCell>
                    <TableCell>
                      <span title={creator.instagram_profile_bio}>
                        {truncateText(creator.instagram_profile_bio ?? "", 40)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={creator.tiktok_profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {truncateText(creator.tiktok_profile_url, 30)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatFollowers(creator.tiktok_followers)}
                    </TableCell>
                    <TableCell>
                      <span title={creator.tiktok_profile_bio}>
                        {truncateText(creator.tiktok_profile_bio ?? "", 30)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={creator.youtube_channel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {truncateText(creator.youtube_channel_url, 30)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatFollowers(creator.youtube_subscribers)}
                    </TableCell>
                    <TableCell>
                      <span title={creator.youtube_channel_bio}>
                        {truncateText(creator.youtube_channel_bio ?? "", 40)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${creator.public_email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {creator.public_email ?? "N/A"}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${creator.instagram_email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {creator.instagram_email ?? "N/A"}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${creator.tiktok_email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {creator.tiktok_email ?? "N/A"}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${creator.youtube_email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {creator.youtube_email ?? "N/A"}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://youtube.com/watch?v=${creator.youtube_video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono text-sm"
                      >
                        {creator.youtube_video_id ?? "N/A"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <span title={creator.source}>
                        {truncateText(creator.source ?? "", 25)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getSourceNetworkBadge(
                          creator.source_network
                        )}
                      >
                        {creator.source_network ?? "N/A"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* {hasMore && (
        <div className="text-center">
          <Button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )} */}

      {filteredCreators.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No creators found matching your search.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
