/**
 * KYC 表单验证 Schema (Zod)
 */

import { z } from "zod";

// 基础信息 Schema
export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  nationality: z.string().min(2, "Nationality is required"),
  placeOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  phone: z.string().min(8, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().optional(),
  country: z.string().min(2, "Country is required"),
});

// 教育背景 Schema
export const educationSchema = z.object({
  highestLevel: z.enum(["high_school", "bachelor", "master", "doctorate", "other"]),
  fieldOfStudy: z.string().optional(),
  institution: z.string().optional(),
});

// 投资经验 Schema
export const investmentExperienceSchema = z.object({
  yearsOfExperience: z.enum(["none", "less_than_1", "1_to_3", "3_to_5", "more_than_5"]),
  tradingFrequency: z.enum(["rarely", "monthly", "weekly", "daily"]),
  productsTraded: z.array(z.string()).min(1, "Select at least one product"),
  averageTradeSize: z.string().optional(),
  riskTolerance: z.enum(["low", "medium", "high"]),
});

// 财务状况 Schema
export const financialStatusSchema = z.object({
  annualIncome: z.enum(["below_25k", "25k_to_50k", "50k_to_100k", "100k_to_250k", "above_250k"]),
  netWorth: z.enum(["below_50k", "50k_to_100k", "100k_to_500k", "500k_to_1m", "above_1m"]),
  sourceOfFunds: z.string().min(2, "Source of funds is required"),
  investmentObjectives: z.array(z.string()).min(1, "Select at least one objective"),
});

// 声明 Schema
export const declarationsSchema = z.object({
  isUSPerson: z.boolean(),
  isPEP: z.boolean(),
  isMilitary: z.boolean(),
  isFinancialProfessional: z.boolean(),
  hasCriminalRecord: z.boolean(),
  
  // US Person 详情
  usPersonDetails: z.object({
    isUSCitizen: z.boolean(),
    isUSResident: z.boolean(),
    isUSGreenCardHolder: z.boolean(),
    taxId: z.string().optional(),
  }).optional(),
  
  // PEP 详情
  pepDetails: z.object({
    isPEP: z.boolean(),
    relationship: z.enum(["self", "family", "associate"]).optional(),
    position: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  
  // 军队详情
  militaryDetails: z.object({
    isMilitary: z.boolean(),
    branch: z.string().optional(),
    rank: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  
  // 专业详情
  professionalDetails: z.object({
    isProfessional: z.boolean(),
    licenseType: z.string().optional(),
    licenseNumber: z.string().optional(),
    employer: z.string().optional(),
  }).optional(),
});

// 完整个人信息 Schema
export const fullPersonalInfoSchema = z.object({
  personalInfo: personalInfoSchema,
  education: educationSchema.optional(),
  investmentExperience: investmentExperienceSchema.optional(),
  financialStatus: financialStatusSchema.optional(),
  declarations: declarationsSchema.optional(),
});

// 导出类型
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type EducationFormData = z.infer<typeof educationSchema>;
export type InvestmentExperienceFormData = z.infer<typeof investmentExperienceSchema>;
export type FinancialStatusFormData = z.infer<typeof financialStatusSchema>;
export type DeclarationsFormData = z.infer<typeof declarationsSchema>;
export type FullPersonalInfoFormData = z.infer<typeof fullPersonalInfoSchema>;
