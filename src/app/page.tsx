import LandingNavbar from "@/components/landing/landing-navbar";
import LandingHero from "@/components/landing/landing-hero";
import LandingHowItWorks from "@/components/landing/landing-how-it-works";
import LandingFeatures from "@/components/landing/landing-features";
import LandingFAQ from "@/components/landing/landing-faq";
import LandingFooter from "@/components/landing/landing-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <div className="pt-14">
        <LandingHero />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingFAQ />
        <LandingFooter />
      </div>
    </div>
  );
}
