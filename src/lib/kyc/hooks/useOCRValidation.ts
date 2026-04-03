"use client";

import { useState, useCallback, useMemo } from "react";
import { validateNameSimilarity } from "@/lib/kyc/validation/similarity";
import { validateAge } from "@/lib/kyc/validation/age";
import { validateExpiry } from "@/lib/kyc/validation/expiry";
import {
  getAllFieldConfigs,
  type FieldConfig,
} from "@/lib/kyc/field-config";
import type { OCRResult, DocumentType } from "@/lib/kyc/types";

// 验证错误
export interface ValidationError {
  field: string;
  message: string;
}

// 验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  nameSimilarity?: number;
  age?: number;
  monthsRemaining?: number;
}

interface UseOCRValidationProps {
  documentType: DocumentType;
  originalData: OCRResult;
  editedData: Record<string, string>;
}

/**
 * OCR 数据验证 Hook
 * 实时校验用户编辑的 OCR 数据
 */
export function useOCRValidation({
  documentType,
  originalData,
  editedData,
}: UseOCRValidationProps) {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // 获取字段配置
  const fieldConfigs = useMemo(
    () => getAllFieldConfigs(documentType),
    [documentType]
  );

  // 执行完整验证
  const validate = useCallback((): ValidationResult => {
    const newErrors: ValidationError[] = [];
    let nameSimilarity: number | undefined;
    let age: number | undefined;
    let monthsRemaining: number | undefined;

    fieldConfigs.forEach((config) => {
      const value = editedData[config.key];
      const originalValue = originalData[config.key as keyof OCRResult];

      // 必填校验
      if (config.required && (!value || value.trim() === "")) {
        newErrors.push({
          field: config.key,
          message: "此字段为必填项",
        });
        return;
      }

      // 执行特定校验
      config.validations?.forEach((validationType) => {
        switch (validationType) {
          case "name_similarity": {
            if (config.key === "fullName" && value && originalValue) {
              const threshold = config.validationParams?.similarityThreshold || 0.8;
              const result = validateNameSimilarity(
                String(originalValue),
                value,
                threshold
              );
              nameSimilarity = result.similarity;
              if (!result.isValid) {
                newErrors.push({
                  field: config.key,
                  message: result.message || "姓名与证件不一致",
                });
              }
            }
            break;
          }

          case "age": {
            if (config.key === "dateOfBirth" && value) {
              const minAge = config.validationParams?.minAge || 18;
              const maxAge = config.validationParams?.maxAge || 60;
              const result = validateAge(value, minAge, maxAge);
              age = result.age;
              if (!result.isValid) {
                newErrors.push({
                  field: config.key,
                  message: result.message || "年龄不符合要求",
                });
              }
            }
            break;
          }

          case "expiry": {
            if (config.key === "expiryDate" && value) {
              const minMonths = config.validationParams?.minExpiryMonths || 3;
              const result = validateExpiry(value, minMonths);
              monthsRemaining = result.monthsRemaining;
              if (!result.isValid) {
                newErrors.push({
                  field: config.key,
                  message: result.message || "证件有效期不足",
                });
              }
            }
            break;
          }
        }
      });
    });

    setErrors(newErrors);

    return {
      isValid: newErrors.length === 0,
      errors: newErrors,
      nameSimilarity,
      age,
      monthsRemaining,
    };
  }, [fieldConfigs, editedData, originalData]);

  // 验证单个字段
  const validateField = useCallback(
    (fieldKey: string): ValidationError | undefined => {
      const config = fieldConfigs.find((f) => f.key === fieldKey);
      if (!config) return undefined;

      const value = editedData[fieldKey];
      const originalValue = originalData[fieldKey as keyof OCRResult];

      // 必填校验
      if (config.required && (!value || value.trim() === "")) {
        return {
          field: fieldKey,
          message: "此字段为必填项",
        };
      }

      // 特定校验
      for (const validationType of config.validations || []) {
        switch (validationType) {
          case "name_similarity": {
            if (fieldKey === "fullName" && value && originalValue) {
              const threshold = config.validationParams?.similarityThreshold || 0.8;
              const result = validateNameSimilarity(
                String(originalValue),
                value,
                threshold
              );
              if (!result.isValid) {
                return {
                  field: fieldKey,
                  message: result.message || "姓名与证件不一致",
                };
              }
            }
            break;
          }

          case "age": {
            if (fieldKey === "dateOfBirth" && value) {
              const minAge = config.validationParams?.minAge || 18;
              const maxAge = config.validationParams?.maxAge || 60;
              const result = validateAge(value, minAge, maxAge);
              if (!result.isValid) {
                return {
                  field: fieldKey,
                  message: result.message || "年龄不符合要求",
                };
              }
            }
            break;
          }

          case "expiry": {
            if (fieldKey === "expiryDate" && value) {
              const minMonths = config.validationParams?.minExpiryMonths || 3;
              const result = validateExpiry(value, minMonths);
              if (!result.isValid) {
                return {
                  field: fieldKey,
                  message: result.message || "证件有效期不足",
                };
              }
            }
            break;
          }
        }
      }

      return undefined;
    },
    [fieldConfigs, editedData, originalData]
  );

  // 获取字段错误
  const getFieldError = useCallback(
    (fieldKey: string): string | undefined => {
      return errors.find((e) => e.field === fieldKey)?.message;
    },
    [errors]
  );

  return {
    errors,
    validate,
    validateField,
    getFieldError,
  };
}
