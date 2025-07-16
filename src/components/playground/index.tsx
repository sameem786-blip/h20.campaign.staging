"use client";

import React, { useState } from "react";
import {
  MdBusiness,
  MdLink,
  MdInventory,
  MdLightbulb,
  MdPerson,
  MdPublic,
  MdFavorite,
  MdNetworkCheck,
  MdSend,
} from "react-icons/md";
import BuilderCard from "./BuilderCard";
import { LabeledInput, LabeledTextarea, LabeledTag } from "./LabeledFields";

type Message = {
  text: string;
  time: string;
  from: "bot" | "user";
};

type BuilderData = {
  companyName: string;
  companyUrl: string;
  productDesc: string;
  valueProp: string;
  problemSolved: string;
  competitors: string;
  characterView: string;
  countries: string[];
  interests: string;
  networks: string[];
};

const initialBuilderData: BuilderData = {
  companyName: "EcoWear",
  companyUrl: "",
  productDesc: "We sell stylish, high-quality clothing made from 100% sustainable and ethically sourced materials.",
  valueProp: "Our customers get fashion-forward apparel that they can feel good about wearing, knowing it has a minimal environmental impact and supports fair labor practices.",
  problemSolved: "We solve the problem for conscious consumers who struggle to find fashionable clothing that doesn't compromise their ethical and environmental values.",
  competitors: "1. Everlane - Differentiator: We are more focused on bold, expressive styles.\n2. Patagonia - Differentiator: We focus on everyday fashion rather than outdoor gear.",
  characterView: "Meet Sarah, a 28-year-old graphic designer living in sunny Los Angeles. She's passionate about sustainability and actively seeks out brands that align with her ethical values. Her weekends are spent exploring local farmers' markets and vintage shops. She's always on the lookout for high-quality, eco-conscious products to recommend to her engaged online community.",
  countries: ["USA", "Canada", "UK"],
  interests: "hello",
  networks: ["All", "YouTube", "TikTok"],
};

const AVAILABLE_NETWORKS = ["All", "Instagram", "YouTube", "TikTok"];

export default function Playground() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your assistant. How can I help you manage your campaigns today?",
      time: "08:38 PM",
      from: "bot",
    },
  ]);
  const [input, setInput] = useState("");

  // Builder state
  const [builderData, setBuilderData] = useState<BuilderData>(initialBuilderData);
  // editCards: Set of currently open edit cards
  const [editCards, setEditCards] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Partial<BuilderData & { countriesInput?: string }>>({});

  // Chat send handler
  const handleSend = () => {
    if (input.trim()) {
      const userMsg = {
        text: input,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        from: "user" as const,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      // Dummy bot reply after a short delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "This is a bot reply to: " + userMsg.text,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            from: "bot" as const,
          },
        ]);
      }, 800);
    }
  };

  // Section edit handlers
  const handleEdit = (card: string) => {
    setEditCards(prev => new Set([...prev, card]));
    switch (card) {
      case "company":
        setDraft(prev => ({
          ...prev,
          companyName: builderData.companyName,
          companyUrl: builderData.companyUrl,
        }));
        break;
      case "productValue":
        setDraft(prev => ({
          ...prev,
          productDesc: builderData.productDesc,
          valueProp: builderData.valueProp,
        }));
        break;
      case "marketContext":
        setDraft(prev => ({
          ...prev,
          problemSolved: builderData.problemSolved,
          competitors: builderData.competitors,
        }));
        break;
      case "characterView":
        setDraft(prev => ({
          ...prev,
          characterView: builderData.characterView,
        }));
        break;
      case "country":
        setDraft(prev => ({
          ...prev,
          countriesInput: builderData.countries.join(", "),
          countries: builderData.countries,
        }));
        break;
      case "interests":
        setDraft(prev => ({
          ...prev,
          interests: builderData.interests,
        }));
        break;
      case "networks":
        setDraft(prev => ({
          ...prev,
          networks: builderData.networks,
        }));
        break;
      default:
        break;
    }
  };

  const handleCancel = (card: string) => {
    setEditCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(card);
      return newSet;
    });
    // Clear only the draft data for this specific card
    setDraft(prev => {
      const newDraft = { ...prev };
      switch (card) {
        case "company":
          delete newDraft.companyName;
          delete newDraft.companyUrl;
          break;
        case "productValue":
          delete newDraft.productDesc;
          delete newDraft.valueProp;
          break;
        case "marketContext":
          delete newDraft.problemSolved;
          delete newDraft.competitors;
          break;
        case "characterView":
          delete newDraft.characterView;
          break;
        case "country":
          delete newDraft.countriesInput;
          delete newDraft.countries;
          break;
        case "interests":
          delete newDraft.interests;
          break;
        case "networks":
          delete newDraft.networks;
          break;
      }
      return newDraft;
    });
  };

  const handleSave = (card: string) => {
    if (card === "country" && draft.countriesInput !== undefined) {
      const countries = Array.from(
        new Set(
          draft.countriesInput
            .split(",")
            .map(c => c.trim())
            .filter(Boolean)
        )
      );
      setBuilderData(prev => ({ ...prev, countries }));
    } else {
      // Save only the draft data for this specific card
      const cardData: Partial<BuilderData> = {};
      switch (card) {
        case "company":
          if (draft.companyName !== undefined) cardData.companyName = draft.companyName;
          if (draft.companyUrl !== undefined) cardData.companyUrl = draft.companyUrl;
          break;
        case "productValue":
          if (draft.productDesc !== undefined) cardData.productDesc = draft.productDesc;
          if (draft.valueProp !== undefined) cardData.valueProp = draft.valueProp;
          break;
        case "marketContext":
          if (draft.problemSolved !== undefined) cardData.problemSolved = draft.problemSolved;
          if (draft.competitors !== undefined) cardData.competitors = draft.competitors;
          break;
        case "characterView":
          if (draft.characterView !== undefined) cardData.characterView = draft.characterView;
          break;
        case "interests":
          if (draft.interests !== undefined) cardData.interests = draft.interests;
          break;
        case "networks":
          if (draft.networks !== undefined) cardData.networks = draft.networks;
          break;
      }
      setBuilderData(prev => ({ ...prev, ...cardData }));
    }
    
    // Close this specific card
    setEditCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(card);
      return newSet;
    });
    
    // Clear only the draft data for this specific card
    setDraft(prev => {
      const newDraft = { ...prev };
      switch (card) {
        case "company":
          delete newDraft.companyName;
          delete newDraft.companyUrl;
          break;
        case "productValue":
          delete newDraft.productDesc;
          delete newDraft.valueProp;
          break;
        case "marketContext":
          delete newDraft.problemSolved;
          delete newDraft.competitors;
          break;
        case "characterView":
          delete newDraft.characterView;
          break;
        case "country":
          delete newDraft.countriesInput;
          delete newDraft.countries;
          break;
        case "interests":
          delete newDraft.interests;
          break;
        case "networks":
          delete newDraft.networks;
          break;
      }
      return newDraft;
    });
    // API call can go here
  };

  return (
    <div className="flex flex-row h-[calc(100vh-82px)] fixed w-full bg-[#f7f8fa]">
      {/* Chat Section */}
      <div className="flex flex-col !w-[370px] md:!w-[470px] max-w-full border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-semibold">Chat</h2>
        </div>
        {/* Chat messages (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-8 flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              <div>
                <div
                  className={`rounded-xl px-4 py-3 max-w-xs break-words
                  ${msg.from === "user" ? "bg-black text-white ml-auto" : "bg-gray-100 text-gray-900"}`}
                >
                  {msg.text}
                </div>
                <div className={`text-xs mt-1 ${msg.from === "user" ? "text-gray-300 text-right" : "text-gray-400"}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Input (fixed at bottom) */}
        <div className="p-4 border-t border-gray-100 flex items-center bg-white flex-shrink-0">
          <input
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 mr-2 focus:outline-none"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            className="bg-black text-white rounded-lg p-2 flex items-center justify-center"
            onClick={handleSend}
            type="button"
            aria-label="Send"
          >
            <MdSend className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Builder Section (header fixed, content scrollable) */}
      <div className="flex-1 flex flex-col ">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-white flex-shrink-0">
          <h1 className="text-3xl font-bold">New Campaign Builder</h1>
              <button
            className="bg-black text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 text-lg"
                type="button"
              >
            <span className="text-2xl">+</span> Start Research
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-8 space-y-8">
          {/* Company Details */}
          <BuilderCard
  icon={<MdBusiness className="w-7 h-7" />}
  title="Company Details"
  editCard={editCards.has("company") ? "company" : null}
  cardKey="company"
  onEdit={() => handleEdit("company")}
  onCancel={() => handleCancel("company")}
  onSave={() => handleSave("company")}
  editContent={
    <div className="flex flex-col md:flex-row gap-4">
      <LabeledInput
        icon={<MdBusiness className=" h-5" />}
        label="Company Name"
        value={draft.companyName ?? builderData.companyName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, companyName: e.target.value }))}
        autoFocus
      />
      <LabeledInput
        icon={<MdLink className="w-5 h-5" />}
        label="Company URL"
        value={draft.companyUrl ?? builderData.companyUrl}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, companyUrl: e.target.value }))}
      />
    </div>
  }
>
  <div className="flex flex-col md:flex-row gap-4">
    <LabeledTag
      icon={<MdBusiness className="w-5 h-5" />}
      label="Company Name"
      value={builderData.companyName}
    />
    <LabeledTag
      icon={<MdLink className="w-5 h-5" />}
      label="Company URL"
      value={
        builderData.companyUrl ? (
          <a href={builderData.companyUrl} className="underline" target="_blank" rel="noopener noreferrer">
            {builderData.companyUrl}
          </a>
        ) : ""
      }
    />
  </div>
           </BuilderCard>

          {/* Product & Value */}
          <BuilderCard
  icon={<MdInventory className="w-7 h-7" />}
  title="Product & Value"
  editCard={editCards.has("productValue") ? "productValue" : null}
  cardKey="productValue"
  onEdit={() => handleEdit("productValue")}
  onCancel={() => handleCancel("productValue")}
  onSave={() => handleSave("productValue")}
  editContent={
    <div>
      <LabeledTextarea
        icon={<MdInventory className="w-5 h-5" />}
        label="Product / Service Description"
        value={draft.productDesc ?? builderData.productDesc}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(d => ({ ...d, productDesc: e.target.value }))}
        rows={3}
        autoFocus
      />
      <LabeledTextarea
        icon={<MdLightbulb className="w-5 h-5" />}
        label="Unique Value Proposition"
        value={draft.valueProp ?? builderData.valueProp}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(d => ({ ...d, valueProp: e.target.value }))}
        rows={3}
      />
    </div>
  }
>
  <div>
    <LabeledTag
      icon={<MdInventory className="w-5 h-5" />}
      label="Product / Service Description"
      value={builderData.productDesc}
    />
    <LabeledTag
      icon={<MdLightbulb className="w-5 h-5" />}
      label="Unique Value Proposition"
      value={builderData.valueProp}
    />
  </div>
            </BuilderCard>

          {/* Market Context */}
          <BuilderCard
  icon={<MdNetworkCheck className="w-7 h-7" />}
  title="Market Context"
  editCard={editCards.has("marketContext") ? "marketContext" : null}
  cardKey="marketContext"
  onEdit={() => handleEdit("marketContext")}
  onCancel={() => handleCancel("marketContext")}
  onSave={() => handleSave("marketContext")}
  editContent={
    <div>
      <LabeledTextarea
        icon={<MdNetworkCheck className="w-5 h-5" />}
        label="Problem Solved"
        value={draft.problemSolved ?? builderData.problemSolved}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(d => ({ ...d, problemSolved: e.target.value }))}
        rows={3}
        autoFocus
      />
      <LabeledTextarea
        icon={<MdNetworkCheck className="w-5 h-5" />}
        label="Competitors"
        value={draft.competitors ?? builderData.competitors}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(d => ({ ...d, competitors: e.target.value }))}
        rows={3}
      />
    </div>
  }
>
  <div>
    <LabeledTag
      icon={<MdNetworkCheck className="w-5 h-5" />}
      label="Problem Solved"
      value={builderData.problemSolved}
    />
    <LabeledTag
      icon={<MdNetworkCheck className="w-5 h-5" />}
      label="Competitors"
      value={builderData.competitors}
    />
  </div>
           </BuilderCard>

          {/* Character View */}
          <BuilderCard
  icon={<MdPerson className="w-7 h-7" />}
  title="Detailed Character View"
  editCard={editCards.has("characterView") ? "characterView" : null}
  cardKey="characterView"
  onEdit={() => handleEdit("characterView")}
  onCancel={() => handleCancel("characterView")}
  onSave={() => handleSave("characterView")}
  editContent={
    <LabeledTextarea
      icon={<MdPerson className="w-5 h-5" />}
      label="Character View Description"
      value={draft.characterView ?? builderData.characterView}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(d => ({ ...d, characterView: e.target.value }))}
      rows={3}
      autoFocus
    />
  }
>
  <LabeledTag
    icon={<MdPerson className="w-5 h-5" />}
    label="Character View Description"
    value={builderData.characterView}
  />
           </BuilderCard>

          {/* Country */}
          <BuilderCard
  icon={<MdPublic className="w-7 h-7" />}
  title="Country"
  editCard={editCards.has("country") ? "country" : null}
  cardKey="country"
  onEdit={() => handleEdit("country")}
  onCancel={() => handleCancel("country")}
  onSave={() => handleSave("country")}
  editContent={
    <input
      className="w-full border rounded-lg px-4 py-2 text-base mt-1"
      value={draft.countriesInput ?? (builderData.countries.join(", "))}
      onChange={e => setDraft(d => ({ ...d, countriesInput: e.target.value }))}
      placeholder="Type countries separated by commas, e.g. USA, Canada, UK"
      autoFocus
    />
  }
>
  <div className="flex flex-wrap gap-2">
    {(builderData.countries.length > 0
      ? builderData.countries
      : []
    ).map((country) => (
      <span
        key={country}
        className="bg-gray-100 px-4 py-1 rounded-lg text-base font-semibold flex items-center"
      >
        {country}
        <span className="ml-1 text-gray-400 font-normal">×</span>
      </span>
    ))}
  </div>
           </BuilderCard>

          {/* Interests */}
          <BuilderCard
  icon={<MdFavorite className="w-7 h-7" />}
  title="Interests"
  editCard={editCards.has("interests") ? "interests" : null}
  cardKey="interests"
  onEdit={() => handleEdit("interests")}
  onCancel={() => handleCancel("interests")}
  onSave={() => handleSave("interests")}
  editContent={
    <textarea
      className="w-full border rounded-lg px-4 py-2 text-base mt-1"
      value={draft.interests ?? builderData.interests}
      onChange={e => setDraft(d => ({ ...d, interests: e.target.value }))}
      rows={3}
      autoFocus
    />
  }
>
  {builderData.interests ? (
    <span className="inline-flex items-center gap-2 bg-gray-100 px-4 py-1 rounded-lg text-base font-semibold">
      <MdFavorite className="w-5 h-5 text-pink-400" />
      {builderData.interests}
      <span className="ml-1 text-gray-400 font-normal">×</span>
    </span>
  ) : (
    <span className="text-gray-400 italic">Tap to add…</span>
  )}
           </BuilderCard>

          {/* Networks */}
          <BuilderCard
  icon={<MdNetworkCheck className="w-7 h-7" />}
  title="Choose Network"
  editCard={editCards.has("networks") ? "networks" : null}
  cardKey="networks"
  onEdit={() => handleEdit("networks")}
  onCancel={() => handleCancel("networks")}
  onSave={() => handleSave("networks")}
  editContent={
    <div className="flex flex-wrap gap-4">
      {AVAILABLE_NETWORKS.map(network => {
        const selected = (draft.networks ?? builderData.networks).includes(network) ||
          ((draft.networks ?? builderData.networks).includes("All") && network !== "All");
        return (
          <button
            key={network}
            type="button"
            className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2
              ${selected ? "bg-black text-white" : "bg-white text-black border border-gray-200"}
              transition-colors duration-100`}
            onClick={e => {
              e.stopPropagation();
              setDraft(d => {
                let current = d.networks ?? builderData.networks;
                if (network === "All") {
                  // Toggle all
                  if (current.includes("All")) {
                    return { ...d, networks: [] };
                  } else {
                    return { ...d, networks: [...AVAILABLE_NETWORKS] };
                  }
                } else {
                  // Toggle individual
                  let next = current.includes(network)
                    ? current.filter(n => n !== network && n !== "All")
                    : [...current.filter(n => n !== "All"), network];
                  // If all selected, add "All"
                  if (next.length === AVAILABLE_NETWORKS.length - 1) {
                    next = [...AVAILABLE_NETWORKS];
                  }
                  return { ...d, networks: next };
                }
              });
            }}
          >
            {selected && (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {network}
          </button>
        );
      })}
    </div>
  }
>
  <div className="flex flex-wrap gap-3">
    {builderData.networks
      .filter(n => n !== "All")
      .map(network => (
        <span
          key={network}
          className="bg-gray-100 px-6 py-2 rounded-lg text-base font-semibold"
        >
          {network}
        </span>
      ))}
  </div>
            </BuilderCard>
        </div>
      </div>
    </div>
  );
}