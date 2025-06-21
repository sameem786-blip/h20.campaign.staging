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

interface Creator {
  id: string;
  fullName: string;
  firstName: string;
  instagramProfileUrl: string;
  instagramFollowers: number;
  instagramBio: string;
  tiktokProfileUrl: string;
  tiktokFollowers: number;
  tiktokSignature: string;
  youtubeChannelUrl: string;
  youtubeSubscribers: number;
  youtubeBio: string;
  evaluationScore: number;
  evaluationReasoning: string;
  primaryEmail: string;
  instagramEmail: string;
  tiktokEmail: string;
  youtubeEmail: string;
  youtubeVideoId: string;
  source: string;
  sourceNetwork: string;
}

// Sample creator data
const creatorsData: Creator[] = [
  {
    id: "CR001",
    fullName: "Sarah Johnson",
    firstName: "Sarah",
    instagramProfileUrl: "https://instagram.com/sarahfitness",
    instagramFollowers: 125000,
    instagramBio:
      "Fitness coach & wellness advocate. Transform your body and mind 💪",
    tiktokProfileUrl: "https://tiktok.com/@sarahfitness",
    tiktokFollowers: 89000,
    tiktokSignature: "Your daily dose of fitness motivation ✨",
    youtubeChannelUrl: "https://youtube.com/c/sarahfitness",
    youtubeSubscribers: 45000,
    youtubeBio:
      "Weekly workout routines and nutrition tips for a healthier lifestyle",
    evaluationScore: 8,
    evaluationReasoning:
      "High engagement rate, consistent posting, authentic content, strong fitness niche presence",
    primaryEmail: "sarah@sarahfitness.com",
    instagramEmail: "collab@sarahfitness.com",
    tiktokEmail: "sarah@sarahfitness.com",
    youtubeEmail: "business@sarahfitness.com",
    youtubeVideoId: "dQw4w9WgXcQ",
    source: "Fitness Influencers Campaign",
    sourceNetwork: "Instagram",
  },
  {
    id: "CR002",
    fullName: "Michael Chen",
    firstName: "Michael",
    instagramProfileUrl: "https://instagram.com/techmike",
    instagramFollowers: 67000,
    instagramBio:
      "Tech reviewer & gadget enthusiast. Latest tech reviews daily 📱",
    tiktokProfileUrl: "https://tiktok.com/@techmike",
    tiktokFollowers: 156000,
    tiktokSignature: "Breaking down tech for everyone 🔧",
    youtubeChannelUrl: "https://youtube.com/c/techmike",
    youtubeSubscribers: 234000,
    youtubeBio: "In-depth tech reviews, tutorials, and industry insights",
    evaluationScore: 9,
    evaluationReasoning:
      "Excellent content quality, strong audience engagement, trending topics, high production value",
    primaryEmail: "mike@techreviews.com",
    instagramEmail: "partnerships@techreviews.com",
    tiktokEmail: "mike@techreviews.com",
    youtubeEmail: "business@techreviews.com",
    youtubeVideoId: "jNQXAC9IVRw",
    source: "Tech Reviewers Campaign",
    sourceNetwork: "YouTube",
  },
  {
    id: "CR003",
    fullName: "Emma Rodriguez",
    firstName: "Emma",
    instagramProfileUrl: "https://instagram.com/emmalifestyle",
    instagramFollowers: 198000,
    instagramBio:
      "Lifestyle blogger sharing daily inspiration and style tips ✨",
    tiktokProfileUrl: "https://tiktok.com/@emmalifestyle",
    tiktokFollowers: 234000,
    tiktokSignature: "Living my best life and sharing the journey 🌟",
    youtubeChannelUrl: "https://youtube.com/c/emmalifestyle",
    youtubeSubscribers: 78000,
    youtubeBio: "Lifestyle vlogs, fashion hauls, and self-care routines",
    evaluationScore: 7,
    evaluationReasoning:
      "Good engagement, aesthetic content, consistent branding, strong lifestyle niche",
    primaryEmail: "emma@lifestyle.co",
    instagramEmail: "brand@lifestyle.co",
    tiktokEmail: "emma@lifestyle.co",
    youtubeEmail: "collabs@lifestyle.co",
    youtubeVideoId: "9bZkp7q19f0",
    source: "Lifestyle Creators Campaign",
    sourceNetwork: "TikTok",
  },
  {
    id: "CR004",
    fullName: "David Thompson",
    firstName: "David",
    instagramProfileUrl: "https://instagram.com/gamingpro",
    instagramFollowers: 89000,
    instagramBio:
      "Professional gamer & streamer. Daily gaming content and tips 🎮",
    tiktokProfileUrl: "https://tiktok.com/@gamingpro",
    tiktokFollowers: 145000,
    tiktokSignature: "Level up your gaming skills with me! 🚀",
    youtubeChannelUrl: "https://youtube.com/c/gamingpro",
    youtubeSubscribers: 312000,
    youtubeBio:
      "Gaming tutorials, reviews, and live streams for all skill levels",
    evaluationScore: 8,
    evaluationReasoning:
      "Strong gaming community, high viewer retention, consistent upload schedule, trending game coverage",
    primaryEmail: "david@gamingpro.net",
    instagramEmail: "sponsorships@gamingpro.net",
    tiktokEmail: "david@gamingpro.net",
    youtubeEmail: "business@gamingpro.net",
    youtubeVideoId: "kJQP7kiw5Fk",
    source: "Gaming Streamers Campaign",
    sourceNetwork: "YouTube",
  },
];

interface CreatorsTableProps {
  onBack: () => void;
}

export default function CreatorsTable({ onBack }: CreatorsTableProps) {
  const [networkFilter, setNetworkFilter] = React.useState("all");

  const filteredCreators = creatorsData.filter((creator) => {
    if (networkFilter === "all") return true;
    return creator.sourceNetwork.toLowerCase() === networkFilter.toLowerCase();
  });

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleExportCSV = () => {
    console.log("Exporting creators CSV...");
    // In a real app, this would generate and download a CSV file
  };

  const truncateText = (text: string, maxLength = 50) => {
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

  return (
    <div className="max-w-full mx-auto space-y-6 overflow-x-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Creators</h1>
            <p className="text-muted-foreground">
              {filteredCreators.length} of {creatorsData.length} creators
            </p>
          </div>
        </div>
        <Button onClick={handleExportCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Network Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={networkFilter} onValueChange={setNetworkFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Networks</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
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
                  <TableRow key={creator.id}>
                    <TableCell className="font-medium">
                      {creator.fullName}
                    </TableCell>
                    <TableCell>
                      <a
                        href={creator.instagramProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {truncateText(creator.instagramProfileUrl, 30)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {creator.evaluationScore}/10
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span title={creator.evaluationReasoning}>
                        {truncateText(creator.evaluationReasoning, 50)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {creator.id}
                    </TableCell>
                    <TableCell>{creator.firstName}</TableCell>
                    <TableCell className="font-medium">
                      {formatFollowers(creator.instagramFollowers)}
                    </TableCell>
                    <TableCell>
                      <span title={creator.instagramBio}>
                        {truncateText(creator.instagramBio, 40)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={creator.tiktokProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {truncateText(creator.tiktokProfileUrl, 30)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatFollowers(creator.tiktokFollowers)}
                    </TableCell>
                    <TableCell>
                      <span title={creator.tiktokSignature}>
                        {truncateText(creator.tiktokSignature, 30)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={creator.youtubeChannelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {truncateText(creator.youtubeChannelUrl, 30)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatFollowers(creator.youtubeSubscribers)}
                    </TableCell>
                    <TableCell>
                      <span title={creator.youtubeBio}>
                        {truncateText(creator.youtubeBio, 40)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${creator.primaryEmail}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {creator.primaryEmail}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${creator.instagramEmail}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {creator.instagramEmail}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${creator.tiktokEmail}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {creator.tiktokEmail}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${creator.youtubeEmail}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {creator.youtubeEmail}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://youtube.com/watch?v=${creator.youtubeVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono text-sm"
                      >
                        {creator.youtubeVideoId}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <span title={creator.source}>
                        {truncateText(creator.source, 25)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getSourceNetworkBadge(creator.sourceNetwork)}
                      >
                        {creator.sourceNetwork}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
