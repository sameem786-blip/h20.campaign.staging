"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { MdGridView, MdAlternateEmail, MdCalendarToday, MdVideocam } from "react-icons/md";
import { GridBackground } from "./ui/glowing-card";
import { CardSpotlight } from "./ui/card-spotlight";

const stats = [
  { label: "Published Videos", value: "27" },
  { label: "Total Creators", value: "3" },
  { label: "Views", value: "15.5M" },
  { label: "Likes", value: "335.3k" },
  { label: "Comments", value: "34.7k" },
  { label: "Shares", value: "21.3k" },
  { label: "Bookmarks", value: "11.3k" },
  { label: "Engagement", value: "3%" },
];

// Dummy data for all metrics, now with campaign field
const interactionData = [
  { date: "2025-05-07", campaign: "round2", views: 40000, comments: 12000, likes: 41000, saves: 8000, shares: 9000 },
  { date: "2025-05-08", campaign: "aldea", views: 65000, comments: 18000, likes: 67000, saves: 12000, shares: 15000 },
  { date: "2025-05-09", campaign: "round2", views: 21000, comments: 7000, likes: 20000, saves: 4000, shares: 5000 },
  { date: "2025-05-10", campaign: "aldea", views: 3000, comments: 1000, likes: 2500, saves: 800, shares: 1200 },
  { date: "2025-05-11", campaign: "round2", views: 2000, comments: 800, likes: 1800, saves: 600, shares: 900 },
  { date: "2025-05-12", campaign: "aldea", views: 32000, comments: 9000, likes: 31000, saves: 7000, shares: 11000 },
  { date: "2025-05-13", campaign: "round2", views: 47000, comments: 14000, likes: 46000, saves: 9000, shares: 13000 },
  { date: "2025-05-14", campaign: "aldea", views: 49000, comments: 15000, likes: 48000, saves: 9500, shares: 13500 },
  { date: "2025-05-15", campaign: "round2", views: 42000, comments: 12000, likes: 41000, saves: 8000, shares: 9000 },
  { date: "2025-05-16", campaign: "aldea", views: 17000, comments: 6000, likes: 16000, saves: 4000, shares: 5000 },
  { date: "2025-05-17", campaign: "round2", views: 9000, comments: 3000, likes: 8500, saves: 2000, shares: 2500 },
  { date: "2025-05-18", campaign: "aldea", views: 6000, comments: 2000, likes: 5500, saves: 1500, shares: 1800 },
  { date: "2025-05-19", campaign: "round2", views: 5000, comments: 1500, likes: 4800, saves: 1200, shares: 1600 },
];

const metricOptions = [
  { key: "views", label: "Views", color: "#a78bfa" },
  { key: "comments", label: "Comments", color: "#a78bfa" },
  { key: "likes", label: "Likes", color: "#a78bfa" },
  { key: "saves", label: "Saves", color: "#a78bfa" },
  { key: "shares", label: "Shares", color: "#a78bfa" },
];

// Add a helper for K/M formatting
function formatNumberShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + 'K';
  return n.toString();
}

function CustomBarTooltip({ active, payload, label, selectedMetric }: { active?: boolean; payload?: any[]; label?: string; selectedMetric: string }) {
  if (active && payload && payload.length) {
    const date = new Date(label || "");
    const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const metricLabel = metricOptions.find(opt => opt.key === selectedMetric)?.label || selectedMetric;
    return (
      <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 12, border: '1px solid #eee' }}>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>{formattedDate}</div>
        <div style={{ color: '#a78bfa', fontWeight: 600 }}>{metricLabel} : {formatNumberShort(payload[0]?.value)}</div>
      </div>
    );
  }
  return null;
}

const engagementData = [
  { date: "2025-05-07", campaign: "round2", engagement: 3 },
  { date: "2025-05-08", campaign: "aldea", engagement: 2.5 },
  { date: "2025-05-09", campaign: "round2", engagement: 2 },
  { date: "2025-05-10", campaign: "aldea", engagement: 0.5 },
  { date: "2025-05-11", campaign: "round2", engagement: 0.2 },
  { date: "2025-05-12", campaign: "aldea", engagement: 1 },
  { date: "2025-05-13", campaign: "round2", engagement: 2 },
  { date: "2025-05-14", campaign: "aldea", engagement: 6 },
  { date: "2025-05-15", campaign: "round2", engagement: 3 },
  { date: "2025-05-16", campaign: "aldea", engagement: 1 },
  { date: "2025-05-17", campaign: "round2", engagement: 0.2 },
  { date: "2025-05-18", campaign: "aldea", engagement: 0.1 },
  { date: "2025-05-19", campaign: "round2", engagement: 0.1 },
];

function CustomLineTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (active && payload && payload.length) {
    const date = new Date(label || "");
    const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 12, border: '1px solid #eee' }}>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>{formattedDate}</div>
        <div style={{ color: '#10b981', fontWeight: 600 }}>Engagement : {payload[0]?.value}%</div>
      </div>
    );
  }
  return null;
}

const campaignOptions = [
  { key: "all", label: "All Campaigns" },
  { key: "round2", label: "Type ROUND 2" },
  { key: "aldea", label: "Aldea Coaches" },
];

const dateOptions = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 Days" },
  { key: "14d", label: "Last 14 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "90d", label: "Last 90 Days" },
  { key: "custom", label: "Choose Custom range" },
];

// Filtering logic
function filterByCampaignAndDate(
  data: any[],
  selectedCampaign: string,
  selectedDate: string,
  customRange: { from: string; to: string }
) {
  const now = new Date("2025-05-19"); // Use a fixed 'now' for dummy data
  let fromDate, toDate;
  if (selectedDate === "custom" && customRange.from && customRange.to) {
    fromDate = new Date(customRange.from);
    toDate = new Date(customRange.to);
  } else {
    toDate = now;
    switch (selectedDate) {
      case "today":
        fromDate = new Date(now);
        break;
      case "7d":
        fromDate = new Date(now); fromDate.setDate(now.getDate() - 6); break;
      case "14d":
        fromDate = new Date(now); fromDate.setDate(now.getDate() - 13); break;
      case "30d":
        fromDate = new Date(now); fromDate.setDate(now.getDate() - 29); break;
      case "90d":
        fromDate = new Date(now); fromDate.setDate(now.getDate() - 89); break;
      default:
        fromDate = new Date("2000-01-01");
    }
  }
  return data.filter((entry: any) => {
    const entryDate = new Date(entry.date);
    const campaignMatch = selectedCampaign === "all" || entry.campaign === selectedCampaign;
    const dateMatch = entryDate >= fromDate && entryDate <= toDate;
    return campaignMatch && dateMatch;
  });
}

export default function Performance() {
  const [selectedMetric, setSelectedMetric] = useState("likes");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectedMetricObj = metricOptions.find(opt => opt.key === selectedMetric) || metricOptions[2];

  // Campaign selector state
  const [selectedCampaign, setSelectedCampaign] = useState(campaignOptions[0].key);
  const [campaignDropdown, setCampaignDropdown] = useState(false);

  // Date selector state
  const [selectedDate, setSelectedDate] = useState(dateOptions[3].key); // Default to 'Last 30 Days'
  const [dateDropdown, setDateDropdown] = useState(false);
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [customRangePickerOpen, setCustomRangePickerOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dateDropdown, customRangePickerOpen]);

  const filteredInteractionData = filterByCampaignAndDate(interactionData, selectedCampaign, selectedDate, customRange);
  const filteredEngagementData = filterByCampaignAndDate(engagementData, selectedCampaign, selectedDate, customRange);

  // Add this array at the top of your component, before the return statement
  const videos = [
    { src: "/videos/sample1.mp4" }, // Example with video
    { src: "" },                    // No video, will show icon
    { src: "/videos/sample2.mp4" }, // Example with video
    { src: "" },
    { src: "" },
    { src: "" }
  ];

  return (
    <div className="bg-[#f7f8fa] min-h-screen w-full p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold">Type AI</h1>
          <div className="flex flex-wrap gap-3">
            {/* Campaign Selector */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium min-w-[170px] shadow-sm hover:bg-gray-50 focus:outline-none"
                onClick={() => setCampaignDropdown((v) => !v)}
                onBlur={() => setTimeout(() => setCampaignDropdown(false), 150)}
                tabIndex={0}
                type="button"
              >
                <MdGridView className="w-5 h-5" />
                {campaignOptions.find(opt => opt.key === selectedCampaign)?.label}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {campaignDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {campaignOptions.map((option) => (
                    <button
                      key={option.key}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedCampaign === option.key ? "font-semibold bg-gray-100" : ""}`}
                      onClick={() => { setSelectedCampaign(option.key); setCampaignDropdown(false); }}
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
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium min-w-[170px] shadow-sm hover:bg-gray-50 focus:outline-none"
                onClick={() => {
                  setDateDropdown((v) => !v);
                  setCustomRangePickerOpen(false); // Always close custom range picker when opening dropdown
                }}
                tabIndex={0}
                type="button"
              >
                <MdCalendarToday className="w-5 h-5" />
                {selectedDate === "custom" && customRange.from && customRange.to
                  ? `${customRange.from} - ${customRange.to}`
                  : dateOptions.find(opt => opt.key === selectedDate)?.label}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dateDropdown && (
                <div className="absolute w-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {dateOptions.slice(0, 5).map((option) => (
                    <button
                      key={option.key}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedDate === option.key ? "font-semibold bg-gray-100" : ""}`}
                      onClick={() => { setSelectedDate(option.key); setDateDropdown(false); setCustomRangePickerOpen(false); }}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                  <div className="border-t my-1" />
                  <button
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedDate === "custom" ? "font-semibold bg-gray-100" : ""}`}
                    onClick={() => { setSelectedDate("custom"); setCustomRangePickerOpen(true); }}
                    type="button"
                  >
                    Choose Custom range
                  </button>
                </div>
              )}
              {/* Custom Range Picker shown below dropdown, not inside */}
              {selectedDate === "custom" && customRangePickerOpen && (
                <div className="absolute w-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20 flex flex-col items-center p-4" style={{top: '100%'}}>
                  <div className="flex items-center flex-wrap gap-2 w-full">
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-sm w-full"
                      value={customRange.from}
                      onChange={e => setCustomRange(r => ({ ...r, from: e.target.value }))}
                    />
                    <span className="mx-1">-</span>
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-sm w-full"
                      value={customRange.to}
                      onChange={e => setCustomRange(r => ({ ...r, to: e.target.value }))}
                    />
                  </div>
                  <button
                    className="mt-3 px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 text-sm w-full"
                    onClick={() => { setCustomRangePickerOpen(false); setDateDropdown(false); }}
                  >Apply</button>
                </div>
              )}
            </div>
            {/* Existing filter by accounts button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium min-w-[170px] shadow-sm hover:bg-gray-50 focus:outline-none">
              <MdAlternateEmail className="w-5 h-5" />Filter by accounts...
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {stats.slice(0, 4).map((stat) => (
            <GridBackground
                    title={stat.value}
                    className="cursor-default"
                    description={stat.label}
                  />
            
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {stats.slice(4).map((stat) => (
            <GridBackground
                    title={stat.value}
                    className="cursor-default"
                    description={stat.label}
                  />
            
          ))}
        </div>

        {/* Winning Videos & Creators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <CardSpotlight>
    <h3 className="text-xl font-semibold text-n900">Winning Videos</h3>
    <p className="text-sm text-gray-500 leading-relaxed">
      How many of this period’s videos are out-performing the pack, shown as both a count and a % of everything you published.
    </p>
    <div className="mt-2 text-n900">
      <span className="text-3xl font-bold">5</span>
      <span className="text-lg font-medium text-gray-500 ml-1">(18%)</span>
    </div>
</CardSpotlight>

          
          
          <CardSpotlight>
    <h3 className="text-xl font-semibold text-n900">Winning Creators</h3>
    <p className="text-sm text-gray-500 leading-relaxed">
      At a glance, see how many creators are consistently beating the average, expressed as a count and the % of your roster.
    </p>
    <div className="mt-2 text-n900">
      <span className="text-3xl font-bold">2</span>
      <span className="text-lg font-medium text-gray-500 ml-1">(66%)</span>
    </div>
</CardSpotlight>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Interaction metrics</span>
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-[#f7f8fa] border border-gray-200 rounded-md text-sm font-medium min-w-[120px] shadow-sm hover:bg-gray-50 focus:outline-none"
                  onClick={() => setDropdownOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                  tabIndex={0}
                  type="button"
                >
                  {selectedMetricObj.label}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    {metricOptions.map((option) => (
                      <button
                        key={option.key}
                        className={`flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedMetric === option.key ? "font-semibold bg-gray-100" : ""}`}
                        onClick={() => { setSelectedMetric(option.key); setDropdownOpen(false); }}
                        type="button"
                      >
                        {selectedMetric === option.key && (
                          <svg className="w-4 h-4 mr-2 text-violet-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        )}
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredInteractionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={d => String(new Date(d).getDate())} />
                <YAxis tickFormatter={formatNumberShort} axisLine={false} tickLine={false} />
                <Tooltip content={(props) => <CustomBarTooltip {...props} selectedMetric={selectedMetric} />} />
                <Bar dataKey={selectedMetric} fill={selectedMetricObj.color} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Engagement</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredEngagementData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={d => String(new Date(d).getDate())} />
                <YAxis tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <Tooltip content={(props) => <CustomLineTooltip {...props} />} />
                <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Section (Videos) */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <span className="font-semibold text-lg mb-4 block">Content</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((video, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden"
              >
                {video.src ? (
                  <video
                    src={video.src}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MdVideocam className="w-10 h-10 text-gray-400" />
                  )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}