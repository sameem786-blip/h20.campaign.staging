// path: src/app/(dashboard)/performance/page.tsx
"use client";

import { FaTiktok, FaYoutube, FaInstagram, FaFacebook } from "react-icons/fa";
import React, { useState, useRef, useEffect, JSX } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
const today = new Date();
import {
  MdGridView,
  MdCalendarToday,
  MdVideocam,
} from "react-icons/md";
import { GridBackground } from "./ui/glowing-card";
import { CardSpotlight } from "./ui/card-spotlight";
import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select2";
import { GradientButton } from "./ui/gradient-button";
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
import { ChevronRightIcon, Download, Eye, Pause, Play } from "lucide-react";
import Image from "next/image";

const platformIcons: Record<ContentRow["platform"], JSX.Element> = {
  TikTok: <FaTiktok className="h-4 w-4 text-white" />,
  YouTube: <FaYoutube className="h-4 w-4 text-white" />,
  Instagram: <FaInstagram className="h-4 w-4 text-white" />,
  Facebook: <FaFacebook className="h-4 w-4 text-white" />,
};
const tablePlatformIcons: Record<ContentRow["platform"], JSX.Element> = {
  TikTok: <FaTiktok className="h-4 w-4 text-black" />,
  YouTube: <FaYoutube className="h-4 w-4 text-red-600" />,
  Instagram: <FaInstagram className="h-4 w-4 text-pink-500" />,
  Facebook: <FaFacebook className="h-4 w-4 text-blue-600" />,
};

// --- Helpers ---
function formatNumberShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return n.toString();
}

function toPercent(n: number, digits = 2) {
  return `${n.toFixed(digits)}%`;
}

// --- New row type & dummy dataset ---
export type ContentRow = {
  id: string;
  account: string;
  platform: "TikTok" | "YouTube" | "Instagram" | "Facebook";
  thumbnail: string; // image url
  title: string;
  views: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  uploadedAt: string; // ISO
  length: string; // mm:ss
  song: string;
  hashtags: string[];
};

export type VideoCard = {
  src?: string;
  creator: string;
  platform: ContentRow["platform"];
  views: number;
};

const videos: VideoCard[] = [
  { src: "/videos/video1.mp4", creator: "@testcreator", platform: "TikTok", views: 155000 },
  { src: "/videos/video2.mp4", creator: "@testcreator2", platform: "YouTube", views: 87000 },
  { src: "/videos/video1.mp4", creator: "@testcreator3", platform: "Instagram", views: 42000 },
  { src: "/videos/video2.mp4", creator: "@testcreator4", platform: "TikTok", views: 61000 },
  { src: "/videos/video1.mp4", creator: "@testcreator", platform: "YouTube", views: 134000 },
  { src: "/videos/video2.mp4", creator: "@testcreator2", platform: "Facebook", views: 23000 },
];

const contentRows: ContentRow[] = [
  {
    id: "1",
    account: "acc_1",
    platform: "TikTok",
    thumbnail: "https://img.freepik.com/premium-psd/instagram-reels-youtube-short-video-thumbnail-template-business-promotion_475351-817.jpg",
    title: "AI edits in 30s – workflow demo",
    views: 155000,
    likes: 12300,
    comments: 540,
    saves: 1800,
    shares: 950,
    uploadedAt: "2025-05-14T10:12:00Z",
    length: "00:32",
    song: "Midnight Drive - A. Keys",
    hashtags: ["#ai", "#videoediting", "#workflow"],
  },
  {
    id: "2",
    account: "acc_2",
    platform: "YouTube",
    thumbnail: "https://img.freepik.com/premium-psd/instagram-reels-youtube-short-video-thumbnail-template-business-promotion_475351-817.jpg",
    title: "Full tutorial: Color grading with AI",
    views: 87000,
    likes: 6400,
    comments: 310,
    saves: 740,
    shares: 120,
    uploadedAt: "2025-05-11T08:02:00Z",
    length: "08:41",
    song: "—",
    hashtags: ["#tutorial", "#colorgrading"],
  },
  {
    id: "3",
    account: "acc_3",
    platform: "Instagram",
    thumbnail: "https://img.freepik.com/premium-psd/instagram-reels-youtube-short-video-thumbnail-template-business-promotion_475351-817.jpg",
    title: "Before/After transitions",
    views: 42000,
    likes: 5100,
    comments: 150,
    saves: 980,
    shares: 260,
    uploadedAt: "2025-05-09T15:33:00Z",
    length: "00:19",
    song: "City Pop Loop",
    hashtags: ["#reels", "#transitions"],
  },
  {
    id: "4",
    account: "acc_4",
    platform: "TikTok",
    thumbnail: "https://img.freepik.com/premium-psd/instagram-reels-youtube-short-video-thumbnail-template-business-promotion_475351-817.jpg",
    title: "How I storyboard with GPT",
    views: 61000,
    likes: 3900,
    comments: 210,
    saves: 1300,
    shares: 310,
    uploadedAt: "2025-05-07T12:05:00Z",
    length: "00:45",
    song: "Lo-fi Beat 24",
    hashtags: ["#storyboard", "#creators"],
  },
  {
    id: "5",
    account: "acc-5",
    platform: "YouTube",
    thumbnail: "https://img.freepik.com/premium-psd/instagram-reels-youtube-short-video-thumbnail-template-business-promotion_475351-817.jpg",
    title: "Speed ramping like a pro",
    views: 134000,
    likes: 10100,
    comments: 460,
    saves: 2100,
    shares: 670,
    uploadedAt: "2025-05-04T09:00:00Z",
    length: "06:03",
    song: "—",
    hashtags: ["#speedramp", "#tips"],
  },
];

// Derived helpers
const avgViews = contentRows.reduce((a, r) => a + r.views, 0) / Math.max(1, contentRows.length);
function viewsPerformanceLabel(views: number) {
  if (views >= avgViews * 1.1) return "More views than usual";
  if (views <= avgViews * 0.9) return "Less views than usual";
  return "About usual";
}

// --- Columns ---
const columns: ColumnDef<ContentRow>[] = [
  {
    accessorKey: "account",
    header: ({ column }) => <TableColumnHeader column={column} title="Account" />,
    cell: ({ row }) => <span className="font-medium">{row.original.account}</span>,
    enableSorting: false,
  },
  {
  accessorKey: "platform",
  header: ({ column }) => <TableColumnHeader column={column} title="Platform" />,
  cell: ({ row }) => (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
      {tablePlatformIcons[row.original.platform]}
    </span>
  ),
  enableSorting: false,
},
  {
    accessorKey: "thumbnail",
    header: ({ column }) => <TableColumnHeader column={column} title="Thumbnail" />,
    cell: ({ row }) => (
      <div className="h-12 w-8 overflow-hidden rounded-md bg-gray-100">
        {row.original.thumbnail ? (
          <Image src={row.original.thumbnail} alt={row.original.title} width={80} height={48} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MdVideocam className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <TableColumnHeader column={column} title="Video Title" />,
    cell: ({ row }) => <span className="line-clamp-2 w-50">{row.original.title}</span>,
  },
  {
    accessorKey: "views",
    header: ({ column }) => <TableColumnHeader column={column} title="Views" />,
    cell: ({ row }) => formatNumberShort(row.original.views),
    enableSorting: true,
  },
  {
    accessorKey: "likes",
    header: ({ column }) => <TableColumnHeader column={column} title="Likes" />,
    cell: ({ row }) => formatNumberShort(row.original.likes),
    enableSorting: true,
  },
  {
    accessorKey: "comments",
    header: ({ column }) => <TableColumnHeader column={column} title="Comments" />,
    cell: ({ row }) => formatNumberShort(row.original.comments),
  },
  {
    accessorKey: "saves",
    header: ({ column }) => <TableColumnHeader column={column} title="Saves" />,
    cell: ({ row }) => formatNumberShort(row.original.saves),
  },
  {
    accessorKey: "shares",
    header: ({ column }) => <TableColumnHeader column={column} title="Shares" />,
    cell: ({ row }) => formatNumberShort(row.original.shares),
  },
  {
    id: "totalEngagement",
    header: ({ column }) => <TableColumnHeader column={column} title="Total Engagement" />,
    cell: ({ row }) => {
      const t = row.original.likes + row.original.comments + row.original.saves + row.original.shares;
      return formatNumberShort(t);
    },
    sortingFn: (a, b) => {
      const getT = (r: ContentRow) => r.likes + r.comments + r.saves + r.shares;
      return getT(a.original) - getT(b.original);
    },
    enableSorting: true,
  },
  {
    id: "engagementRate",
    header: ({ column }) => <TableColumnHeader column={column} title="Engagement Rate" />,
    cell: ({ row }) => {
      const t = row.original.likes + row.original.comments + row.original.saves + row.original.shares;
      const rate = row.original.views ? (t / row.original.views) * 100 : 0;
      return <span>{toPercent(rate)}</span>;
    },
    enableSorting: true,
    sortingFn: (a, b) => {
      const getRate = (r: ContentRow) => {
        const t = r.likes + r.comments + r.saves + r.shares;
        return r.views ? t / r.views : 0;
      };
      return getRate(a.original) - getRate(b.original);
    },
  },
  {
    id: "viewsPerformance",
    header: ({ column }) => <TableColumnHeader column={column} title="Views Performance" />,
    cell: ({ row }) => <span className="text-sm">{viewsPerformanceLabel(row.original.views)}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "uploadedAt",
    header: ({ column }) => <TableColumnHeader column={column} title="Uploaded Date" />,
    cell: ({ row }) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(row.original.uploadedAt)),
    enableSorting: true,
  },
  {
    accessorKey: "length",
    header: ({ column }) => <TableColumnHeader column={column} title="Length" />,
    cell: ({ row }) => row.original.length,
    enableSorting: true,
  },
  {
    accessorKey: "song",
    header: ({ column }) => <TableColumnHeader column={column} title="Song" />,
    cell: ({ row }) => row.original.song,
  },
  {
    accessorKey: "hashtags",
    header: ({ column }) => <TableColumnHeader column={column} title="Hashtags" />,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.hashtags.map((tag) => (
          <span key={tag} className="rounded bg-gray-100 px-0 py-0.5 text-xs">{tag}</span>
        ))}
      </div>
    ),
  },
];

// --- Stats (kept from your original, reordered lightly) ---
const stats = [
  { label: "Views", value: "15.5M" },
  { label: "Likes", value: "335.3k" },
  { label: "Comments", value: "34.7k" },
  { label: "Shares", value: "21.3k" },
  { label: "Published Videos", value: "27" },
  { label: "Bookmarks", value: "11.3k" },
  { label: "Engagement Rate", value: "3%" },
];

const creators = [
  { id: 1, name: "Test Creator", profilePicture: "/images/creator1.jpg", handle: "@testcreator", engagementRate: "3.2%" },
  { id: 2, name: "Test Creator 2", profilePicture: "/images/creator2.jpg", handle: "@testcreator2", engagementRate: "4.5%" },
  { id: 3, name: "Test Creator 3", profilePicture: "/images/creator3.jpg", handle: "@testcreator3", engagementRate: "2.8%" },
  { id: 4, name: "Test Creator 4", profilePicture: "/images/creator4.jpg", handle: "@testcreator4", engagementRate: "3.2%" },
];

const campaignOptions = [
  { key: "all", label: "All Campaigns" },
  { key: "round2", label: "Type ROUND 2" },
  { key: "aldea", label: "Aldea Coaches" },
];

const dateOptions = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "mtd", label: "Month To Date" },
  { key: "ytd", label: "Year To Date" },
  { key: "lastyear", label: "Last Year" },
  { key: "all", label: "All Time" },
];

function PlatformBadge({ platform }: { platform: ContentRow["platform"] }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none";
  switch (platform) {
    case "TikTok":
      return <span className={`${base} bg-black/90 text-white`}>{platformIcons[platform]} TikTok</span>;
    case "YouTube":
      return <span className={`${base} bg-red-600 text-white`}>{platformIcons[platform]} YouTube</span>;
    case "Instagram":
      return (
        <span className={`${base} bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-white`}>
          {platformIcons[platform]} Instagram
        </span>
      );
    case "Facebook":
      return <span className={`${base} bg-blue-600 text-white`}>{platformIcons[platform]} Facebook</span>;
  }
}

function VideoTile({ video }: { video: VideoCard }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);

  const togglePlay = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, []);

  return (
    <div
      className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {video.src ? (
        <video ref={ref} src={video.src} className="h-full w-full object-cover" playsInline />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <MdVideocam className="h-10 w-10 text-gray-400" />
        </div>
      )}

      {/* Center play/pause */}
      <button
        type="button"
        onClick={togglePlay}
        className={
          "absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/65 p-4 text-white shadow transition-opacity " +
          (hovered || !isPlaying ? "opacity-100" : "opacity-0")
        }
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause />
        ) : (
          
          <Play />
        )}
      </button>

      {/* Bottom-left overlay with creator + platform + views + download */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-black/45 px-3 py-2 text-white backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">{video.creator}</p>
            <div className="mt-1 flex items-center gap-2">
              <PlatformBadge platform={video.platform} />
              <span className="inline-flex items-center gap-1 text-xs">
                <Eye className="h-3.5 w-3.5" /> {formatNumberShort(video.views)}
              </span>
            </div>
          </div>
          {/* Download action living inside the overlay container */}
          {video.src && (
            <a
              href={video.src}
              download
              className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-xs font-medium text-white hover:bg-white/25"
              onClick={(e) => e.stopPropagation()}
              aria-label="Download video"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Performance() {
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState(campaignOptions[0].key);
  const [campaignDropdown, setCampaignDropdown] = useState(false);

  const [selectedDate, setSelectedDate] = useState(dateOptions[0].key);
  const [dateDropdown, setDateDropdown] = useState(false);
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [customRangePickerOpen, setCustomRangePickerOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  function PlatformBadge({ platform }: { platform: ContentRow["platform"] }) {
  // why: color cues speed up scanning and match brand expectations
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none";
  switch (platform) {
    case "TikTok":
      return (
        <span className={`${base} bg-black/90 text-white`}>{platformIcons[platform]} TikTok</span>
      );
    case "YouTube":
      return (
        <span className={`${base} bg-red-600 text-white`}>{platformIcons[platform]} YouTube</span>
      );
    case "Instagram":
      return (
        <span className={`${base} bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-white`}>{
          platformIcons[platform]
        } Instagram</span>
      );
    case "Facebook":
      return (
        <span className={`${base} bg-blue-600 text-white`}>{platformIcons[platform]} Facebook</span>
      );
  }
}

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setDateDropdown(false);
        setCustomRangePickerOpen(false);
      }
    }
    if (dateDropdown || customRangePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dateDropdown, customRangePickerOpen]);

  // NOTE: Table header stays fixed because only <tbody> scrolls (see TableBody below)
  return (
    <div className="bg-[#f7f8fa] min-h-screen w-full p-4 md:p-8 playfair-font">
      <div className="mx-auto max-w-7xl">
        {/* Header and Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Type AI</h1>
          <div className="flex flex-wrap gap-3">
            {/* Campaign Selector */}
            <div className="relative">
              <button
                className="flex min-w-[170px] items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none"
                onClick={() => setCampaignDropdown((v) => !v)}
                onBlur={() => setTimeout(() => setCampaignDropdown(false), 150)}
                tabIndex={0}
                type="button"
              >
                <MdGridView className="h-5 w-5" />
                {campaignOptions.find((opt) => opt.key === selectedCampaign)?.label}
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {campaignDropdown && (
                <div className="z-[9990] absolute left-0 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                  {campaignOptions.map((option) => (
                    <button
                      key={option.key}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedCampaign === option.key ? "bg-gray-100 font-semibold" : ""}`}
                      onClick={() => {
                        setSelectedCampaign(option.key);
                        setCampaignDropdown(false);
                      }}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Selector */}
            <div className="relative" ref={dateDropdownRef}>
              <button
                className="flex min-w-[170px] items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none"
                onClick={() => {
                  setDateDropdown((v) => !v);
                  setCustomRangePickerOpen(false);
                }}
                tabIndex={0}
                type="button"
              >
                <span className="flex items-center gap-2">
                  <MdCalendarToday className="h-5 w-5" />
                  {dateOptions.find((opt) => opt.key === selectedDate)?.label}
                </span>
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dateDropdown && (
                <div className="z-[100] absolute left-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg">
                  {dateOptions.map((option) => (
                    <button
                      key={option.key}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedDate === option.key ? "bg-gray-100 font-semibold" : ""}`}
                      onClick={() => {
                        setSelectedDate(option.key);
                        setDateDropdown(false);
                        setCustomRangePickerOpen(false);
                      }}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Creator Filter */}
            <Select selectedKey={selectedCreator || "all"} onSelectionChange={(key: any) => setSelectedCreator(key)}>
              <SelectTrigger className="w-full min-w-[260px] max-w-[340px]"><SelectValue /></SelectTrigger>
              <SelectPopover>
                <SelectListBox>
                  <SelectItem key="all" id="all">All Creators</SelectItem>
                  {creators.map((creator) => (
                    <SelectItem key={creator.id.toString()} id={creator.id.toString()}>
                      {creator.name}
                    </SelectItem>
                  ))}
                </SelectListBox>
              </SelectPopover>
            </Select>

            <div>
              <GradientButton className="gradient-button" onClick={() => {}}>Sync</GradientButton>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {stats.slice(0, 4).map((stat) => (
            <GridBackground key={stat.label} title={stat.value} className="cursor-default" description={stat.label} />
          ))}
        </div>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3">
          {stats.slice(4).map((stat) => (
            <GridBackground key={stat.label} title={stat.value} className="cursor-default" description={stat.label} />
          ))}
        </div>

        {/* Table (header stays, body scrolls) */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <span className="font-semibold text-lg mb-4 block">Tracked Videos</span>
          <div className="my-4">
            <TableProvider columns={columns} data={contentRows} className="min-w-full rounded-lg border">
              <TableHeader className="">
                {({ headerGroup }) => (
                  <TableHeaderGroup key={headerGroup.id} headerGroup={headerGroup}>
                    {({ header }) => (
                      <TableHead key={header.id} header={header} className="bg-[#FFA87D] text-black" />
                    )}
                  </TableHeaderGroup>
                )}
              </TableHeader>

              {/* Only the body scrolls */}
              <TableBody className="max-h-[60vh]">
                {({ row }) => (
                  <TableRow key={row.id} row={row}>
                    {({ cell }) => <TableCell key={cell.id} cell={cell} />}
                  </TableRow>
                )}
              </TableBody>
            </TableProvider>
          </div>
        </div>

        {/* Content cards (kept) */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <span className="font-semibold text-lg mb-4 block">Content</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((video, idx) => (
              <VideoTile key={idx} video={video} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
