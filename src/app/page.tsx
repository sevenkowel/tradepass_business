import { HeroSection } from "@/components/home/HeroSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { PlatformSection } from "@/components/home/PlatformSection";
import { ArchitectureSection } from "@/components/home/ArchitectureSection";
import { CoreProductsSection } from "@/components/home/CoreProductsSection";
import { UseCasesSection } from "@/components/home/UseCasesSection";
import { EcosystemSection } from "@/components/home/EcosystemSection";
import { CTASection } from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <PlatformSection />
      <ArchitectureSection />
      <CoreProductsSection />
      <UseCasesSection />
      <EcosystemSection />
      <CTASection />
    </>
  );
}
