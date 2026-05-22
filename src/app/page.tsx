import { LandingHero } from "@/components/layout/marketing/landing-hero";
import { PublicFooter } from "@/components/layout/marketing/public-footer";
import { PublicHeader } from "@/components/layout/marketing/public-header";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PublicHeader />
      <main className="flex flex-1 flex-col">
        <LandingHero />
      </main>
      <PublicFooter />
    </div>
  );
}
