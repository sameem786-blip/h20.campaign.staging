type EmailMessage = {
  cc: string[] | null;
  time: string;
  type: string;
  subject: string;
  stats_id: string;
  email_body: string;
  message_id: string;
  open_count: number;
  click_count: number;
  click_details: Record<string, unknown>;
  email_seq_number: string | null;
};

type EmailThread = {
  to: string;
  history: EmailMessage[];
  from_email: string;
};

export type EmailData = {
  id: number;
  email: string;
  status: string;
  lead_id: number;
  last_name: string | null;
  created_at: string;
  first_name: string;
  campaign_id: number;
  message_history: EmailThread;
  campaign_lead_map_id: number;
};

export function parseEmailThread(inputJson: string): EmailData | null {
  try {
    return JSON.parse(inputJson) as EmailData;
  } catch (error) {
    console.error('Error parsing email thread:', error);
    return null;
  }
}

export function getDisplayName(emailData: EmailData): string {
  if (emailData.first_name && emailData.last_name) {
    return `${emailData.first_name} ${emailData.last_name}`;
  } else if (emailData.first_name) {
    return emailData.first_name;
  } else if (emailData.last_name) {
    return emailData.last_name;
  } else {
    return emailData.email.split('@')[0];
  }
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
} 