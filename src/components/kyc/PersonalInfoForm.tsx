"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, ChevronLeft, User, GraduationCap, TrendingUp, Wallet, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { RegionKYCConfig } from "@/lib/kyc/region-config";
import type { PersonalInfo } from "@/lib/kyc/types";

import { BasicInfoForm } from "./forms/BasicInfoForm";
import { EducationForm } from "./forms/EducationForm";
import { InvestmentExperienceForm } from "./forms/InvestmentExperienceForm";
import { FinancialStatusForm } from "./forms/FinancialStatusForm";
import { DeclarationsForm } from "./forms/DeclarationsForm";
import { useContactVerificationConfig } from "@/lib/config/hooks";
import { useKYCStore } from "@/lib/kyc/store";

interface PersonalInfoFormProps {
  regionConfig: RegionKYCConfig;
  onSubmit: (data: PersonalInfo) => void;
  initialData?: Partial<PersonalInfo>;
}

type TabValue = "basic" | "education" | "experience" | "financial" | "declarations";

const tabs: { value: TabValue; label: string; icon: typeof User; requires: keyof RegionKYCConfig["formFields"] }[] = [
  { value: "basic", label: "Basic Info", icon: User, requires: "personalInfo" },
  { value: "education", label: "Education", icon: GraduationCap, requires: "education" },
  { value: "experience", label: "Experience", icon: TrendingUp, requires: "investmentExperience" },
  { value: "financial", label: "Financial", icon: Wallet, requires: "financialStatus" },
  { value: "declarations", label: "Declarations", icon: FileCheck, requires: "pepDeclaration" },
];

export function PersonalInfoForm({ regionConfig, onSubmit, initialData }: PersonalInfoFormProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("basic");
  const [completedTabs, setCompletedTabs] = useState<Set<TabValue>>(new Set());
  
  // Get contact verification config from Backoffice
  const { regionCode } = useKYCStore();
  const { contactConfig } = useContactVerificationConfig(regionCode);
  
  // Mock pre-verified values from localStorage (dev mode)
  const [preVerifiedValues, setPreVerifiedValues] = useState<{ phone?: string; email?: string }>({});
  
  useEffect(() => {
    // Read pre-verified values from localStorage (set by dev tools or previous sessions)
    const storedPhone = localStorage.getItem("kyc_preverified_phone") || undefined;
    const storedEmail = localStorage.getItem("kyc_preverified_email") || undefined;
    setPreVerifiedValues({ phone: storedPhone, email: storedEmail });
  }, []);

  const methods = useForm<PersonalInfo>({
    defaultValues: {
      fullName: initialData?.fullName || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      nationality: initialData?.nationality || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      country: initialData?.country || regionConfig.regionName,
      education: initialData?.education || { highestLevel: "bachelor" },
      investmentExperience: initialData?.investmentExperience || {
        yearsOfExperience: "less_than_1",
        tradingFrequency: "monthly",
        productsTraded: [],
        riskTolerance: "medium",
      },
      financialStatus: initialData?.financialStatus || {
        annualIncome: "50k_to_100k",
        netWorth: "100k_to_500k",
        sourceOfFunds: "",
        investmentObjectives: [],
      },
      declarations: initialData?.declarations || {
        isUSPerson: false,
        isPEP: false,
        isMilitary: false,
        isFinancialProfessional: false,
        hasCriminalRecord: false,
      },
    },
  });

  const { handleSubmit, trigger, formState: { errors } } = methods;

  // Filter tabs based on region config
  const availableTabs = tabs.filter(tab => {
    if (tab.value === "basic") return true;
    return regionConfig.formFields[tab.requires];
  });

  const handleTabChange = async (value: string) => {
    // Validate current tab before switching
    const isValid = await trigger();
    if (isValid) {
      setCompletedTabs(prev => new Set([...prev, activeTab]));
      setActiveTab(value as TabValue);
    }
  };

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      setCompletedTabs(prev => new Set([...prev, activeTab]));
      const currentIndex = availableTabs.findIndex(t => t.value === activeTab);
      if (currentIndex < availableTabs.length - 1) {
        setActiveTab(availableTabs[currentIndex + 1].value);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = availableTabs.findIndex(t => t.value === activeTab);
    if (currentIndex > 0) {
      setActiveTab(availableTabs[currentIndex - 1].value);
    }
  };

  const isLastTab = activeTab === availableTabs[availableTabs.length - 1]?.value;
  const currentIndex = availableTabs.findIndex(t => t.value === activeTab);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {availableTabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = tab.value === activeTab;
            const isCompleted = completedTabs.has(tab.value);
            
            return (
              <div key={tab.value} className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    isActive 
                      ? "bg-tp-accent text-white" 
                      : isCompleted
                        ? "bg-[rgba(var(--tp-accent-rgb),0.1)] text-[rgb(var(--tp-accent-rgb))]"
                        : "bg-[rgba(var(--tp-fg-rgb),0.05)] text-[rgba(var(--tp-fg-rgb),0.6)]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
                {index < availableTabs.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-1 text-[rgba(var(--tp-fg-rgb),0.3)]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "basic" && (
                  <BasicInfoForm 
                    fields={regionConfig.formFields.personalInfo}
                    contactVerification={contactConfig}
                    preVerifiedPhone={preVerifiedValues.phone}
                    preVerifiedEmail={preVerifiedValues.email}
                  />
                )}
                {activeTab === "education" && regionConfig.formFields.education && (
                  <EducationForm />
                )}
                {activeTab === "experience" && regionConfig.formFields.investmentExperience && (
                  <InvestmentExperienceForm />
                )}
                {activeTab === "financial" && regionConfig.formFields.financialStatus && (
                  <FinancialStatusForm />
                )}
                {activeTab === "declarations" && (regionConfig.formFields.pepDeclaration || regionConfig.formFields.usPersonDeclaration || regionConfig.formFields.militaryDeclaration || regionConfig.formFields.professionalDeclaration) && (
                  <DeclarationsForm 
                    showUSPerson={regionConfig.formFields.usPersonDeclaration}
                    showPEP={regionConfig.formFields.pepDeclaration}
                    showMilitary={regionConfig.formFields.militaryDeclaration}
                    showProfessional={regionConfig.formFields.professionalDeclaration}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="flex-1 h-12"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {isLastTab ? (
            <Button
              type="submit"
              className="flex-1 h-12 bg-tp-accent hover:bg-tp-accent-hover text-white"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 h-12 bg-tp-accent hover:bg-tp-accent-hover text-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
