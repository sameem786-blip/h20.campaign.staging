'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CreatorCard } from '@/components/creator-card';
import { supabase } from '@/lib/supabase';
import { Creator } from '@/types/creator';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreatorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setError('Supabase credentials are not configured. Please set up your environment variables.');
          setIsLoading(false);
          return;
        }
        
        // Fetch creator details from the view
        const { data: creatorData, error: creatorError } = await supabase
          .from('vw_conversation_details')
          .select('*')
          .eq('creator_id', id)
          .single();
          
        if (creatorError) throw creatorError;
        
        if (creatorData) {
          // Map the view fields to the Creator type structure
          const mappedCreator: Creator = {
            id: creatorData.creator_id,
            creator_campaign_id: creatorData.campaign_id,
            conversation_id: creatorData.conversation_id,
            username: creatorData.creator_username,
            stage: creatorData.last_message_stage || '',
            screenshot_path: creatorData.screenshot_path,
            core_platform: creatorData.core_platform,
            evaluation_score: creatorData.evaluation_score,
            platform_info: {
              followers: creatorData.platform_followers,
              bio: creatorData.platform_bio,
              video_analysis: creatorData.platform_video_analysis
            }
          };
          
          setCreator(mappedCreator);
        } else {
          setError('Creator not found');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching creator data:', err);
        setError('Failed to load creator data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleBack = () => {
    router.push('/campaigns');
  };
  
  if (isLoading) return <div className="p-8 flex justify-center">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!creator) return <div className="p-8">No creator found with this ID.</div>;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={handleBack}>
          ← Back to Campaigns
        </Button>
      </div>
      
      <div className="mb-8">
        <CreatorCard creator={creator} />
      </div>
    </div>
  );
}
