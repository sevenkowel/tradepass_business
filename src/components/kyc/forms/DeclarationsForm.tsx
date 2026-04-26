"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PersonalInfo } from "@/lib/kyc/types";

interface DeclarationsFormProps {
  showUSPerson: boolean;
  showPEP: boolean;
  showMilitary: boolean;
  showProfessional: boolean;
}

export function DeclarationsForm({ showUSPerson, showPEP, showMilitary, showProfessional }: DeclarationsFormProps) {
  const { register, setValue, watch } = useFormContext<PersonalInfo>();
  const declarations = watch("declarations");

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[rgb(var(--tp-fg-rgb))]">Declarations</h3>
      
      <div className="space-y-6">
        {/* US Person Declaration */}
        {showUSPerson && (
          <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="isUSPerson"
                checked={declarations?.isUSPerson}
                onCheckedChange={(checked) => setValue("declarations.isUSPerson", checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="isUSPerson" className="font-medium cursor-pointer">
                  I am a U.S. Person
                </Label>
                <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)] mt-1">
                  Check this box if you are a U.S. citizen, U.S. resident, or U.S. green card holder
                </p>
              </div>
            </div>
            
            {declarations?.isUSPerson && (
              <div className="pl-7 space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="usCitizen"
                    checked={declarations?.usPersonDetails?.isUSCitizen}
                    onCheckedChange={(checked) => setValue("declarations.usPersonDetails.isUSCitizen", checked as boolean)}
                  />
                  <Label htmlFor="usCitizen" className="text-sm font-normal cursor-pointer">
                    U.S. Citizen
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="usResident"
                    checked={declarations?.usPersonDetails?.isUSResident}
                    onCheckedChange={(checked) => setValue("declarations.usPersonDetails.isUSResident", checked as boolean)}
                  />
                  <Label htmlFor="usResident" className="text-sm font-normal cursor-pointer">
                    U.S. Resident
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="usGreenCard"
                    checked={declarations?.usPersonDetails?.isUSGreenCardHolder}
                    onCheckedChange={(checked) => setValue("declarations.usPersonDetails.isUSGreenCardHolder", checked as boolean)}
                  />
                  <Label htmlFor="usGreenCard" className="text-sm font-normal cursor-pointer">
                    U.S. Green Card Holder
                  </Label>
                </div>
                <Input
                  placeholder="Tax ID (SSN/ITIN)"
                  {...register("declarations.usPersonDetails.taxId")}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
              </div>
            )}
          </div>
        )}

        {/* PEP Declaration */}
        {showPEP && (
          <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="isPEP"
                checked={declarations?.isPEP}
                onCheckedChange={(checked) => setValue("declarations.isPEP", checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="isPEP" className="font-medium cursor-pointer">
                  I am a Politically Exposed Person (PEP)
                </Label>
                <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)] mt-1">
                  Check this box if you or your immediate family member holds or has held a prominent public position
                </p>
              </div>
            </div>
            
            {declarations?.isPEP && (
              <div className="pl-7 space-y-3">
                <Select
                  value={declarations?.pepDetails?.relationship || "self"}
                  onValueChange={(value) => setValue("declarations.pepDetails.relationship", value as "self" | "family" | "associate")}
                >
                  <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
                    <SelectValue placeholder="Relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Myself</SelectItem>
                    <SelectItem value="family">Family Member</SelectItem>
                    <SelectItem value="associate">Close Associate</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Position / Title"
                  {...register("declarations.pepDetails.position")}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
                <Input
                  placeholder="Country"
                  {...register("declarations.pepDetails.country")}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
              </div>
            )}
          </div>
        )}

        {/* Military Declaration */}
        {showMilitary && (
          <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="isMilitary"
                checked={declarations?.isMilitary}
                onCheckedChange={(checked) => setValue("declarations.isMilitary", checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="isMilitary" className="font-medium cursor-pointer">
                  I am a military or government official
                </Label>
                <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)] mt-1">
                  Check this box if you are currently serving in the military or hold a government position
                </p>
              </div>
            </div>
            
            {declarations?.isMilitary && (
              <div className="pl-7 space-y-3">
                <Input
                  placeholder="Branch / Department"
                  {...register("declarations.militaryDetails.branch")}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
                <Input
                  placeholder="Rank / Position"
                  {...register("declarations.militaryDetails.rank")}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
                <Input
                  placeholder="Country"
                  {...register("declarations.militaryDetails.country")}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
              </div>
            )}
          </div>
        )}

        {/* Financial Professional Declaration */}
        {showProfessional && (
          <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="isFinancialProfessional"
                checked={declarations?.isFinancialProfessional}
                onCheckedChange={(checked) => setValue("declarations.isFinancialProfessional", checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="isFinancialProfessional" className="font-medium cursor-pointer">
                  I am a financial industry professional
                </Label>
                <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)] mt-1">
                  Check this box if you are a licensed financial advisor, broker, or work in the financial services industry
                </p>
              </div>
            </div>
            
            {declarations?.isFinancialProfessional && (
              <div className="pl-7 space-y-3">
                <Input
                  placeholder="License Type"
                  {...register("declarations.professionalDetails.licenseType")}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
                <Input
                  placeholder="License Number"
                  {...register("declarations.professionalDetails.licenseNumber")}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
                <Input
                  placeholder="Employer"
                  {...register("declarations.professionalDetails.employer")}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
              </div>
            )}
          </div>
        )}

        {/* Criminal Record Declaration */}
        <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)]">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="hasCriminalRecord"
              checked={declarations?.hasCriminalRecord}
              onCheckedChange={(checked) => setValue("declarations.hasCriminalRecord", checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="hasCriminalRecord" className="font-medium cursor-pointer">
                I have a criminal record
              </Label>
              <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)] mt-1">
                Check this box if you have been convicted of a financial crime or fraud-related offense
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
