"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { PersonalInfo } from "@/lib/kyc/types";

const experienceYears = [
  { value: "none", label: "No experience" },
  { value: "less_than_1", label: "Less than 1 year" },
  { value: "1_to_3", label: "1 to 3 years" },
  { value: "3_to_5", label: "3 to 5 years" },
  { value: "more_than_5", label: "More than 5 years" },
];

const tradingFrequencies = [
  { value: "rarely", label: "Rarely (a few times per year)" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];

const riskLevels = [
  { value: "low", label: "Low - I prefer stable, low-risk investments" },
  { value: "medium", label: "Medium - I accept moderate risk for better returns" },
  { value: "high", label: "High - I am comfortable with high risk for high returns" },
];

const productTypes = [
  { id: "forex", label: "Forex / Currency Trading" },
  { id: "stocks", label: "Stocks / Equities" },
  { id: "crypto", label: "Cryptocurrencies" },
  { id: "commodities", label: "Commodities" },
  { id: "indices", label: "Indices" },
  { id: "bonds", label: "Bonds" },
  { id: "futures", label: "Futures / Options" },
  { id: "none", label: "No previous trading experience" },
];

export function InvestmentExperienceForm() {
  const { register, setValue, watch } = useFormContext<PersonalInfo>();
  const experience = watch("investmentExperience");

  const handleProductToggle = (productId: string, checked: boolean) => {
    const current = experience?.productsTraded || [];
    if (checked) {
      setValue("investmentExperience.productsTraded", [...current, productId]);
    } else {
      setValue("investmentExperience.productsTraded", current.filter(p => p !== productId));
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[rgb(var(--tp-fg-rgb))]">Investment Experience</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="investmentExperience.yearsOfExperience">
            Years of Trading Experience <span className="text-red-500">*</span>
          </Label>
          <Select
            value={experience?.yearsOfExperience || "less_than_1"}
            onValueChange={(value) => setValue("investmentExperience.yearsOfExperience", value as "none" | "less_than_1" | "1_to_3" | "3_to_5" | "more_than_5")}
          >
            <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              {experienceYears.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="investmentExperience.tradingFrequency">
            Trading Frequency <span className="text-red-500">*</span>
          </Label>
          <Select
            value={experience?.tradingFrequency || "monthly"}
            onValueChange={(value) => setValue("investmentExperience.tradingFrequency", value as "rarely" | "monthly" | "weekly" | "daily")}
          >
            <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
              <SelectValue placeholder="Select trading frequency" />
            </SelectTrigger>
            <SelectContent>
              {tradingFrequencies.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>
            Products Traded <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {productTypes.map((product) => (
              <div key={product.id} className="flex items-start space-x-3">
                <Checkbox
                  id={product.id}
                  checked={experience?.productsTraded?.includes(product.id)}
                  onCheckedChange={(checked) => handleProductToggle(product.id, checked as boolean)}
                />
                <Label htmlFor={product.id} className="text-sm font-normal cursor-pointer">
                  {product.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="investmentExperience.riskTolerance">
            Risk Tolerance <span className="text-red-500">*</span>
          </Label>
          <Select
            value={experience?.riskTolerance || "medium"}
            onValueChange={(value) => setValue("investmentExperience.riskTolerance", value as "low" | "medium" | "high")}
          >
            <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
              <SelectValue placeholder="Select risk tolerance" />
            </SelectTrigger>
            <SelectContent>
              {riskLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
