import SiteShell from "@/components/layout/SiteShell";
import Hero from "@/components/home/Hero";
import HomeSections from "@/components/home/HomeSections";
import { getHomeData } from "@/lib/homeData";

// Revalidate the homepage periodically (ISR) — bidding isn't realtime.
export const revalidate = 60;

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <SiteShell>
      <Hero />
      <HomeSections data={data} />
    </SiteShell>
  );
}
