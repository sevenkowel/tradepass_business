"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { PersonalInfo } from "@/lib/kyc/types";

const educationLevels = [
  { value: "high_school", label: "High School or Equivalent" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "doctorate", label: "Doctorate or PhD" },
  { value: "other", label: "Other" },
];

export function EducationForm() {
  const { register, setValue, watch } = useFormContext<PersonalInfo>();
  const education = watch("education");

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[rgb(var(--tp-fg-rgb))]">Education Background</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="education.highestLevel">
            Highest Level of Education <span className="text-red-500">*</span>
          </Label>
          <Select
            value={education?.highestLevel || "bachelor"}
            onValueChange={(value) => setValue("education.highestLevel", value as any)}
          >
            <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              {educationLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="education.fieldOfStudy">Field of Study</Label>
          <Input
            id="education.fieldOfStudy"
            placeholder="e.g., Computer Science, Business Administration"
            {...register("education.fieldOfStudy")}
            className="bg-[rgb(var(--tp-surface-rgb))]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="education.institution">Institution Name</Label>
          <Input
            id="education.institution"
            placeholder="e.g., Harvard University"
            {...register("education.institution")}
            className="bg-[rgb(var(--tp-surface-rgb))]"
          />
        </div>
      </div>
    </div>
  );
}
