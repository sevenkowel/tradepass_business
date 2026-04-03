/**
 * KYC 地区化配置中心
 * 支持 9 个地区：越南(VN)、泰国(TH)、印度(IN)、阿联酋(AE)、韩国(KR)、日本(JP)、法国(FR)、西班牙(ES)、巴西(BR)
 */

export type RegionCode = "VN" | "TH" | "IN" | "AE" | "KR" | "JP" | "FR" | "ES" | "BR";

export type KYCLevel = "basic" | "standard" | "enhanced";

export type DocumentType = "id_card" | "passport" | "driving_license";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "select" | "number" | "textarea";
  required: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export interface RegionKYCConfig {
  regionCode: RegionCode;
  regionName: string;
  regionNameLocal: string;
  kycLevel: KYCLevel;
  allowedDocuments: DocumentType[];
  features: {
    ocrEnabled: boolean;
    livenessRequired: boolean;
    addressProofRequired: boolean;
    videoKYCRequired: boolean;
  };
  formFields: {
    personalInfo: FieldConfig[];
    education: boolean;
    investmentExperience: boolean;
    financialStatus: boolean;
    pepDeclaration: boolean;
    usPersonDeclaration: boolean;
    professionalDeclaration: boolean;
    militaryDeclaration: boolean;
  };
  idNumberPattern?: string;
  idNumberExample?: string;
}

// 越南 (Vietnam)
const vnConfig: RegionKYCConfig = {
  regionCode: "VN",
  regionName: "Vietnam",
  regionNameLocal: "Việt Nam",
  kycLevel: "standard",
  allowedDocuments: ["id_card", "passport"],
  features: {
    ocrEnabled: true,
    livenessRequired: true,
    addressProofRequired: false,
    videoKYCRequired: false,
  },
  formFields: {
    personalInfo: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "idNumber", label: "ID Number", type: "text", required: true, placeholder: "012345678901" },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "placeOfBirth", label: "Place of Birth", type: "text", required: true },
      { name: "address", label: "Residential Address", type: "textarea", required: true },
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    education: true,
    investmentExperience: true,
    financialStatus: true,
    pepDeclaration: true,
    usPersonDeclaration: true,
    professionalDeclaration: true,
    militaryDeclaration: true,
  },
  idNumberPattern: "^\\d{9}$|^\\d{12}$",
  idNumberExample: "012345678901",
};

// 泰国 (Thailand)
const thConfig: RegionKYCConfig = {
  regionCode: "TH",
  regionName: "Thailand",
  regionNameLocal: "ประเทศไทย",
  kycLevel: "standard",
  allowedDocuments: ["id_card", "passport"],
  features: {
    ocrEnabled: true,
    livenessRequired: true,
    addressProofRequired: false,
    videoKYCRequired: false,
  },
  formFields: {
    personalInfo: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "idNumber", label: "ID Number", type: "text", required: true, placeholder: "1234567890123" },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "address", label: "Residential Address", type: "textarea", required: true },
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    education: true,
    investmentExperience: true,
    financialStatus: true,
    pepDeclaration: true,
    usPersonDeclaration: true,
    professionalDeclaration: true,
    militaryDeclaration: false,
  },
  idNumberPattern: "^\\d{13}$",
  idNumberExample: "1234567890123",
};

// 印度 (India)
const inConfig: RegionKYCConfig = {
  regionCode: "IN",
  regionName: "India",
  regionNameLocal: "भारत",
  kycLevel: "enhanced",
  allowedDocuments: ["id_card", "passport", "driving_license"],
  features: {
    ocrEnabled: true,
    livenessRequired: true,
    addressProofRequired: true,
    videoKYCRequired: false,
  },
  formFields: {
    personalInfo: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "idNumber", label: "PAN Number", type: "text", required: true, placeholder: "ABCDE1234F" },
      { name: "aadhaarNumber", label: "Aadhaar Number (Optional)", type: "text", required: false, placeholder: "1234 5678 9012" },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "address", label: "Residential Address", type: "textarea", required: true },
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    education: true,
    investmentExperience: true,
    financialStatus: true,
    pepDeclaration: true,
    usPersonDeclaration: true,
    professionalDeclaration: true,
    militaryDeclaration: false,
  },
  idNumberPattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
  idNumberExample: "ABCDE1234F",
};

// 阿联酋 (UAE)
const aeConfig: RegionKYCConfig = {
  regionCode: "AE",
  regionName: "United Arab Emirates",
  regionNameLocal: "الإمارات العربية المتحدة",
  kycLevel: "enhanced",
  allowedDocuments: ["id_card", "passport"],
  features: {
    ocrEnabled: true,
    livenessRequired: true,
    addressProofRequired: true,
    videoKYCRequired: false,
  },
  formFields: {
    personalInfo: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "idNumber", label: "Emirates ID", type: "text", required: true, placeholder: "784-1234-1234567-1" },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "address", label: "Residential Address", type: "textarea", required: true },
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    education: true,
    investmentExperience: true,
    financialStatus: true,
    pepDeclaration: true,
    usPersonDeclaration: true,
    professionalDeclaration: true,
    militaryDeclaration: false,
  },
  idNumberPattern: "^784-\\d{4}-\\d{7}-\\d{1}$",
  idNumberExample: "784-1234-1234567-1",
};

// 韩国 (South Korea)
const krConfig: RegionKYCConfig = {
  regionCode: "KR",
  regionName: "South Korea",
  regionNameLocal: "대한민국",
  kycLevel: "standard",
  allowedDocuments: ["id_card", "passport", "driving_license"],
  features: {
    ocrEnabled: true,
    livenessRequired: true,
    addressProofRequired: false,
    videoKYCRequired: false,
  },
  formFields: {
    personalInfo: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "idNumber", label: "Resident Registration Number", type: "text", required: true, placeholder: "901010-1234567" },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "address", label: "Residential Address", type: "textarea", required: true },
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    education: true,
    investmentExperience: true,
    financialStatus: true,
    pepDeclaration: true,
    usPersonDeclaration: true,
    professionalDeclaration: true,
    militaryDeclaration: true,
  },
  idNumberPattern: "^\\d{6}-\\d{7}$",
  idNumberExample: "901010-1234567",
};

// 日本 (Japan)
const jpConfig: RegionKYCConfig = {
  regionCode: "JP",
  regionName: "Japan",
  regionNameLocal: "日本",
  kycLevel: "standard",
  allowedDocuments: ["id_card", "passport", "driving_license"],
  features: {
    ocrEnabled: true,
    livenessRequired: true,
    addressProofRequired: false,
    videoKYCRequired: false,
  },
  formFields: {
    personalInfo: [
      { name: "fullName", label: "Full Name (Romaji)", type: "text", required: true },
      { name: "fullNameJp", label: "Full Name (Japanese)", type: "text", required: true },
      { name: "idNumber", label: "Residence Card Number", type: "text", required: true, placeholder: "AB12345678" },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "address", label: "Residential Address", type: "textarea", required: true },
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    education: true,
    investmentExperience: true,
    financialStatus: true,
    pepDeclaration: true,
    usPersonDeclaration: true,
    professionalDeclaration: true,
    militaryDeclaration: false,
  },
  idNumberPattern: "^[A-Z]{2}\\d{8}$",
  idNumberExample: "AB12345678",
};

// 法国 (France)
const frConfig: RegionKYCConfig = {
  regionCode: "FR",
  regionName: "France",
  regionNameLocal: "France",
  kycLevel: "standard",
  allowedDocuments: ["id_card", "passport", "driving_license"],
  features: {
    ocrEnabled: true,
    livenessRequired: true,
    addressProofRequired: true,
    videoKYCRequired: false,
  },
  formFields: {
    personalInfo: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "idNumber", label: "ID Number", type: "text", required: true },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "birthPlace", label: "Place of Birth", type: "text", required: true },
      { name: "address", label: "Residential Address", type: "textarea", required: true },
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    education: true,
    investmentExperience: true,
    financialStatus: true,
    pepDeclaration: true,
    usPersonDeclaration: true,
    professionalDeclaration: true,
    militaryDeclaration: false,
  },
};

// 西班牙 (Spain)
const esConfig: RegionKYCConfig = {
  regionCode: "ES",
  regionName: "Spain",
  regionNameLocal: "España",
  kycLevel: "standard",
  allowedDocuments: ["id_card", "passport", "driving_license"],
  features: {
    ocrEnabled: true,
    livenessRequired: true,
    addressProofRequired: true,
    videoKYCRequired: false,
  },
  formFields: {
    personalInfo: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "idNumber", label: "DNI/NIE", type: "text", required: true, placeholder: "12345678A" },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "address", label: "Residential Address", type: "textarea", required: true },
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    education: true,
    investmentExperience: true,
    financialStatus: true,
    pepDeclaration: true,
    usPersonDeclaration: true,
    professionalDeclaration: true,
    militaryDeclaration: false,
  },
  idNumberPattern: "^\\d{8}[A-Z]$|^[XYZ]\\d{7}[A-Z]$",
  idNumberExample: "12345678A",
};

// 巴西 (Brazil)
const brConfig: RegionKYCConfig = {
  regionCode: "BR",
  regionName: "Brazil",
  regionNameLocal: "Brasil",
  kycLevel: "standard",
  allowedDocuments: ["id_card", "passport", "driving_license"],
  features: {
    ocrEnabled: true,
    livenessRequired: true,
    addressProofRequired: false,
    videoKYCRequired: false,
  },
  formFields: {
    personalInfo: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "idNumber", label: "CPF", type: "text", required: true, placeholder: "123.456.789-09" },
      { name: "rgNumber", label: "RG Number", type: "text", required: true },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "address", label: "Residential Address", type: "textarea", required: true },
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    education: true,
    investmentExperience: true,
    financialStatus: true,
    pepDeclaration: true,
    usPersonDeclaration: true,
    professionalDeclaration: true,
    militaryDeclaration: false,
  },
  idNumberPattern: "^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$",
  idNumberExample: "123.456.789-09",
};

// 配置映射
export const regionKYCConfigs: Record<RegionCode, RegionKYCConfig> = {
  VN: vnConfig,
  TH: thConfig,
  IN: inConfig,
  AE: aeConfig,
  KR: krConfig,
  JP: jpConfig,
  FR: frConfig,
  ES: esConfig,
  BR: brConfig,
};

// 获取地区配置
export function getRegionConfig(regionCode: RegionCode): RegionKYCConfig {
  const config = regionKYCConfigs[regionCode];
  if (!config) {
    throw new Error(`Unsupported region: ${regionCode}`);
  }
  return config;
}

// 获取所有支持的地区
export function getSupportedRegions(): RegionCode[] {
  return Object.keys(regionKYCConfigs) as RegionCode[];
}

// 验证地区代码
export function isValidRegion(regionCode: string): regionCode is RegionCode {
  return regionCode in regionKYCConfigs;
}

// 获取默认地区配置（用于测试或回退）
export function getDefaultRegionConfig(): RegionKYCConfig {
  return vnConfig;
}
