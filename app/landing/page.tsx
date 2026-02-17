// app/landing/page.tsx — server component
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import TikTokDashboard from "@/components/SocialMediaDashboard";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }
  if (session.user?.email == process.env.MY_PERSONAL_EMAIL) {
    return (
    
    <TikTokDashboard />
    );
  }
}
