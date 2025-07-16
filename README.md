# Email Agent UI

A UI for displaying email threads with influencers, featuring AI-suggested responses.

## Features

- Display cards of email threads with influencer names and avatars
- View detailed email conversations from newest to oldest
- View AI-suggested responses with metadata
- Edit and approve AI-suggested responses
- Integration with Supabase for data storage

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure your environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Data Structure

The application expects data in the Supabase tables to have the following structure:

### Agent Runs

```json
{
  "id": 154,
  "message_id": 154,
  "planning_agent_output": "JSON string",
  "execution_agent_output": "JSON string",
  "suggested_email_body": "AI suggested response text",
  "email_body_approved": null,
  "follow_up_needed": true,
  "follow_up_date": "2024-12-30",
  "review": false,
  "tags": ["tag1", "tag2"],
  "trace_id": "cb52a891-e4f5-4d2c-9eb3-a7c8340e6a14",
  "processing_time": 1.23,
  "created_at": "2025-04-28T10:45:00.000000+00:00",
  "updated_at": "2025-04-28T10:45:00.000000+00:00"
}
```

## Technology Stack

- Next.js
- TypeScript
- Supabase
- Shadcn UI
- Tailwind CSS

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
