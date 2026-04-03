/**
 * KYC OCR 字段配置
 * 定义各证件类型的字段展示规则和校验配置
 */

import type { DocumentType } from "./region-config";

// 字段类型
export type FieldType = "text" | "date" | "select" | "textarea";

// 校验规则类型
export type ValidationType = "name_similarity" | "age" | "expiry" | "required";

// 字段配置
export interface FieldConfig {
  key: string;
  label: string;
  labelCn: string;
  type: FieldType;
  editable: boolean;
  required: boolean;
  validations?: ValidationType[];
  // 校验参数
  validationParams?: {
    minAge?: number;
    maxAge?: number;
    minExpiryMonths?: number;
    similarityThreshold?: number;
  };
  // 占位符
  placeholder?: string;
  // 字段说明
  description?: string;
}

// 文档类型字段配置
export const DOCUMENT_FIELD_CONFIG: Record<DocumentType, FieldConfig[]> = {
  // 身份证
  id_card: [
    {
      key: "fullName",
      label: "Full Name",
      labelCn: "姓名",
      type: "text",
      editable: true,
      required: true,
      validations: ["name_similarity", "required"],
      validationParams: { similarityThreshold: 0.8 },
      placeholder: "Enter your full name",
      description: "请确保姓名与证件一致，否则可能审核失败",
    },
    {
      key: "idNumber",
      label: "ID Number",
      labelCn: "身份证号",
      type: "text",
      editable: false,
      required: true,
      validations: ["required"],
    },
    {
      key: "nationality",
      label: "Nationality",
      labelCn: "国籍",
      type: "text",
      editable: false,
      required: true,
    },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      labelCn: "出生日期",
      type: "date",
      editable: false,
      required: true,
      validations: ["age", "required"],
      validationParams: { minAge: 18, maxAge: 60 },
    },
    {
      key: "gender",
      label: "Gender",
      labelCn: "性别",
      type: "text",
      editable: false,
      required: false,
    },
    {
      key: "address",
      label: "Address",
      labelCn: "地址",
      type: "textarea",
      editable: true,
      required: false,
      placeholder: "Enter your address",
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      labelCn: "有效期至",
      type: "date",
      editable: false,
      required: true,
    },
  ],

  // 护照
  passport: [
    {
      key: "fullName",
      label: "Full Name",
      labelCn: "姓名",
      type: "text",
      editable: true,
      required: true,
      validations: ["name_similarity", "required"],
      validationParams: { similarityThreshold: 0.8 },
      placeholder: "Enter your full name",
      description: "请确保姓名与证件一致，否则可能审核失败",
    },
    {
      key: "idNumber",
      label: "Passport Number",
      labelCn: "护照号",
      type: "text",
      editable: false,
      required: true,
      validations: ["required"],
    },
    {
      key: "nationality",
      label: "Nationality",
      labelCn: "国籍",
      type: "text",
      editable: false,
      required: true,
    },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      labelCn: "出生日期",
      type: "date",
      editable: false,
      required: true,
      validations: ["age", "required"],
      validationParams: { minAge: 18, maxAge: 60 },
    },
    {
      key: "issuingCountry",
      label: "Issuing Country",
      labelCn: "签发国家",
      type: "text",
      editable: false,
      required: true,
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      labelCn: "有效期至",
      type: "date",
      editable: false,
      required: true,
      validations: ["expiry", "required"],
      validationParams: { minExpiryMonths: 3 },
    },
  ],

  // 驾驶证
  driving_license: [
    {
      key: "fullName",
      label: "Full Name",
      labelCn: "姓名",
      type: "text",
      editable: true,
      required: true,
      validations: ["name_similarity", "required"],
      validationParams: { similarityThreshold: 0.8 },
      placeholder: "Enter your full name",
      description: "请确保姓名与证件一致，否则可能审核失败",
    },
    {
      key: "idNumber",
      label: "License Number",
      labelCn: "证件号",
      type: "text",
      editable: false,
      required: true,
      validations: ["required"],
    },
    {
      key: "nationality",
      label: "Country",
      labelCn: "国家",
      type: "text",
      editable: false,
      required: true,
    },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      labelCn: "出生日期",
      type: "date",
      editable: false,
      required: true,
      validations: ["age", "required"],
      validationParams: { minAge: 18, maxAge: 60 },
    },
    {
      key: "address",
      label: "Address",
      labelCn: "地址",
      type: "textarea",
      editable: true,
      required: false,
      placeholder: "Enter your address",
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      labelCn: "有效期至",
      type: "date",
      editable: false,
      required: true,
    },
  ],
};

// 获取字段配置
export function getFieldConfig(
  documentType: DocumentType,
  key: string
): FieldConfig | undefined {
  return DOCUMENT_FIELD_CONFIG[documentType]?.find((f) => f.key === key);
}

// 获取所有字段配置
export function getAllFieldConfigs(documentType: DocumentType): FieldConfig[] {
  return DOCUMENT_FIELD_CONFIG[documentType] || [];
}

// 获取可编辑字段
export function getEditableFields(documentType: DocumentType): FieldConfig[] {
  return DOCUMENT_FIELD_CONFIG[documentType]?.filter((f) => f.editable) || [];
}

// 获取锁定字段
export function getLockedFields(documentType: DocumentType): FieldConfig[] {
  return DOCUMENT_FIELD_CONFIG[documentType]?.filter((f) => !f.editable) || [];
}

// 错误提示文案
export const VALIDATION_MESSAGES = {
  name_similarity: {
    en: "The name you entered does not match your ID. Please ensure it matches your document.",
    cn: "您填写的姓名与证件不一致，请确保与证件完全一致",
  },
  age_under: {
    en: "You must be at least 18 years old to complete verification.",
    cn: "您未满18岁，暂无法完成实名认证",
  },
  age_over: {
    en: "Your age does not meet the platform requirements for verification.",
    cn: "您的年龄不符合平台要求，暂无法完成实名认证",
  },
  expiry: {
    en: "Your passport is valid for less than 3 months. Please use a valid document.",
    cn: "您的护照有效期不足3个月，请更换有效证件后再试",
  },
  required: {
    en: "This field is required",
    cn: "此字段为必填项",
  },
  ocr_failed: {
    en: "Unable to recognize the document. Please re-upload a clear photo.",
    cn: "无法识别证件，请重新上传清晰照片",
  },
  info_missing: {
    en: "Some information was not recognized. Please fill in the missing details.",
    cn: "部分信息未识别，请补充填写",
  },
  image_quality: {
    en: "Please upload a clear photo without obstruction or glare.",
    cn: "请上传清晰、无遮挡、无反光的证件照片",
  },
};

// 获取错误提示
export function getValidationMessage(
  key: keyof typeof VALIDATION_MESSAGES,
  lang: "en" | "cn" = "cn"
): string {
  return VALIDATION_MESSAGES[key][lang];
}
