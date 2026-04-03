# KYC 地区配置规范

**版本**: v1.0  
**日期**: 2026-04-03

---

## 1. 配置结构

```typescript
// 地区 KYC 配置
interface RegionKYCConfig {
  regionCode: string;           // ISO 3166-1 alpha-2 代码
  regionName: string;           // 地区名称
  regionNameLocal: string;      // 本地语言名称
  
  // 认证级别
  kycLevel: "basic" | "standard" | "enhanced";
  
  // 证件配置
  documents: {
    allowedTypes: ("id_card" | "passport" | "driving_license")[];
    maxFileSize: number;        // MB
    allowedFormats: string[];   // ["jpg", "png", "pdf"]
    ocrEnabled: boolean;
  };
  
  // 功能开关
  features: {
    livenessRequired: boolean;     // 活体识别
    addressProofRequired: boolean; // 地址证明
    videoKYCRequired: boolean;     // 视频 KYC
    manualReviewRequired: boolean; // 强制人工复核
  };
  
  // 表单字段配置
  formFields: {
    // 基础信息（始终显示）
    personalInfo: {
      fields: ("name" | "dob" | "gender" | "nationality" | "idNumber" | 
               "idExpiry" | "address" | "phone" | "email")[];
      required: string[];
    };
    
    // 教育背景
    education: {
      enabled: boolean;
      fields: ("highestDegree" | "fieldOfStudy" | "institution")[];
    };
    
    // 投资经验
    investmentExperience: {
      enabled: boolean;
      fields: ("tradingYears" | "tradingProducts" | "tradingFrequency" | "annualVolume")[];
    };
    
    // 财务状况
    financialStatus: {
      enabled: boolean;
      fields: ("annualIncome" | "netWorth" | "investmentGoal" | "riskTolerance")[];
    };
    
    // 声明类
    declarations: {
      usPerson: boolean;        // 美国人声明 (W-8BEN/W-9)
      pep: boolean;             // PEP 声明
      military: boolean;        // 军队/政治背景
      professional: boolean;    // 金融专业声明
    };
  };
  
  // 本地化配置
  localization: {
    defaultLanguage: string;    // "vi", "th", "en" 等
    supportedLanguages: string[];
    dateFormat: string;         // "DD/MM/YYYY"
    currency: string;           // 默认币种
  };
}
```

---

## 2. 地区配置详情

### 2.1 越南 (VN)

```json
{
  "regionCode": "VN",
  "regionName": "Vietnam",
  "regionNameLocal": "Việt Nam",
  "kycLevel": "standard",
  "documents": {
    "allowedTypes": ["id_card", "passport"],
    "maxFileSize": 10,
    "allowedFormats": ["jpg", "png", "pdf"],
    "ocrEnabled": true
  },
  "features": {
    "livenessRequired": true,
    "addressProofRequired": false,
    "videoKYCRequired": false,
    "manualReviewRequired": false
  },
  "formFields": {
    "personalInfo": {
      "fields": ["name", "dob", "gender", "nationality", "idNumber", "idExpiry", "address", "phone", "email"],
      "required": ["name", "dob", "gender", "idNumber", "address", "phone", "email"]
    },
    "education": {
      "enabled": true,
      "fields": ["highestDegree", "fieldOfStudy", "institution"]
    },
    "investmentExperience": {
      "enabled": true,
      "fields": ["tradingYears", "tradingProducts", "tradingFrequency", "annualVolume"]
    },
    "financialStatus": {
      "enabled": true,
      "fields": ["annualIncome", "netWorth", "investmentGoal", "riskTolerance"]
    },
    "declarations": {
      "usPerson": true,
      "pep": true,
      "military": true,
      "professional": true
    }
  },
  "localization": {
    "defaultLanguage": "vi",
    "supportedLanguages": ["vi", "en"],
    "dateFormat": "DD/MM/YYYY",
    "currency": "USD"
  }
}
```

### 2.2 泰国 (TH)

```json
{
  "regionCode": "TH",
  "regionName": "Thailand",
  "regionNameLocal": "ประเทศไทย",
  "kycLevel": "standard",
  "documents": {
    "allowedTypes": ["id_card", "passport", "driving_license"],
    "maxFileSize": 10,
    "allowedFormats": ["jpg", "png", "pdf"],
    "ocrEnabled": true
  },
  "features": {
    "livenessRequired": true,
    "addressProofRequired": false,
    "videoKYCRequired": false,
    "manualReviewRequired": false
  },
  "formFields": {
    "personalInfo": {
      "fields": ["name", "dob", "gender", "nationality", "idNumber", "idExpiry", "address", "phone", "email"],
      "required": ["name", "dob", "gender", "idNumber", "address", "phone", "email"]
    },
    "education": {
      "enabled": true,
      "fields": ["highestDegree", "fieldOfStudy", "institution"]
    },
    "investmentExperience": {
      "enabled": true,
      "fields": ["tradingYears", "tradingProducts", "tradingFrequency", "annualVolume"]
    },
    "financialStatus": {
      "enabled": true,
      "fields": ["annualIncome", "netWorth", "investmentGoal", "riskTolerance"]
    },
    "declarations": {
      "usPerson": true,
      "pep": true,
      "military": false,
      "professional": true
    }
  },
  "localization": {
    "defaultLanguage": "th",
    "supportedLanguages": ["th", "en"],
    "dateFormat": "DD/MM/YYYY",
    "currency": "USD"
  }
}
```

### 2.3 印度 (IN)

```json
{
  "regionCode": "IN",
  "regionName": "India",
  "regionNameLocal": "भारत",
  "kycLevel": "enhanced",
  "documents": {
    "allowedTypes": ["id_card", "passport", "driving_license"],
    "maxFileSize": 10,
    "allowedFormats": ["jpg", "png", "pdf"],
    "ocrEnabled": true
  },
  "features": {
    "livenessRequired": true,
    "addressProofRequired": true,
    "videoKYCRequired": false,
    "manualReviewRequired": true
  },
  "formFields": {
    "personalInfo": {
      "fields": ["name", "dob", "gender", "nationality", "idNumber", "idExpiry", "address", "phone", "email"],
      "required": ["name", "dob", "gender", "idNumber", "address", "phone", "email"]
    },
    "education": {
      "enabled": true,
      "fields": ["highestDegree", "fieldOfStudy", "institution"]
    },
    "investmentExperience": {
      "enabled": true,
      "fields": ["tradingYears", "tradingProducts", "tradingFrequency", "annualVolume"]
    },
    "financialStatus": {
      "enabled": true,
      "fields": ["annualIncome", "netWorth", "investmentGoal", "riskTolerance"]
    },
    "declarations": {
      "usPerson": true,
      "pep": true,
      "military": true,
      "professional": true
    }
  },
  "localization": {
    "defaultLanguage": "en",
    "supportedLanguages": ["en", "hi"],
    "dateFormat": "DD/MM/YYYY",
    "currency": "USD"
  }
}
```

### 2.4 阿拉伯联合酋长国 (AE)

```json
{
  "regionCode": "AE",
  "regionName": "United Arab Emirates",
  "regionNameLocal": "الإمارات العربية المتحدة",
  "kycLevel": "enhanced",
  "documents": {
    "allowedTypes": ["passport", "driving_license"],
    "maxFileSize": 10,
    "allowedFormats": ["jpg", "png", "pdf"],
    "ocrEnabled": true
  },
  "features": {
    "livenessRequired": true,
    "addressProofRequired": true,
    "videoKYCRequired": false,
    "manualReviewRequired": true
  },
  "formFields": {
    "personalInfo": {
      "fields": ["name", "dob", "gender", "nationality", "idNumber", "idExpiry", "address", "phone", "email"],
      "required": ["name", "dob", "gender", "idNumber", "address", "phone", "email"]
    },
    "education": {
      "enabled": true,
      "fields": ["highestDegree", "fieldOfStudy", "institution"]
    },
    "investmentExperience": {
      "enabled": true,
      "fields": ["tradingYears", "tradingProducts", "tradingFrequency", "annualVolume"]
    },
    "financialStatus": {
      "enabled": true,
      "fields": ["annualIncome", "netWorth", "investmentGoal", "riskTolerance"]
    },
    "declarations": {
      "usPerson": true,
      "pep": true,
      "military": true,
      "professional": true
    }
  },
  "localization": {
    "defaultLanguage": "en",
    "supportedLanguages": ["en", "ar"],
    "dateFormat": "DD/MM/YYYY",
    "currency": "USD"
  }
}
```

### 2.5 韩国 (KR)

```json
{
  "regionCode": "KR",
  "regionName": "South Korea",
  "regionNameLocal": "대한민국",
  "kycLevel": "standard",
  "documents": {
    "allowedTypes": ["id_card", "passport"],
    "maxFileSize": 10,
    "allowedFormats": ["jpg", "png", "pdf"],
    "ocrEnabled": true
  },
  "features": {
    "livenessRequired": true,
    "addressProofRequired": false,
    "videoKYCRequired": false,
    "manualReviewRequired": false
  },
  "formFields": {
    "personalInfo": {
      "fields": ["name", "dob", "gender", "nationality", "idNumber", "idExpiry", "address", "phone", "email"],
      "required": ["name", "dob", "gender", "idNumber", "address", "phone", "email"]
    },
    "education": {
      "enabled": true,
      "fields": ["highestDegree", "fieldOfStudy", "institution"]
    },
    "investmentExperience": {
      "enabled": true,
      "fields": ["tradingYears", "tradingProducts", "tradingFrequency", "annualVolume"]
    },
    "financialStatus": {
      "enabled": true,
      "fields": ["annualIncome", "netWorth", "investmentGoal", "riskTolerance"]
    },
    "declarations": {
      "usPerson": true,
      "pep": true,
      "military": false,
      "professional": true
    }
  },
  "localization": {
    "defaultLanguage": "ko",
    "supportedLanguages": ["ko", "en"],
    "dateFormat": "YYYY-MM-DD",
    "currency": "USD"
  }
}
```

### 2.6 日本 (JP)

```json
{
  "regionCode": "JP",
  "regionName": "Japan",
  "regionNameLocal": "日本",
  "kycLevel": "enhanced",
  "documents": {
    "allowedTypes": ["id_card", "passport"],
    "maxFileSize": 10,
    "allowedFormats": ["jpg", "png", "pdf"],
    "ocrEnabled": true
  },
  "features": {
    "livenessRequired": true,
    "addressProofRequired": true,
    "videoKYCRequired": false,
    "manualReviewRequired": true
  },
  "formFields": {
    "personalInfo": {
      "fields": ["name", "dob", "gender", "nationality", "idNumber", "idExpiry", "address", "phone", "email"],
      "required": ["name", "dob", "gender", "idNumber", "address", "phone", "email"]
    },
    "education": {
      "enabled": true,
      "fields": ["highestDegree", "fieldOfStudy", "institution"]
    },
    "investmentExperience": {
      "enabled": true,
      "fields": ["tradingYears", "tradingProducts", "tradingFrequency", "annualVolume"]
    },
    "financialStatus": {
      "enabled": true,
      "fields": ["annualIncome", "netWorth", "investmentGoal", "riskTolerance"]
    },
    "declarations": {
      "usPerson": true,
      "pep": true,
      "military": false,
      "professional": true
    }
  },
  "localization": {
    "defaultLanguage": "ja",
    "supportedLanguages": ["ja", "en"],
    "dateFormat": "YYYY/MM/DD",
    "currency": "USD"
  }
}
```

### 2.7 法国 (FR)

```json
{
  "regionCode": "FR",
  "regionName": "France",
  "regionNameLocal": "France",
  "kycLevel": "enhanced",
  "documents": {
    "allowedTypes": ["passport", "driving_license"],
    "maxFileSize": 10,
    "allowedFormats": ["jpg", "png", "pdf"],
    "ocrEnabled": true
  },
  "features": {
    "livenessRequired": true,
    "addressProofRequired": true,
    "videoKYCRequired": false,
    "manualReviewRequired": true
  },
  "formFields": {
    "personalInfo": {
      "fields": ["name", "dob", "gender", "nationality", "idNumber", "idExpiry", "address", "phone", "email"],
      "required": ["name", "dob", "gender", "idNumber", "address", "phone", "email"]
    },
    "education": {
      "enabled": true,
      "fields": ["highestDegree", "fieldOfStudy", "institution"]
    },
    "investmentExperience": {
      "enabled": true,
      "fields": ["tradingYears", "tradingProducts", "tradingFrequency", "annualVolume"]
    },
    "financialStatus": {
      "enabled": true,
      "fields": ["annualIncome", "netWorth", "investmentGoal", "riskTolerance"]
    },
    "declarations": {
      "usPerson": true,
      "pep": true,
      "military": false,
      "professional": true
    }
  },
  "localization": {
    "defaultLanguage": "fr",
    "supportedLanguages": ["fr", "en"],
    "dateFormat": "DD/MM/YYYY",
    "currency": "EUR"
  }
}
```

### 2.8 西班牙 (ES)

```json
{
  "regionCode": "ES",
  "regionName": "Spain",
  "regionNameLocal": "España",
  "kycLevel": "enhanced",
  "documents": {
    "allowedTypes": ["passport", "driving_license"],
    "maxFileSize": 10,
    "allowedFormats": ["jpg", "png", "pdf"],
    "ocrEnabled": true
  },
  "features": {
    "livenessRequired": true,
    "addressProofRequired": true,
    "videoKYCRequired": false,
    "manualReviewRequired": true
  },
  "formFields": {
    "personalInfo": {
      "fields": ["name", "dob", "gender", "nationality", "idNumber", "idExpiry", "address", "phone", "email"],
      "required": ["name", "dob", "gender", "idNumber", "address", "phone", "email"]
    },
    "education": {
      "enabled": true,
      "fields": ["highestDegree", "fieldOfStudy", "institution"]
    },
    "investmentExperience": {
      "enabled": true,
      "fields": ["tradingYears", "tradingProducts", "tradingFrequency", "annualVolume"]
    },
    "financialStatus": {
      "enabled": true,
      "fields": ["annualIncome", "netWorth", "investmentGoal", "riskTolerance"]
    },
    "declarations": {
      "usPerson": true,
      "pep": true,
      "military": false,
      "professional": true
    }
  },
  "localization": {
    "defaultLanguage": "es",
    "supportedLanguages": ["es", "en"],
    "dateFormat": "DD/MM/YYYY",
    "currency": "EUR"
  }
}
```

### 2.9 巴西 (BR)

```json
{
  "regionCode": "BR",
  "regionName": "Brazil",
  "regionNameLocal": "Brasil",
  "kycLevel": "standard",
  "documents": {
    "allowedTypes": ["id_card", "passport", "driving_license"],
    "maxFileSize": 10,
    "allowedFormats": ["jpg", "png", "pdf"],
    "ocrEnabled": true
  },
  "features": {
    "livenessRequired": true,
    "addressProofRequired": false,
    "videoKYCRequired": false,
    "manualReviewRequired": false
  },
  "formFields": {
    "personalInfo": {
      "fields": ["name", "dob", "gender", "nationality", "idNumber", "idExpiry", "address", "phone", "email"],
      "required": ["name", "dob", "gender", "idNumber", "address", "phone", "email"]
    },
    "education": {
      "enabled": true,
      "fields": ["highestDegree", "fieldOfStudy", "institution"]
    },
    "investmentExperience": {
      "enabled": true,
      "fields": ["tradingYears", "tradingProducts", "tradingFrequency", "annualVolume"]
    },
    "financialStatus": {
      "enabled": true,
      "fields": ["annualIncome", "netWorth", "investmentGoal", "riskTolerance"]
    },
    "declarations": {
      "usPerson": true,
      "pep": true,
      "military": false,
      "professional": true
    }
  },
  "localization": {
    "defaultLanguage": "pt",
    "supportedLanguages": ["pt", "en"],
    "dateFormat": "DD/MM/YYYY",
    "currency": "USD"
  }
}
```

---

## 3. 配置加载规则

### 3.1 用户地区判定
1. 优先使用用户注册时填写的居住地址
2. 如未填写，使用 IP 地理位置（提示用户确认）
3. 用户可在 KYC 开始前修改地区

### 3.2 配置缓存
- 地区配置缓存在前端，减少 API 请求
- 配置版本号管理，更新时自动刷新

### 3.3 动态表单渲染
```typescript
// 根据配置动态渲染表单字段
const renderFormFields = (config: RegionKYCConfig) => {
  // 基础信息字段
  config.formFields.personalInfo.fields.forEach(field => {
    renderField(field, config.formFields.personalInfo.required.includes(field));
  });
  
  // 教育背景
  if (config.formFields.education.enabled) {
    renderEducationSection(config.formFields.education.fields);
  }
  
  // 投资经验
  if (config.formFields.investmentExperience.enabled) {
    renderExperienceSection(config.formFields.investmentExperience.fields);
  }
  
  // 财务状况
  if (config.formFields.financialStatus.enabled) {
    renderFinancialSection(config.formFields.financialStatus.fields);
  }
  
  // 声明
  renderDeclarations(config.formFields.declarations);
};
```
