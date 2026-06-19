import SiteShell from "@/components/layout/SiteShell";
import HowItWorks from "@/components/home/HowItWorks";
import TrustSection from "@/components/home/TrustSection";

export const metadata = { title: "How it works · কীভাবে কাজ করে" };

export default function HowItWorksPage() {
  return (
    <SiteShell>
      <div className="py-8">
        <HowItWorks />
        <TrustSection />
      </div>
    </SiteShell>
  );
}
