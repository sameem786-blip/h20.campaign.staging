"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  MdBusiness,
  MdLink,
  MdInventory,
  MdLightbulb,
  MdPublic,
  MdFavorite,
  MdNetworkCheck,
  MdSend,
} from "react-icons/md";
import BuilderCard from "./BuilderCard";
import { LabeledInput, LabeledTextarea, LabeledTag } from "./LabeledFields";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge2 } from "@/components/ui/badge2";
import { useCampaignBuilderStore, type Message, type BuilderData } from "@/store/campaignBuilder";

const AVAILABLE_NETWORKS = ["All", "Instagram", "YouTube", "TikTok"];

export default function Playground() {
  const router = useRouter();
  const supabase = createClient();
  const [isMounted, setIsMounted] = useState(false);
  
  // Get all state and actions from the store
  const {
    builderData,
    editCards,
    draft,
    messages,
    input,
    isLoading,
    isSaving,
    lastUpdatedFields,
    highlightedFields,
    setBuilderData,
    setEditCards,
    setDraft,
    setMessages,
    addMessage,
    setInput,
    setIsLoading,
    setIsSaving,
    setLastUpdatedFields,
    clearLastUpdatedFields,
    setHighlightedFields,
    removeHighlightedField,
    initializeChat,
  } = useCampaignBuilderStore();

  // Initialize chat on component mount and prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    initializeChat();
  }, [initializeChat]);

  // Function to detect which fields were updated and scroll to them
  const detectUpdatedFields = (oldData: BuilderData, newData: BuilderData): string[] => {
    const updatedFields: string[] = [];
    
    if (oldData.campaignName !== newData.campaignName) updatedFields.push("campaignName");
    if (oldData.companyName !== newData.companyName || oldData.companyUrl !== newData.companyUrl) updatedFields.push("company");
    if (oldData.productDesc !== newData.productDesc || oldData.valueProp !== newData.valueProp) updatedFields.push("productValue");
    if (oldData.problemSolved !== newData.problemSolved || oldData.competitors !== newData.competitors) updatedFields.push("marketContext");
    if (JSON.stringify(oldData.countries) !== JSON.stringify(newData.countries)) updatedFields.push("country");
    if (JSON.stringify(oldData.interests) !== JSON.stringify(newData.interests)) updatedFields.push("interests");
    if (JSON.stringify(oldData.networks) !== JSON.stringify(newData.networks)) updatedFields.push("networks");
    
    return updatedFields;
  };

  // Define form field order
  const FORM_FIELD_ORDER = [
    "company",
    "productValue", 
    "marketContext",
    "country",
    "interests",
    "networks",
    "campaignName"
  ];

  // Auto-scroll to the first updated field (earliest in form order)
  const scrollToUpdatedFields = useCallback((updatedFields: string[]) => {
    if (updatedFields.length > 0) {
      // Find the first field in form order
      const firstFieldByOrder = FORM_FIELD_ORDER.find(field => updatedFields.includes(field));
      if (firstFieldByOrder) {
        const element = document.getElementById(`builder-card-${firstFieldByOrder}`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Clear after scroll
          setTimeout(() => clearLastUpdatedFields(), 2000);
        }
      }
    }
  }, [clearLastUpdatedFields]);

  // Effect to handle auto-scroll when fields are updated
  useEffect(() => {
    if (lastUpdatedFields.length > 0) {
      scrollToUpdatedFields(lastUpdatedFields);
    }
  }, [lastUpdatedFields, clearLastUpdatedFields, scrollToUpdatedFields]);

  // Handler to remove field highlighting when user clicks on it
  const handleFieldClick = (fieldName: string) => {
    if (highlightedFields.includes(fieldName)) {
      removeHighlightedField(fieldName);
    }
  };

  // Helper to get highlight styles for a field
  const getHighlightStyles = (fieldName: string) => {
    if (highlightedFields.includes(fieldName)) {
      return {
        boxShadow: '0 0 0 2px rgba(251, 146, 60, 0.4), 0 0 12px rgba(251, 146, 60, 0.2)',
        backgroundColor: 'rgba(254, 215, 170, 0.1)',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
      };
    }
    return {};
  };

  // Prevent hydration mismatch by not rendering messages until client-side
  if (!isMounted) {
    return (
      <div className="flex flex-row h-[calc(100vh-82px)] fixed w-full bg-[#f7f8fa]">
        <div className="flex flex-col !w-[370px] md:!w-[470px] max-w-full border-r border-gray-200 bg-white">
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-xl font-semibold">Chat</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex justify-center items-center h-full">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-white flex-shrink-0">
            <h1 className="text-3xl font-bold">New Campaign Builder</h1>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-8">
            <div className="flex justify-center items-center h-full">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // API function to call campaign-builder endpoint
  const callCampaignBuilder = async (messages: Message[], builderData: BuilderData) => {
    const apiData = {
      messages: messages.map(msg => ({
        text: msg.text,
        time: msg.time,
        role: msg.role
      })),
      builder_data: {
        campaign_name: builderData.campaignName,
        company_name: builderData.companyName,
        company_url: builderData.companyUrl,
        product_description: builderData.productDesc,
        value_proposition: builderData.valueProp,
        problem_solved: builderData.problemSolved,
        competitors: builderData.competitors,
        countries: builderData.countries,
        interests: builderData.interests,
        networks: builderData.networks
      }
    };

    const response = await fetch('https://kiko-test.replit.app/campaign-builder', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  };

  // Function to save campaign data to Supabase
  const saveCampaignToSupabase = async (builderData: BuilderData) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Save campaign data
      const { data, error } = await supabase
        .from('research_campaigns')
        .insert({
          owner_id: user.id,
          campaign_name: builderData.campaignName,
          company_name: builderData.companyName,
          company_url: builderData.companyUrl,
          product_description: builderData.productDesc,
          value_proposition: builderData.valueProp,
          problem_solved: builderData.problemSolved,
          competitors: builderData.competitors,
          countries: builderData.countries,
          interests: builderData.interests,
          networks: builderData.networks
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error saving campaign:', error);
      throw error;
    }
  };

  // Chat send handler
  const handleSend = async () => {
    if ((input ?? "").trim() && !isLoading) {
      const userMsg = {
        text: input,
        time: new Date().toISOString(),
        role: "user" as const,
      };
      
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);
      
      try {
        const response = await callCampaignBuilder(newMessages, builderData);
        
        // Add bot response to messages
        const botMsg = {
          text: response.reply,
          time: new Date().toISOString(),
          role: "bot" as const,
        };
        addMessage(botMsg);
        
        // Update builder data with response and detect changes for auto-scroll
        const updatedBuilderData = {
          campaignName: response.builder_data.campaign_name,
          companyName: response.builder_data.company_name,
          companyUrl: response.builder_data.company_url,
          productDesc: response.builder_data.product_description,
          valueProp: response.builder_data.value_proposition,
          problemSolved: response.builder_data.problem_solved,
          competitors: response.builder_data.competitors,
          countries: response.builder_data.countries,
          interests: response.builder_data.interests,
          networks: response.builder_data.networks
        };
        
        // Detect which fields were updated for auto-scroll and highlighting
        const updatedFields = detectUpdatedFields(builderData, updatedBuilderData);
        if (updatedFields.length > 0) {
          setLastUpdatedFields(updatedFields);
          setHighlightedFields(updatedFields);
        }
        
        setBuilderData(updatedBuilderData);
        
      } catch (error) {
        console.error('Error calling campaign builder API:', error);
        // Add error message
        const errorMsg = {
          text: "Sorry, I'm having trouble connecting. Please try again.",
          time: new Date().toISOString(),
          role: "bot" as const,
        };
        addMessage(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Section edit handlers
  const handleEdit = (card: string) => {
    if (isLoading) return; // Prevent editing while bot is replying
    const newEditCards = new Set([...editCards, card]);
    setEditCards(newEditCards);
    switch (card) {
      case "company":
        setDraft({
          ...draft,
          companyName: builderData.companyName,
          companyUrl: builderData.companyUrl,
        });
        break;
      case "productValue":
        setDraft({
          ...draft,
          productDesc: builderData.productDesc,
          valueProp: builderData.valueProp,
        });
        break;
      case "marketContext":
        setDraft({
          ...draft,
          problemSolved: builderData.problemSolved,
          competitors: builderData.competitors,
        });
        break;
      case "country":
        setDraft({
          ...draft,
          countriesInput: builderData.countries.join(", "),
          countries: builderData.countries,
        });
        break;
      case "interests":
        setDraft({
          ...draft,
          interestsInput: builderData.interests.join(", "),
          interests: builderData.interests,
        });
        break;
      case "networks":
        setDraft({
          ...draft,
          networks: builderData.networks,
        });
        break;
      default:
        break;
    }
  };

  const handleCancel = (card: string) => {
    const newEditCards = new Set(editCards);
    newEditCards.delete(card);
    setEditCards(newEditCards);
    // Clear only the draft data for this specific card
    const newDraft = { ...draft };
      switch (card) {
        case "campaignName":
          delete newDraft.campaignName;
          break;
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
        case "country":
          delete newDraft.countriesInput;
          delete newDraft.countries;
          break;
        case "interests":
          delete newDraft.interestsInput;
          delete newDraft.interests;
          break;
        case "networks":
          delete newDraft.networks;
          break;
      }
      setDraft(newDraft);
  };

  const handleSave = (card: string) => {
    if (card === "country" && draft.countriesInput !== undefined) {
      const countries = Array.from(
        new Set(
          draft.countriesInput
            .split(",")
            .map(c => (c ?? "").trim())
            .filter(Boolean)
        )
      );
      setBuilderData({ countries });
    } else if (card === "interests" && draft.interestsInput !== undefined) {
      const interests = Array.from(
        new Set(
          draft.interestsInput
            .split(",")
            .map(i => (i ?? "").trim())
            .filter(Boolean)
        )
      );
      setBuilderData({ interests });
    } else {
      // Save only the draft data for this specific card
      const cardData: Partial<BuilderData> = {};
      switch (card) {
        case "campaignName":
          if (draft.campaignName !== undefined) cardData.campaignName = draft.campaignName;
          break;
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
        case "interests":
          // interests handled above in the special case
          break;
        case "networks":
          if (draft.networks !== undefined) cardData.networks = draft.networks;
          break;
      }
      setBuilderData(cardData);
    }
    
    // Close this specific card
    const newEditCards = new Set(editCards);
    newEditCards.delete(card);
    setEditCards(newEditCards);
    
    // Clear only the draft data for this specific card
    const newDraft = { ...draft };
      switch (card) {
        case "campaignName":
          delete newDraft.campaignName;
          break;
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
        case "country":
          delete newDraft.countriesInput;
          delete newDraft.countries;
          break;
        case "interests":
          delete newDraft.interestsInput;
          delete newDraft.interests;
          break;
        case "networks":
          delete newDraft.networks;
          break;
      }
      setDraft(newDraft);
    // API call can go here
  };

  // Helper function to get missing required fields
  const getMissingFields = () => {
    const missing: string[] = [];
    
    // Required fields only
    if (!(builderData.companyName ?? "").trim()) missing.push("Company Name");
    if (!(builderData.companyUrl ?? "").trim()) missing.push("Company URL");
    if (!(builderData.productDesc ?? "").trim()) missing.push("Product/Service Description");
    if (!(builderData.valueProp ?? "").trim()) missing.push("Unique Value Proposition");
    if (!(builderData.problemSolved ?? "").trim()) missing.push("Problem Solved");
    if (builderData.countries.length === 0) missing.push("Country");
    if (builderData.networks.length === 0) missing.push("Choose Network");
    if (!(builderData.campaignName ?? "").trim()) missing.push("Campaign Name");
    
    return missing;
  };

  // Validation function to check if all required fields are filled
  const isFormComplete = () => {
    return getMissingFields().length === 0;
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
            <div key={idx} className={`mb-8 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div>
                <div
                  className={`rounded-xl px-4 py-3 max-w-xs break-words
                  ${msg.role === "user" ? "bg-black text-white ml-auto" : "bg-gray-100 text-gray-900"}`}
                >
                  {msg.text}
                </div>
                <div className={`text-xs mt-1 ${msg.role === "user" ? "text-gray-300 text-right" : "text-gray-400"}`}>
                  {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Input (fixed at bottom) */}
        <div className="p-4 border-t border-gray-100 flex items-center bg-white flex-shrink-0">
          <input
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 mr-2 focus:outline-none disabled:opacity-50"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) handleSend();
            }}
            disabled={isLoading}
          />
          <button
            className="bg-black text-white rounded-lg p-2 flex items-center justify-center disabled:opacity-50"
            onClick={handleSend}
            disabled={isLoading}
            type="button"
            aria-label="Send"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <MdSend className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Builder Section (header fixed, content scrollable) */}
      <div className="flex-1 flex flex-col ">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-white flex-shrink-0">
          <h1 className="text-3xl font-bold">New Campaign Builder</h1>
          <div className="relative">
            <GradientButton
              className="gradient-button"
              onClick={async () => {
                if (isFormComplete() && !isSaving) {
                  setIsSaving(true);
                  try {
                    await saveCampaignToSupabase(builderData);
                    router.push('/research/confirmation');
                  } catch (error) {
                    console.error('Error saving campaign:', error);
                    // You could add a toast notification here
                    alert('Failed to save campaign. Please try again.');
                  } finally {
                    setIsSaving(false);
                  }
                }
              }}
              disabled={!isFormComplete() || isSaving}
              title={
                !isFormComplete() 
                  ? `Please complete the following required fields:\n• ${getMissingFields().join('\n• ')}`
                  : ""
              }
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>+ Start Research</>
              )}
            </GradientButton>
          </div>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-8 space-y-8">
          {/* Company Details */}
          <div 
            id="builder-card-company"
            style={getHighlightStyles("company")}
            onClick={() => handleFieldClick("company")}
          >
            <BuilderCard
  icon={<MdBusiness className="w-7 h-7" />}
  title="Company Details"
  editCard={editCards.has("company") ? "company" : null}
  cardKey="company"
  onEdit={() => handleEdit("company")}
  onCancel={() => handleCancel("company")}
  onSave={() => handleSave("company")}
  disabled={isLoading}
  editContent={
    <div className="flex flex-col md:flex-row gap-4">
      <LabeledInput
        icon={<MdBusiness className=" h-5" />}
        label="Company Name"
        required={true}
        value={draft.companyName ?? builderData.companyName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, companyName: e.target.value })}
        autoFocus
      />
      <LabeledInput
        icon={<MdLink className="w-5 h-5" />}
        label="Company URL"
        required={true}
        value={draft.companyUrl ?? builderData.companyUrl}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, companyUrl: e.target.value })}
      />
    </div>
  }
>
  <div className="flex flex-col md:flex-row gap-4">
    <LabeledTag
      icon={<MdBusiness className="w-5 h-5" />}
      label="Company Name"
      required={true}
      value={builderData.companyName}
    />
    <LabeledTag
      icon={<MdLink className="w-5 h-5" />}
      label="Company URL"
      required={true}
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
          </div>

          {/* Product & Value */}
          <div 
            id="builder-card-productValue"
            style={getHighlightStyles("productValue")}
            onClick={() => handleFieldClick("productValue")}
          >
            <BuilderCard
  icon={<MdInventory className="w-7 h-7" />}
  title="Product & Value"
  editCard={editCards.has("productValue") ? "productValue" : null}
  cardKey="productValue"
  onEdit={() => handleEdit("productValue")}
  onCancel={() => handleCancel("productValue")}
  onSave={() => handleSave("productValue")}
  disabled={isLoading}
  editContent={
    <div>
      <LabeledTextarea
        icon={<MdInventory className="w-5 h-5" />}
        label="Product / Service Description"
        required={true}
        value={draft.productDesc ?? builderData.productDesc}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft({ ...draft, productDesc: e.target.value })}
        rows={3}
        autoFocus
      />
      <LabeledTextarea
        icon={<MdLightbulb className="w-5 h-5" />}
        label="Unique Value Proposition"
        required={true}
        value={draft.valueProp ?? builderData.valueProp}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft({ ...draft, valueProp: e.target.value })}
        rows={3}
      />
    </div>
  }
>
  <div>
    <LabeledTag
      icon={<MdInventory className="w-5 h-5" />}
      label="Product / Service Description"
      required={true}
      value={builderData.productDesc}
    />
    <LabeledTag
      icon={<MdLightbulb className="w-5 h-5" />}
      label="Unique Value Proposition"
      required={true}
      value={builderData.valueProp}
    />
  </div>
            </BuilderCard>
          </div>

          {/* Market Context */}
          <div 
            id="builder-card-marketContext"
            style={getHighlightStyles("marketContext")}
            onClick={() => handleFieldClick("marketContext")}
          >
            <BuilderCard
  icon={<MdNetworkCheck className="w-7 h-7" />}
  title="Market Context"
  editCard={editCards.has("marketContext") ? "marketContext" : null}
  cardKey="marketContext"
  onEdit={() => handleEdit("marketContext")}
  onCancel={() => handleCancel("marketContext")}
  onSave={() => handleSave("marketContext")}
  disabled={isLoading}
  editContent={
    <div>
      <LabeledTextarea
        icon={<MdNetworkCheck className="w-5 h-5" />}
        label="Problem Solved"
        required={true}
        value={draft.problemSolved ?? builderData.problemSolved}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft({ ...draft, problemSolved: e.target.value })}
        rows={3}
        autoFocus
      />
      <LabeledTextarea
        icon={<MdNetworkCheck className="w-5 h-5" />}
        label="Competitors"
        value={draft.competitors ?? builderData.competitors}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft({ ...draft, competitors: e.target.value })}
        rows={3}
      />
    </div>
  }
>
  <div>
    <LabeledTag
      icon={<MdNetworkCheck className="w-5 h-5" />}
      label="Problem Solved"
      required={true}
      value={builderData.problemSolved}
    />
    <LabeledTag
      icon={<MdNetworkCheck className="w-5 h-5" />}
      label="Competitors"
      value={builderData.competitors}
    />
  </div>
           </BuilderCard>
          </div>

          {/* Country */}
          <div 
            id="builder-card-country"
            style={getHighlightStyles("country")}
            onClick={() => handleFieldClick("country")}
          >
            <BuilderCard
  icon={<MdPublic className="w-7 h-7" />}
  title="Country *"
  editCard={editCards.has("country") ? "country" : null}
  cardKey="country"
  onEdit={() => handleEdit("country")}
  onCancel={() => handleCancel("country")}
  onSave={() => handleSave("country")}
  disabled={isLoading}
  editContent={
    <input
      className="w-full border rounded-lg px-4 py-2 text-base mt-1"
      value={draft.countriesInput ?? (builderData.countries.join(", "))}
      onChange={e => setDraft({ ...draft, countriesInput: e.target.value })}
      placeholder="Type countries separated by commas, e.g. USA, Canada, UK"
      autoFocus
    />
  }
>
  <div className="flex flex-wrap gap-2">
    {builderData.countries.length > 0 ? (
      builderData.countries.map((country) => (
        <Badge2
          key={country}
          variant="turbo"
          onClick={() =>{}}
        >
          {country}
        </Badge2>
      ))
    ) : (
      <span className="text-gray-400 italic">Tap to add...</span>
    )}
  </div>
           </BuilderCard>
          </div>

          {/* Interests */}
          <div 
            id="builder-card-interests"
            style={getHighlightStyles("interests")}
            onClick={() => handleFieldClick("interests")}
          >
            <BuilderCard
  icon={<MdFavorite className="w-7 h-7" />}
  title="Interests"
  editCard={editCards.has("interests") ? "interests" : null}
  cardKey="interests"
  onEdit={() => handleEdit("interests")}
  onCancel={() => handleCancel("interests")}
  onSave={() => handleSave("interests")}
  disabled={isLoading}
  editContent={
    <input
      className="w-full border rounded-lg px-4 py-2 text-base mt-1"
      value={draft.interestsInput ?? (builderData.interests.join(", "))}
      onChange={e => setDraft({ ...draft, interestsInput: e.target.value })}
      placeholder="Type interests separated by commas, e.g. Technology, Sports, Music"
      autoFocus
    />
  }
>
  <div className="flex flex-wrap gap-2">
    {builderData.interests.length > 0 ? (
      builderData.interests.map((interest) => (
        <Badge2
          key={interest}
          variant="turbo"
          onClick={() =>{}}
        >
          <MdFavorite className="w-5 h-5 text-red-600" />
          {interest}
        </Badge2>
      ))
    ) : (
      <span className="text-gray-400 italic">Tap to add...</span>
    )}
  </div>
           </BuilderCard>
          </div>

          {/* Networks */}
          <div 
            id="builder-card-networks"
            style={getHighlightStyles("networks")}
            onClick={() => handleFieldClick("networks")}
          >
            <BuilderCard
  icon={<MdNetworkCheck className="w-7 h-7" />}
  title="Choose Network *"
  editCard={editCards.has("networks") ? "networks" : null}
  cardKey="networks"
  onEdit={() => handleEdit("networks")}
  onCancel={() => handleCancel("networks")}
  onSave={() => handleSave("networks")}
  disabled={isLoading}
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
              const current = draft.networks ?? builderData.networks;
              if (network === "All") {
                // Toggle all
                if (current.includes("All")) {
                  setDraft({ ...draft, networks: [] });
                } else {
                  setDraft({ ...draft, networks: [...AVAILABLE_NETWORKS] });
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
                setDraft({ ...draft, networks: next });
              }
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
    {builderData.networks.length > 0 && builderData.networks.filter(n => n !== "All").length > 0 ? (
      builderData.networks
        .filter(n => n !== "All")
        .map(network => (
          <Badge2
            key={network}
            variant="turbo"
            onClick={() =>{}}
          >
            {network}
          </Badge2>
        ))
    ) : (
      <span className="text-gray-400 italic">Tap to add...</span>
    )}
  </div>
            </BuilderCard>
          </div>

          {/* Campaign Name */}
          <div 
            id="builder-card-campaignName"
            style={getHighlightStyles("campaignName")}
            onClick={() => handleFieldClick("campaignName")}
          >
            <BuilderCard
    icon={<MdLightbulb className="w-7 h-7" />}
    title="Campaign Name"
    editCard={editCards.has("campaignName") ? "campaignName" : null}
    cardKey="campaignName"
    onEdit={() => handleEdit("campaignName")}
    onCancel={() => handleCancel("campaignName")}
    onSave={() => handleSave("campaignName")}
    disabled={isLoading}
  editContent={
    <LabeledInput
      icon={<MdLightbulb className="w-5 h-5" />}
      label="Campaign Name"
      required={true}
      value={draft.campaignName ?? builderData.campaignName}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, campaignName: e.target.value })}
      autoFocus
    />
  }
>
  <LabeledTag
    icon={<MdLightbulb className="w-5 h-5" />}
    label="Campaign Name"
    required={true}
    value={draft.campaignName ?? builderData.campaignName}
  />
            </BuilderCard>
          </div>
        </div>
      </div>
    </div>
  );
}