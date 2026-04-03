"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Globe, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKYCStore } from "@/lib/kyc/store";
import { getSupportedRegions, type RegionCode } from "@/lib/kyc/region-config";

const regionNames: Record<RegionCode, string> = {
  VN: "Vietnam",
  TH: "Thailand",
  IN: "India",
  AE: "United Arab Emirates",
  KR: "South Korea",
  JP: "Japan",
  FR: "France",
  ES: "Spain",
  BR: "Brazil",
};

export default function KYCPage() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState<RegionCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { setRegion, setCurrentStep } = useKYCStore();

  const handleStart = async () => {
    if (!selectedRegion) return;
    
    setIsLoading(true);
    setRegion(selectedRegion);
    setCurrentStep(1);
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    router.push("/portal/kyc/document");
  };

  const supportedRegions = getSupportedRegions();

  return (
    <div className="min-h-screen bg-[rgb(var(--tp-bg-rgb))] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-[rgb(var(--tp-accent-rgb))]" />
          </div>
          <h1 className="text-3xl font-bold text-[rgb(var(--tp-fg-rgb))] mb-3">
            Identity Verification
          </h1>
          <p className="text-[rgba(var(--tp-fg-rgb),0.7)] max-w-md mx-auto">
            Complete your KYC verification to unlock full trading capabilities. This process typically takes 5-10 minutes.
          </p>
        </motion.div>

        {/* Region Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[rgb(var(--tp-accent-rgb))]" />
                Select Your Region
              </CardTitle>
              <CardDescription>
                Please select your country/region of residence. This determines the KYC requirements for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                value={selectedRegion || undefined}
                onValueChange={(value) => setSelectedRegion(value as RegionCode)}
              >
                <SelectTrigger className="h-12 bg-[rgb(var(--tp-surface-rgb))]">
                  <SelectValue placeholder="Select your country/region" />
                </SelectTrigger>
                <SelectContent>
                  {supportedRegions.map((code) => (
                    <SelectItem key={code} value={code}>
                      {regionNames[code]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Features Preview */}
              {selectedRegion && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-xl bg-[rgba(var(--tp-accent-rgb),0.05)] space-y-3"
                >
                  <p className="text-sm font-medium text-[rgb(var(--tp-fg-rgb))]">
                    Required for {regionNames[selectedRegion]}:
                  </p>
                  <ul className="space-y-2 text-sm text-[rgba(var(--tp-fg-rgb),0.7)]">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--tp-accent-rgb))]" />
                      Government-issued ID or Passport
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--tp-accent-rgb))]" />
                      Face verification (liveness check)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--tp-accent-rgb))]" />
                      Personal and financial information
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--tp-accent-rgb))]" />
                      Agreement signatures
                    </li>
                  </ul>
                </motion.div>
              )}

              <Button
                onClick={handleStart}
                disabled={!selectedRegion || isLoading}
                className="w-full h-12 bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Verification
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
        >
          <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] text-center">
            <p className="text-2xl font-bold text-[rgb(var(--tp-accent-rgb))]">5-10</p>
            <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)]">Minutes to complete</p>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] text-center">
            <p className="text-2xl font-bold text-[rgb(var(--tp-accent-rgb))]">1-2</p>
            <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)]">Days for review</p>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] text-center">
            <p className="text-2xl font-bold text-[rgb(var(--tp-accent-rgb))]">256-bit</p>
            <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)]">Encryption</p>
          </div>
        </motion.div>

        {/* Security Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-[rgba(var(--tp-fg-rgb),0.4)] mt-8"
        >
          Your data is protected with bank-level encryption and stored in compliance with GDPR regulations.
        </motion.p>
      </div>
    </div>
  );
}
