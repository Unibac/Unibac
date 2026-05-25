import { LandingHero } from "@/components/layout/marketing/landing-hero";
import { PublicFooter } from "@/components/layout/marketing/public-footer";
import { PublicHeader } from "@/components/layout/marketing/public-header";
import courtyardBackground from "@/public/Unibac-2-1.jpg";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PublicHeader />
      <main
        className="relative flex flex-1 flex-col bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${courtyardBackground.src})` }}
      >
        <div className="relative flex flex-1 flex-col bg-background/50 dark:bg-background/85">
          <LandingHero />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
