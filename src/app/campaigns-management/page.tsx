"use client"

import { useState, useEffect, useMemo } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Edit } from "lucide-react"

// Types
interface Campaign {
  id: string
  name: string
  smartlead_campaigns: SmartleadCampaign[]
}

interface SmartleadCampaign {
  id: string
  campaign_name: string
  smartlead_campaign_id: string
  parent_campaign_id: string | null
  status: string | null
  visible: boolean
}

export default function CampaignsManagementPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [unassignedSmartleadCampaigns, setUnassignedSmartleadCampaigns] = useState<SmartleadCampaign[]>([])
  const [hiddenSmartleadCampaigns, setHiddenSmartleadCampaigns] = useState<SmartleadCampaign[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isHiddenSectionExpanded, setIsHiddenSectionExpanded] = useState(false)

  // Fetch campaigns and smartlead campaigns on initial load
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        await fetchCampaigns()
        await fetchSmartleadCampaigns()
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Filter campaigns based on search term
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [campaigns, searchTerm])

  // Add auto-scroll functionality during drag
  useEffect(() => {
    let scrollInterval: NodeJS.Timeout | null = null;
    
    function handleDragOver(e: DragEvent) {
      const scrollThreshold = 150; // pixels from top/bottom of viewport
      const scrollSpeed = 10;
      const { clientY } = e;
      const { innerHeight } = window;
      
      // Clear any existing scroll interval
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
      
      // Scroll up when near the top
      if (clientY < scrollThreshold) {
        scrollInterval = setInterval(() => {
          window.scrollBy(0, -scrollSpeed);
        }, 16);
      }
      // Scroll down when near the bottom
      else if (clientY > innerHeight - scrollThreshold) {
        scrollInterval = setInterval(() => {
          window.scrollBy(0, scrollSpeed);
        }, 16);
      }
    }
    
    function cleanup() {
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
    }
    
    // Add event listeners
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragend', cleanup);
    document.addEventListener('drop', cleanup);
    
    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragend', cleanup);
      document.removeEventListener('drop', cleanup);
      cleanup();
    };
  }, []);

  async function fetchCampaigns() {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name')

      if (error) throw error

      if (data) {
        // Format campaigns and group smartlead campaigns
        const formattedCampaigns: Campaign[] = data.map(campaign => ({
          id: String(campaign.id),
          name: campaign.name,
          smartlead_campaigns: []
        }))
        
        setCampaigns(formattedCampaigns)
        return formattedCampaigns
      }
      return []
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      return []
    }
  }

  async function fetchSmartleadCampaigns() {
    try {
      const { data, error } = await supabase
        .from('smartlead_campaigns')
        .select('id, campaign_name, smartlead_campaign_id, parent_campaign_id, status, visible')

      if (error) throw error

      if (data) {
        // Group smartlead campaigns by parent_campaign_id
        const formattedSmartleadCampaigns: SmartleadCampaign[] = data.map(campaign => ({
          id: String(campaign.id),
          campaign_name: campaign.campaign_name || 'Unnamed Campaign',
          smartlead_campaign_id: String(campaign.smartlead_campaign_id),
          parent_campaign_id: campaign.parent_campaign_id ? String(campaign.parent_campaign_id) : null,
          status: campaign.status,
          visible: campaign.visible !== false // Default to true if null
        }))

        // Separate visible and hidden campaigns
        const visibleCampaigns = formattedSmartleadCampaigns.filter(campaign => campaign.visible);
        const hiddenCampaigns = formattedSmartleadCampaigns.filter(campaign => !campaign.visible);

        // Update campaigns with their associated visible smartlead campaigns
        setCampaigns(prev => {
          return prev.map(campaign => {
            const associatedCampaigns = visibleCampaigns.filter(
              slc => slc.parent_campaign_id === campaign.id
            )
            
            return {
              ...campaign,
              smartlead_campaigns: associatedCampaigns
            }
          })
        })

        // Get unassigned smartlead campaigns (those without a parent_campaign_id)
        const unassigned = visibleCampaigns.filter(
          campaign => campaign.parent_campaign_id === null
        )
        
        setUnassignedSmartleadCampaigns(unassigned)
        setHiddenSmartleadCampaigns(hiddenCampaigns)
      }
    } catch (error) {
      console.error('Error fetching smartlead campaigns:', error)
    }
  }



  async function associateSmartleadCampaign(smartleadCampaignId: string, campaignId: string | null) {
    try {
      // Update the smartlead campaign with the new parent_campaign_id
      const { error } = await supabase
        .from('smartlead_campaigns')
        .update({ parent_campaign_id: campaignId })
        .eq('id', smartleadCampaignId)

      if (error) throw error

      // Refresh the data
      fetchSmartleadCampaigns()
    } catch (error) {
      console.error('Error associating smartlead campaign:', error)
    }
  }

  async function deleteCampaign(campaignId: string) {
    try {
      // First, update all associated smartlead campaigns to remove parent_campaign_id
      const { error: updateError } = await supabase
        .from('smartlead_campaigns')
        .update({ parent_campaign_id: null })
        .eq('parent_campaign_id', campaignId)

      if (updateError) throw updateError

      // Then delete the campaign
      const { error: deleteError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)

      if (deleteError) throw deleteError

      // Update local state
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId))
      
      // Refresh smartlead campaigns to update the unassigned list
      fetchSmartleadCampaigns()
      
      // Close dialog
      setIsDeleteDialogOpen(false)
      setCampaignToDelete(null)
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }

  async function toggleCampaignVisibility(campaign: SmartleadCampaign) {
    try {
      const newVisibleState = !campaign.visible;
      
      // Update the database
      const { error } = await supabase
        .from('smartlead_campaigns')
        .update({ visible: newVisibleState })
        .eq('id', campaign.id)
        
      if (error) throw error
      
      // Update local state
      if (newVisibleState) {
        // Make campaign visible
        setHiddenSmartleadCampaigns(prev => prev.filter(c => c.id !== campaign.id))
        
        if (campaign.parent_campaign_id) {
          // Add back to parent campaign
          setCampaigns(prev => prev.map(c => {
            if (c.id === campaign.parent_campaign_id) {
              return {
                ...c,
                smartlead_campaigns: [...c.smartlead_campaigns, {...campaign, visible: true}]
              }
            }
            return c
          }))
        } else {
          // Add back to unassigned
          setUnassignedSmartleadCampaigns(prev => [...prev, {...campaign, visible: true}])
        }
      } else {
        // Hide campaign
        const updatedCampaign = {...campaign, visible: false}
        setHiddenSmartleadCampaigns(prev => [...prev, updatedCampaign])
        
        if (campaign.parent_campaign_id) {
          // Remove from parent campaign
          setCampaigns(prev => prev.map(c => {
            if (c.id === campaign.parent_campaign_id) {
              return {
                ...c,
                smartlead_campaigns: c.smartlead_campaigns.filter(slc => slc.id !== campaign.id)
              }
            }
            return c
          }))
        } else {
          // Remove from unassigned
          setUnassignedSmartleadCampaigns(prev => prev.filter(c => c.id !== campaign.id))
        }
      }
    } catch (error) {
      console.error('Error updating campaign visibility:', error)
    }
  }

  // Components for drag and drop
  function SmartleadCampaignItem({ campaign }: { campaign: SmartleadCampaign }) {
    return (
      <div
        key={campaign.id}
        className="p-3 mb-2 bg-white border rounded-md shadow-sm hover:shadow-md cursor-move relative"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('campaignId', campaign.id);
          // Set a custom drag image to make it more visible during drag
          const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
          dragImage.style.opacity = '0.7';
          dragImage.style.position = 'absolute';
          dragImage.style.top = '-1000px';
          document.body.appendChild(dragImage);
          e.dataTransfer.setDragImage(dragImage, 0, 0);
          setTimeout(() => document.body.removeChild(dragImage), 0);
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{campaign.campaign_name}</h4>
            <p className="text-sm text-gray-500">ID: {campaign.smartlead_campaign_id}</p>
          </div>
          <div className="flex items-center space-x-2">
            {campaign.status && (
              <span className={`px-2 py-1 text-xs rounded ${
                campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {campaign.status}
              </span>
            )}
            <button
              className="text-gray-500 hover:text-blue-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleCampaignVisibility(campaign);
              }}
              aria-label={campaign.visible ? "Hide campaign" : "Show campaign"}
            >
              {campaign.visible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>
      </div>
    )
  }

  function CampaignCard({ campaign }: { campaign: Campaign }) {
    return (
      <div 
        className="p-4 mb-4 bg-white border rounded-lg shadow"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const campaignId = e.dataTransfer.getData('campaignId')
          associateSmartleadCampaign(campaignId, campaign.id)
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">{campaign.name}</h3>
          <div className="flex items-center gap-2">
            <button 
              className="text-gray-500 hover:text-blue-500 transition-colors"
              onClick={() => window.location.href = `/campaigns-management/edit/${campaign.id}`}
              aria-label="Edit campaign"
            >
              <Edit size={18} />
            </button>
            <button 
              className="text-gray-500 hover:text-red-500 transition-colors"
              onClick={() => {
                setCampaignToDelete(campaign.id)
                setIsDeleteDialogOpen(true)
              }}
              aria-label="Delete campaign"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        <div className="pl-4 border-l-2 border-blue-300">
          {campaign.smartlead_campaigns.length > 0 ? (
            campaign.smartlead_campaigns.map((smartleadCampaign) => (
              <SmartleadCampaignItem 
                key={smartleadCampaign.id} 
                campaign={smartleadCampaign} 
              />
            ))
          ) : (
            <p className="text-sm text-gray-500 p-2">Drag smartlead campaigns here</p>
          )}
        </div>
      </div>
    )
  }

  function HiddenCampaignsSection() {
    return (
      <div className="mt-6">
        <div 
          className="flex items-center justify-between p-2 bg-gray-200 rounded-t-lg cursor-pointer"
          onClick={() => setIsHiddenSectionExpanded(!isHiddenSectionExpanded)}
        >
          <div className="flex items-center space-x-2">
            <EyeOff size={18} />
            <h2 className="text-lg font-semibold">Hidden Smartlead Campaigns ({hiddenSmartleadCampaigns.length})</h2>
          </div>
          {isHiddenSectionExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        
        {isHiddenSectionExpanded && (
          <div className="p-4 bg-gray-100 border-2 border-t-0 border-dashed border-gray-300 rounded-b-lg">
            {hiddenSmartleadCampaigns.length > 0 ? (
              hiddenSmartleadCampaigns.map((campaign) => (
                <SmartleadCampaignItem key={campaign.id} campaign={campaign} />
              ))
            ) : (
              <div className="flex justify-center items-center h-20">
                <p className="text-gray-500">No hidden campaigns</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Campaigns Management</h1>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/campaigns-management/campaign-types'}
              >
                Manage Campaign Types
              </Button>
              <Button onClick={() => window.location.href = '/campaigns-management/create'}>
                Create a new campaign
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Campaigns</h2>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredCampaigns.length > 0 ? (
                filteredCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))
              ) : (
                <div className="text-center p-8 bg-white border rounded-lg">
                  <p className="text-gray-500">No campaigns found</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Unassigned Smartlead Campaigns</h2>
              <div 
                className="p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg min-h-[200px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const campaignId = e.dataTransfer.getData('campaignId')
                  associateSmartleadCampaign(campaignId, null)
                }}
              >
                {unassignedSmartleadCampaigns.length > 0 ? (
                  unassignedSmartleadCampaigns.map((campaign) => (
                    <SmartleadCampaignItem key={campaign.id} campaign={campaign} />
                  ))
                ) : (
                  <div className="flex justify-center items-center h-40">
                    <p className="text-gray-500">No unassigned smartlead campaigns</p>
                  </div>
                )}
              </div>
              
              <HiddenCampaignsSection />
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Campaign</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this campaign? All Smartlead campaigns associated with it will be moved to the unassigned section.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex space-x-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => campaignToDelete && deleteCampaign(campaignToDelete)}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </DndProvider>
  )
} 