"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { PersonalInfo } from "@/lib/kyc/types";

const incomeRanges = [
  { value: "below_25k", label: "Below $25,000" },
  { value: "25k_to_50k", label: "$25,000 - $50,000" },
  { value: "50k_to_100k", label: "$50,000 - $100,000" },
  { value: "100k_to_250k", label: "$100,000 - $250,000" },
  { value: "above_250k", label: "Above $250,000" },
];

const netWorthRanges = [
  { value: "below_50k", label: "Below $50,000" },
  { value: "50k_to_100k", label: "$50,000 - $100,000" },
  { value: "100k_to_500k", label: "$100,000 - $500,000" },
  { value: "500k_to_1m", label: "$500,000 - $1,000,000" },
  { value: "above_1m", label: "Above $1,000,000" },
];

const investmentObjectives = [
  { id: "capital_preservation", label: "Capital Preservation" },
  { id: "income", label: "Generate Income" },
  { id: "growth", label: "Capital Growth" },
  { id: "speculation", label: "Speculation / Trading" },
  { id: "diversification", label: "Portfolio Diversification" },
];

export function FinancialStatusForm() {
  const { register, setValue, watch } = useFormContext<PersonalInfo>();
  const financial = watch("financialStatus");

  const handleObjectiveToggle = (objectiveId: string, checked: boolean) => {
    const current = financial?.investmentObjectives || [];
    if (checked) {
      setValue("financialStatus.investmentObjectives", [...current, objectiveId]);
    } else {
      setValue("financialStatus.investmentObjectives", current.filter(o => o !== objectiveId));
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[rgb(var(--tp-fg-rgb))]">Financial Status</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="financialStatus.annualIncome">
            Annual Income <span className="text-red-500">*</span>
          </Label>
          <Select
            value={financial?.annualIncome || "50k_to_100k"}
            onValueChange={(value) => setValue("financialStatus.annualIncome", value as any)}
          >
            <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
              <SelectValue placeholder="Select annual income range" />
            </SelectTrigger>
            <SelectContent>
              {incomeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="financialStatus.netWorth">
            Estimated Net Worth <span className="text-red-500">*</span>
          </Label>
          <Select
            value={financial?.netWorth || "100k_to_500k"}
            onValueChange={(value) => setValue("financialStatus.netWorth", value as any)}
          >
            <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
              <SelectValue placeholder="Select net worth range" />
            </SelectTrigger>
            <SelectContent>
              {netWorthRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="financialStatus.sourceOfFunds">
            Source of Funds <span className="text-red-500">*</span>
          </Label>
          <Input
            id="financialStatus.sourceOfFunds"
            placeholder="e.g., Salary, Business Income, Investment Returns"
            {...register("financialStatus.sourceOfFunds")}
            className="bg-[rgb(var(--tp-surface-rgb))]"
          />
        </div>

        <div className="space-y-3">
          <Label>
            Investment Objectives <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {investmentObjectives.map((objective) => (
              <div key={objective.id} className="flex items-start space-x-3">
                <Checkbox
                  id={objective.id}
                  checked={financial?.investmentObjectives?.includes(objective.id)}
                  onCheckedChange={(checked) => handleObjectiveToggle(objective.id, checked as boolean)}
                />
                <Label htmlFor={objective.id} className="text-sm font-normal cursor-pointer">
                  {objective.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
