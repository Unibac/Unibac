import { LandingHero } from "@/components/layout/marketing/landing-hero";
import { PublicFooter } from "@/components/layout/marketing/public-footer";
import { PublicHeader } from "@/components/layout/marketing/public-header";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PublicHeader />
      <main className="relative flex flex-1 flex-col bg-[url('/Unibac-2-1.jpg')] bg-cover bg-center bg-no-repeat">
        <div className="relative flex flex-1 flex-col bg-background/80 dark:bg-background/85">
          <LandingHero />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
