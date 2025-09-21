import { getCurrentUser } from "@/lib/auth";
import CampaignSelector from "@/components/features/campaigns/campaign-selector";
import Playground from "@/components/features/playground/index";

export default async function Page() {
  const user = await getCurrentUser();
  
  const isAdmin = user?.role === 'admin';

  if (isAdmin) {
    return <CampaignSelector />;
  }
  
  return <Playground />;
}
