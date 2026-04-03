import { NextRequest, NextResponse } from "next/server";
import { validateNameSimilarity } from "@/lib/kyc/validation/similarity";
import { validateAge } from "@/lib/kyc/validation/age";
import { validateExpiry } from "@/lib/kyc/validation/expiry";
import {
  getAllFieldConfigs,
  getValidationMessage,
} from "@/lib/kyc/field-config";
import type { DocumentType } from "@/lib/kyc/region-config";
import type { OCRResult } from "@/lib/kyc/types";

// 验证错误
interface ValidationError {
  field: string;
  message: string;
}

// 请求体
interface ConfirmRequest {
  documentType: DocumentType;
  originalData: OCRResult;
  editedData: Record<string, string>;
  editedFields: string[];
}

/**
 * POST /api/kyc/ocr/confirm
 * OCR 确认接口
 * 接收用户确认的 OCR 数据，执行完整校验
 */
export async function POST(request: NextRequest) {
  try {
    const body: ConfirmRequest = await request.json();
    const { documentType, originalData, editedData, editedFields } = body;

    // 参数校验
    if (!documentType || !originalData || !editedData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 获取字段配置
    const fieldConfigs = getAllFieldConfigs(documentType);
    const errors: ValidationError[] = [];

    // 校验每个字段
    fieldConfigs.forEach((config) => {
      const value = editedData[config.key];
      const originalValue = originalData[config.key as keyof OCRResult];

      // 必填校验
      if (config.required && (!value || value.trim() === "")) {
        errors.push({
          field: config.key,
          message: getValidationMessage("required", "cn"),
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
              if (!result.isValid) {
                errors.push({
                  field: config.key,
                  message: result.message || getValidationMessage("name_similarity", "cn"),
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
              if (!result.isValid) {
                errors.push({
                  field: config.key,
                  message: result.message || getValidationMessage("age_under", "cn"),
                });
              }
            }
            break;
          }

          case "expiry": {
            if (config.key === "expiryDate" && value) {
              const minMonths = config.validationParams?.minExpiryMonths || 3;
              const result = validateExpiry(value, minMonths);
              if (!result.isValid) {
                errors.push({
                  field: config.key,
                  message: result.message || getValidationMessage("expiry", "cn"),
                });
              }
            }
            break;
          }
        }
      });
    });

    // 如果有验证错误，返回错误信息
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors,
        message: "验证失败，请修正以下问题",
      });
    }

    // 构建确认后的数据
    const confirmedData: Partial<OCRResult> = {
      ...originalData,
      ...editedData,
      userConfirmed: true,
      userEditedFields: editedFields,
    };

    // 计算姓名相似度（如果有编辑姓名）
    if (editedFields.includes("fullName") && originalData.fullName && editedData.fullName) {
      const similarityResult = validateNameSimilarity(
        originalData.fullName,
        editedData.fullName
      );
      confirmedData.nameSimilarity = similarityResult.similarity;
    }

    // TODO: 保存到数据库
    // TODO: 风控规则校验（黑名单、多次失败限制）

    return NextResponse.json({
      success: true,
      data: confirmedData,
      message: "OCR 信息确认成功",
    });
  } catch (error) {
    console.error("OCR confirm error:", error);
    return NextResponse.json(
      { error: "确认处理失败" },
      { status: 500 }
    );
  }
}
