'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase, AgentRun, Message } from '@/lib/supabase';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import he from 'he';

// Feedback Modal Component
function FeedbackModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (feedback: string) => void;
  isSubmitting: boolean;
}) {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    onSubmit(feedback);
    setFeedback('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 backdrop-blur-xs"></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border">
        <h3 className="text-lg font-semibold mb-4">Provide Feedback</h3>
        <p className="text-sm text-gray-600 mb-4">
          What changes were needed for the AI-suggested email body?
        </p>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Describe what needed to be changed..."
          rows={4}
          className="w-full mb-4"
        />
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !feedback.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Save Feedback'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EmailDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [agentRun, setAgentRun] = useState<AgentRun | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmailBody, setEditedEmailBody] = useState('');
  const [originalEmailBody, setOriginalEmailBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have Supabase credentials
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setError('Supabase credentials are not configured. Please set up your environment variables.');
          setIsLoading(false);
          return;
        }
        
        // Fetch all messages for this conversation
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', id)
          .order('created_at', { ascending: false });
          
        if (messagesError) throw messagesError;
        setMessages(messagesData);
        
        // Get creator ID for this conversation
        const { data: creatorData, error: creatorError } = await supabase
          .from('vw_conversation_details')
          .select('creator_id')
          .eq('conversation_id', id)
          .order('last_message_sent_at', { ascending: false })
          .limit(1)
          .single();
          
        if (!creatorError && creatorData) {
          setCreatorId(creatorData.creator_id.toString());
        }
        
        // Find the most recent inbound message
        const latestInboundMessage = messagesData
          .filter(msg => msg.direction === 'inbound')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        if (latestInboundMessage) {
          // Fetch the agent run for this message
          const { data: agentRunData, error: agentRunError } = await supabase
            .from('agent_runs')
            .select('*')
            .eq('message_id', latestInboundMessage.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (!agentRunError && agentRunData) {
            setAgentRun(agentRunData);
            setEditedEmailBody(agentRunData.suggested_email_body || '');
            setOriginalEmailBody(agentRunData.suggested_email_body || '');
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleSave = async () => {
    if (!agentRun) return;
    
    try {
      // Check if we have Supabase credentials
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Supabase credentials are not configured. Cannot save changes.');
        return;
      }
      
      // Check if feedback is already provided or if the email body hasn't changed
      const hasExistingFeedback = agentRun.email_body_feedback && agentRun.email_body_feedback.trim() !== '';
      const emailBodyChanged = originalEmailBody !== editedEmailBody;
      
      if (emailBodyChanged && !hasExistingFeedback) {
        // Show feedback modal before saving
        setShowFeedbackModal(true);
        return;
      }
      
      // Otherwise, just update the email body without feedback
      const { error } = await supabase
        .from('agent_runs')
        .update({ suggested_email_body: editedEmailBody })
        .eq('id', agentRun.id);
        
      if (error) throw error;
      
      setAgentRun({ ...agentRun, suggested_email_body: editedEmailBody });
      setOriginalEmailBody(editedEmailBody);
      setIsEditing(false);
      toast.success('Changes saved successfully!');
    } catch (err) {
      console.error('Error updating email body:', err);
      setError('Failed to save changes');
    }
  };

  const handleFeedbackSubmit = async (userFeedback: string) => {
    if (!agentRun) return;
    
    try {
      setIsSubmittingFeedback(true);
      
      // Create the feedback text
      const feedbackText = `Original email body:\n${originalEmailBody}\n\nUpdated email body:\n${editedEmailBody}\n\nUser feedback:\n${userFeedback}`;
      
      // Update both the email body and feedback
      const { error } = await supabase
        .from('agent_runs')
        .update({ 
          suggested_email_body: editedEmailBody,
          email_body_feedback: feedbackText
        })
        .eq('id', agentRun.id);
        
      if (error) throw error;
      
      setAgentRun({ 
        ...agentRun, 
        suggested_email_body: editedEmailBody,
        email_body_feedback: feedbackText
      });
      setOriginalEmailBody(editedEmailBody);
      setIsEditing(false);
      setShowFeedbackModal(false);
      toast.success('Changes and feedback saved successfully!');
    } catch (err) {
      console.error('Error saving feedback:', err);
      toast.error('Failed to save feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  
  const handleBack = () => {
    router.push('/conversations');
  };
  
  const handleViewCreator = () => {
    if (creatorId) {
      router.push(`/creators/${creatorId}`);
    } else {
      toast.error('Creator information not available for this conversation');
    }
  };
  
  const handleApprove = async () => {
    if (!agentRun) return;
    
    try {
      // Check if we have Supabase credentials
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Supabase credentials are not configured. Cannot approve email.');
        return;
      }
      
      // Update in Supabase
      const { error } = await supabase
        .from('agent_runs')
        .update({ email_body_approved: agentRun.suggested_email_body })
        .eq('id', agentRun.id);
        
      if (error) throw error;
      
      toast.success('Email response approved successfully!');
      // Update local state to reflect approval
      setAgentRun(prevAgentRun => prevAgentRun ? {
        ...prevAgentRun,
        email_body_approved: prevAgentRun.suggested_email_body
      } : null);
    } catch (err) {
      console.error('Error approving email:', err);
      toast.error('Failed to approve email response. Please try again.');
    }
  };
  
  if (isLoading) return <div className="p-8 flex justify-center">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy, h:mm a');
    } catch {
      return dateString;
    }
  };
  
  const getRecipientEmail = () => {
    const firstMessage = messages[messages.length - 1];
    return firstMessage?.recipient || 'Unknown';
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        isSubmitting={isSubmittingFeedback}
      />
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={handleBack}>
          ← Back to Outreach
        </Button>
        {creatorId && (
          <Button variant="outline" onClick={handleViewCreator}>
            View Creator
          </Button>
        )}
      </div>
      
      {agentRun ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <div className="flex gap-2">
                {agentRun.email_body_approved && (
                  <Badge className="text-lg bg-green-500 text-white">
                    Approved
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedEmailBody}
                    onChange={(e) => setEditedEmailBody(e.target.value)}
                    rows={6}
                    className="w-full resize-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap">{agentRun.suggested_email_body || 'No suggested response'}</p>
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      className="mr-2" 
                      onClick={handleApprove}
                    >
                      Approve
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>Edit</Button>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {agentRun.trace_id && (
                    <>
                      <dt className="text-gray-500">Trace ID:</dt>
                      <dd>{agentRun.trace_id}</dd>
                    </>
                  )}
                  
                  {agentRun.processing_time && (
                    <>
                      <dt className="text-gray-500">Processing time:</dt>
                      <dd>{agentRun.processing_time.toFixed(2)}s</dd>
                    </>
                  )}
                  
                  <dt className="text-gray-500">Created at:</dt>
                  <dd>{formatDate(agentRun.created_at)}</dd>
                  
                  <dt className="text-gray-500">Email:</dt>
                  <dd>{getRecipientEmail()}</dd>
                  
                  {agentRun.follow_up_needed && (
                    <>
                      <dt className="text-gray-500">Follow Up Needed:</dt>
                      <dd>{agentRun.follow_up_needed ? 'Yes' : 'No'}</dd>
                    </>
                  )}
                  
                  {agentRun.follow_up_date && (
                    <>
                      <dt className="text-gray-500">Follow Up Date:</dt>
                      <dd>{formatDate(agentRun.follow_up_date)}</dd>
                    </>
                  )}
                  
                  {agentRun.review && (
                    <>
                      <dt className="text-gray-500">Review:</dt>
                      <dd>{agentRun.review ? 'Yes' : 'No'}</dd>
                    </>
                  )}
                  
                  {agentRun.tags && agentRun.tags.length > 0 && (
                    <>
                      <dt className="text-gray-500">Tags:</dt>
                      <dd>{agentRun.tags.join(', ')}</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="p-4 mb-8 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700">No agent analysis available for this email conversation.</p>
        </div>
      )}
      
      <h2 className="text-xl font-semibold mb-4">Email Thread</h2>
      {messages.length > 0 ? (
        <div className="space-y-2">
          {messages.map((message) => {
            const isOutbound = message.direction === 'outbound';
            return (
              <Card 
                key={message.id} 
                className={`${isOutbound ? 'border-l-4 border-l-blue-500 bg-blue-50' : 'border-l-4 border-l-green-500 bg-green-50'} py-2`}
              >
                <div className="px-3">
                  <div className="flex justify-between">
                    <div>
                      <p className={`font-medium ${isOutbound ? 'text-blue-700' : 'text-green-700'}`}>
                        {isOutbound ? 'Outbound' : 'Inbound'}
                      </p>
                      {message.subject && (
                        <p className="text-sm text-gray-500 truncate">
                          Subject: {message.subject}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(message.created_at)}
                    </p>
                  </div>
                  <p className="whitespace-pre-wrap text-sm mt-1">{he.decode(message.body || '')}</p>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-gray-700">No messages found in this conversation.</p>
        </div>
      )}
    </div>
  );
} 