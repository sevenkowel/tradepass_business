"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DocumentUpload } from "@/components/kyc/DocumentUpload";
import { OCRResultEditor } from "@/components/kyc/OCRResultEditor";
import { useKYCStore } from "@/lib/kyc/store";
import { devFetch } from "@/lib/kyc/dev-fetch";
import type { OCRResult, DocumentType } from "@/lib/kyc/types";

export default function DocumentPage() {
  const router = useRouter();
  const [showOCRResult, setShowOCRResult] = useState(false);
  const [ocrResult, setOCRResult] = useState<OCRResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    setDocumentType, 
    setDocumentImages, 
    setOCRResult: saveOCRResult,
    setCurrentStep,
    regionCode,
  } = useKYCStore();

  const handleUpload = (frontImage: string, backImage: string | null, type: DocumentType) => {
    setDocumentType(type);
    setDocumentImages(frontImage, backImage || undefined);
  };

  const handleOCR = async (frontImage: string, type: DocumentType) => {
    setIsProcessing(true);
    try {
      const response = await devFetch("/api/kyc/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: type,
          imageBase64: frontImage,
        }),
      });

      if (!response.ok) {
        throw new Error("OCR failed");
      }

      const data = await response.json();
      setOCRResult(data.data);
      setShowOCRResult(true);
    } catch (error) {
      console.error("OCR error:", error);
      // Show error toast
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmOCR = (data: Partial<OCRResult>) => {
    if (ocrResult) {
      const confirmedResult = { ...ocrResult, ...data };
      saveOCRResult(confirmedResult);
      setCurrentStep(2);
      router.push("/portal/kyc/liveness");
    }
  };

  const handleRetry = () => {
    setShowOCRResult(false);
    setOCRResult(null);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--tp-bg-rgb))] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/portal/kyc")}
            className="mb-4 -ml-4 text-[rgba(var(--tp-fg-rgb),0.7)]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[rgba(var(--tp-accent-rgb),0.1)]">
              <Shield className="w-6 h-6 text-[rgb(var(--tp-accent-rgb))]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">
                Identity Verification
              </h1>
              <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">
                Step 1 of 4 • Upload your identification document
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mb-8"
        >
          <div className="h-2 bg-[rgba(var(--tp-fg-rgb),0.1)] rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-[rgb(var(--tp-accent-rgb))] rounded-full" />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">
            <span className="text-[rgb(var(--tp-accent-rgb))] font-medium">Document</span>
            <span>Liveness</span>
            <span>Personal Info</span>
            <span>Agreement</span>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Please upload a clear photo of your government-issued ID. Make sure all details are visible and the document is not expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showOCRResult && ocrResult ? (
                <OCRResultEditor
                  result={ocrResult}
                  onConfirm={handleConfirmOCR}
                  onRetry={handleRetry}
                  isProcessing={isProcessing}
                />
              ) : (
                <DocumentUpload
                  onUpload={handleUpload}
                  onOCR={handleOCR}
                  isProcessing={isProcessing}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-[rgba(var(--tp-fg-rgb),0.4)] mt-6"
        >
          Your information is encrypted and securely stored. We comply with GDPR and international data protection standards.
        </motion.p>
      </div>
    </div>
  );
}
