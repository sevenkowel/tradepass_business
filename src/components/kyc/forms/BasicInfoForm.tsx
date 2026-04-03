"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactVerificationForm } from "./ContactVerificationForm";
import type { FieldConfig } from "@/lib/kyc/region-config";
import type { PersonalInfo } from "@/lib/kyc/types";
import type { ContactVerificationConfig } from "@/lib/config/types";

interface BasicInfoFormProps {
  fields: FieldConfig[];
  contactVerification?: ContactVerificationConfig;
  preVerifiedPhone?: string;
  preVerifiedEmail?: string;
}

export function BasicInfoForm({ fields, contactVerification, preVerifiedPhone, preVerifiedEmail }: BasicInfoFormProps) {
  const { register, formState: { errors }, setValue, watch } = useFormContext<PersonalInfo>();

  // Filter out phone and email fields (handled by ContactVerificationForm)
  const regularFields = fields.filter(f => f.name !== "phone" && f.name !== "email");

  const renderField = (field: FieldConfig) => {
    const error = errors[field.name as keyof PersonalInfo];

    switch (field.type) {
      case "select":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              onValueChange={(value) => setValue(field.name as keyof PersonalInfo, value)}
              defaultValue={watch(field.name as keyof PersonalInfo) as string}
            >
              <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-xs text-red-500">{error.message}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="date"
              {...register(field.name as keyof PersonalInfo)}
              className="bg-[rgb(var(--tp-surface-rgb))]"
            />
            {error && <p className="text-xs text-red-500">{error.message}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="space-y-2 md:col-span-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <textarea
              id={field.name}
              {...register(field.name as keyof PersonalInfo)}
              placeholder={field.placeholder}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-[rgb(var(--tp-surface-rgb))] border border-[rgba(var(--tp-fg-rgb),0.2)] text-[rgb(var(--tp-fg-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--tp-accent-rgb))]"
            />
            {error && <p className="text-xs text-red-500">{error.message}</p>}
          </div>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.name as keyof PersonalInfo)}
              className="bg-[rgb(var(--tp-surface-rgb))]"
            />
            {error && <p className="text-xs text-red-500">{error.message}</p>}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[rgb(var(--tp-fg-rgb))]">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regularFields.map(renderField)}
      </div>

      {/* Contact Verification Section */}
      {contactVerification && (contactVerification.phoneOtpRequired || contactVerification.emailOtpRequired) && (
        <ContactVerificationForm
          config={contactVerification}
          preVerifiedPhone={preVerifiedPhone}
          preVerifiedEmail={preVerifiedEmail}
        />
      )}
    </div>
  );
}
