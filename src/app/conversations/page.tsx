'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Conversation, ConversationFilters } from '@/types/conversation';

// UI Components
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Define stage colors
const stageColors: Record<string, string> = {
  'share_creative_brief': 'bg-blue-100 text-blue-800',
  'questions': 'bg-purple-100 text-purple-800',
  'rates_received': 'bg-indigo-100 text-indigo-800',
  'negotiate_rates': 'bg-pink-100 text-pink-800',
  'send_contract': 'bg-orange-100 text-orange-800',
  'contract_signed': 'bg-amber-100 text-amber-800',
  'content_draft': 'bg-lime-100 text-lime-800',
  'content_posted': 'bg-emerald-100 text-emerald-800',
  'pass': 'bg-gray-100 text-gray-800',
  'none': 'bg-slate-100 text-slate-800',
};

// Define Campaign interface
interface Campaign {
  id: number;
  name: string;
}

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  // Filters
  const [filters, setFilters] = useState<ConversationFilters>({
    search: '',
    notApproved: false,
    tags: [],
    followUpNeeded: false,
    campaignId: null
  });

  // Fetch campaigns data
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('id, name')
          .order('name');

        if (error) throw error;
        
        if (data) {
          setCampaigns(data);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    }

    fetchCampaigns();
  }, []);

  // Fetch conversations data
  useEffect(() => {
    async function fetchConversations() {
      try {
        const { data, error } = await supabase
          .from('vw_conversation_details')
          .select('*')
          .order('last_message_sent_at', { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setConversations(data);
          setFilteredConversations(data);
          
          // Extract unique tags
          const tags = new Set<string>();
          data.forEach(conversation => {
            if (conversation.last_message_tags && Array.isArray(conversation.last_message_tags)) {
              conversation.last_message_tags.forEach((tag: string) => tags.add(tag));
            }
          });
          
          setAvailableTags(Array.from(tags));
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    let results = [...conversations];
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(conv => 
        conv.campaign_name?.toLowerCase().includes(searchTerm) ||
        conv.smartlead_campaign_name?.toLowerCase().includes(searchTerm) ||
        conv.creator_username?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Approved filter
    if (filters.notApproved) {
      results = results.filter(conv => 
        conv.email_body_approved === null || conv.email_body_approved === ''
      );
    }
    
    // Campaign filter
    if (filters.campaignId) {
      results = results.filter(conv => 
        conv.campaign_id === filters.campaignId
      );
    }
    
    // Tags filter
    if (filters.tags.length > 0) {
      results = results.filter(conv => {
        if (!conv.last_message_tags) return false;
        return filters.tags.some(tag => conv.last_message_tags.includes(tag));
      });
    }
    
    // Follow up needed filter
    if (filters.followUpNeeded) {
      results = results.filter(conv => conv.last_message_follow_up_needed);
    }
    
    setFilteredConversations(results);
  }, [filters, conversations]);

  // Update single filter
  const updateFilter = (filterName: keyof ConversationFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    setFilters(prev => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };

  // Navigate to conversation detail
  const handleRowClick = (id: number) => {
    router.push(`/email/${id}`);
  };

  // Get stage color based on stage name
  const getStageColor = (stage: string) => {
    return stageColors[stage] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="flex justify-center p-8">Loading conversations...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Conversations</h1>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">Search</label>
              <Input
                id="search"
                placeholder="Search campaign, smartlead campaign or creator..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium w-full">Campaign</label>
              <Select
                onValueChange={(value) => updateFilter('campaignId', value === "all" ? null : parseInt(value))}
                value={filters.campaignId?.toString() || "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox 
                  id="followUpNeeded" 
                  checked={filters.followUpNeeded}
                  onCheckedChange={(checked) => updateFilter('followUpNeeded', checked)}
                />
                <label htmlFor="followUpNeeded" className="text-sm">
                  Follow-up Needed
                </label>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox 
                  id="notApproved" 
                  checked={filters.notApproved}
                  onCheckedChange={(checked) => updateFilter('notApproved', checked)}
                />
                <label htmlFor="notApproved" className="text-sm">
                  Not Approved
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <Badge 
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Smartlead Campaign</TableHead>
              <TableHead>Creator Email</TableHead>
              <TableHead>Last Message Date</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Follow Up</TableHead>
              <TableHead>Approved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConversations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  No conversations found
                </TableCell>
              </TableRow>
            ) : (
              filteredConversations.map((conversation) => (
                <TableRow 
                  key={conversation.conversation_id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(conversation.conversation_id)}
                >
                  <TableCell>{conversation.conversation_id}</TableCell>
                  <TableCell>
                    <Badge className={cn("font-medium", getStageColor(conversation.last_message_stage))}>
                      {conversation.last_message_stage || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>{conversation.campaign_name}</TableCell>
                  <TableCell>{conversation.smartlead_campaign_name}</TableCell>
                  <TableCell>{conversation.primary_email}</TableCell>
                  <TableCell>
                    {conversation.last_message_sent_at 
                      ? format(new Date(conversation.last_message_sent_at), 'MMM d, yyyy')
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {conversation.last_message_tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      )) || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {conversation.last_message_follow_up_needed ? (
                      <Badge className="bg-green-100 text-green-800 font-medium">Yes</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 font-medium">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {conversation.email_body_approved ? (
                      <Badge className="bg-green-100 text-green-800 font-medium">Yes</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 font-medium">No</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
