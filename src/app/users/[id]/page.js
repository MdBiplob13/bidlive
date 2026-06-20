import mongoose from "mongoose";
import SiteShell from "@/components/layout/SiteShell";
import PublicProfile from "@/components/user/PublicProfile";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return { title: "Profile" };
    await connectDB();
    const u = await User.findById(id).select("name").lean();
    return { title: u ? `${u.name} — Profile` : "Profile not found" };
  } catch {
    return { title: "Profile" };
  }
}

export default async function UserProfilePage({ params }) {
  const { id } = await params;
  return (
    <SiteShell>
      <PublicProfile id={id} />
    </SiteShell>
  );
}
