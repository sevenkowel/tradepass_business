"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileImage, 
  X, 
  CheckCircle2, 
  Loader2,
  CreditCard,
  BookOpen,
  Car
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/lib/kyc/types";

interface DocumentUploadProps {
  onUpload: (frontImage: string, backImage: string | null, type: DocumentType) => void;
  onOCR: (frontImage: string, type: DocumentType) => Promise<void>;
  isProcessing?: boolean;
}

const documentTypes: { type: DocumentType; label: string; icon: typeof CreditCard }[] = [
  { type: "id_card", label: "ID Card", icon: CreditCard },
  { type: "passport", label: "Passport", icon: BookOpen },
  { type: "driving_license", label: "Driving License", icon: Car },
];

export function DocumentUpload({ onUpload, onOCR, isProcessing }: DocumentUploadProps) {
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const onDropFront = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setFrontPreview(result);
        // Extract base64 without prefix
        const base64 = result.split(",")[1];
        setFrontImage(base64);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const onDropBack = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBackPreview(result);
        const base64 = result.split(",")[1];
        setBackImage(base64);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const frontDropzone = useDropzone({
    onDrop: onDropFront,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const backDropzone = useDropzone({
    onDrop: onDropBack,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    maxFiles: 1,
    disabled: isProcessing || selectedType === "passport",
  });

  const handleContinue = async () => {
    if (frontImage && selectedType) {
      onUpload(frontImage, backImage, selectedType);
      await onOCR(frontImage, selectedType);
    }
  };

  const clearFront = () => {
    setFrontImage(null);
    setFrontPreview(null);
  };

  const clearBack = () => {
    setBackImage(null);
    setBackPreview(null);
  };

  const isComplete = frontImage && (selectedType === "passport" || backImage);

  return (
    <div className="space-y-6">
      {/* Document Type Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[rgb(var(--tp-fg-rgb))]">
          Select Document Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {documentTypes.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              disabled={isProcessing}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                selectedType === type
                  ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.1)]"
                  : "border-[rgba(var(--tp-fg-rgb),0.1)] hover:border-[rgba(var(--tp-fg-rgb),0.3)]"
              )}
            >
              <Icon className={cn(
                "w-6 h-6",
                selectedType === type ? "text-[rgb(var(--tp-accent-rgb))]" : "text-[rgba(var(--tp-fg-rgb),0.5)]"
              )} />
              <span className={cn(
                "text-xs font-medium",
                selectedType === type ? "text-[rgb(var(--tp-accent-rgb))]" : "text-[rgba(var(--tp-fg-rgb),0.7)]"
              )}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Areas */}
      <AnimatePresence mode="wait">
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Front Side */}
            <Card className={cn(
              "border-2 border-dashed transition-colors",
              frontDropzone.isDragActive ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.05)]" : "border-[rgba(var(--tp-fg-rgb),0.2)]"
            )}>
              <CardContent className="p-0">
                {frontPreview ? (
                  <div className="relative">
                    <img
                      src={frontPreview}
                      alt="Front side"
                      className="w-full h-48 object-contain rounded-lg"
                    />
                    <button
                      onClick={clearFront}
                      disabled={isProcessing}
                      className="absolute top-2 right-2 p-1 rounded-full bg-[rgba(0,0,0,0.5)] text-white hover:bg-[rgba(0,0,0,0.7)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(34,197,94,0.9)] text-white text-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      Front side uploaded
                    </div>
                  </div>
                ) : (
                  <div
                    {...frontDropzone.getRootProps()}
                    className="p-8 cursor-pointer"
                  >
                    <input {...frontDropzone.getInputProps()} />
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="p-3 rounded-full bg-[rgba(var(--tp-accent-rgb),0.1)]">
                        <Upload className="w-6 h-6 text-[rgb(var(--tp-accent-rgb))]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--tp-fg-rgb))]">
                          Upload front side
                        </p>
                        <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] mt-1">
                          Drag & drop or click to select
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Back Side (not required for passport) */}
            {selectedType !== "passport" && (
              <Card className={cn(
                "border-2 border-dashed transition-colors",
                backDropzone.isDragActive ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.05)]" : "border-[rgba(var(--tp-fg-rgb),0.2)]"
              )}>
                <CardContent className="p-0">
                  {backPreview ? (
                    <div className="relative">
                      <img
                        src={backPreview}
                        alt="Back side"
                        className="w-full h-48 object-contain rounded-lg"
                      />
                      <button
                        onClick={clearBack}
                        disabled={isProcessing}
                        className="absolute top-2 right-2 p-1 rounded-full bg-[rgba(0,0,0,0.5)] text-white hover:bg-[rgba(0,0,0,0.7)] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(34,197,94,0.9)] text-white text-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        Back side uploaded
                      </div>
                    </div>
                  ) : (
                    <div
                      {...backDropzone.getRootProps()}
                      className="p-8 cursor-pointer"
                    >
                      <input {...backDropzone.getInputProps()} />
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="p-3 rounded-full bg-[rgba(var(--tp-accent-rgb),0.1)]">
                          <FileImage className="w-6 h-6 text-[rgb(var(--tp-accent-rgb))]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--tp-fg-rgb))]">
                            Upload back side
                          </p>
                          <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] mt-1">
                            Drag & drop or click to select
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        disabled={!isComplete || isProcessing}
        className="w-full h-12 bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white font-medium"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );
}
