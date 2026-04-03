"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OCRResult } from "@/lib/kyc/types";

interface OCRResultEditorProps {
  result: OCRResult;
  onConfirm: (data: Partial<OCRResult>) => void;
  onRetry: () => void;
  isProcessing?: boolean;
}

export function OCRResultEditor({ result, onConfirm, onRetry, isProcessing }: OCRResultEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<OCRResult>>({
    fullName: result.fullName,
    idNumber: result.idNumber,
    dateOfBirth: result.dateOfBirth,
    nationality: result.nationality,
    expiryDate: result.expiryDate,
    address: result.address,
  });

  const handleSave = () => {
    onConfirm(editedData);
    setIsEditing(false);
  };

  const confidenceColor = result.confidence >= 0.9 ? "text-green-500" : 
                         result.confidence >= 0.8 ? "text-yellow-500" : "text-red-500";

  const confidenceBg = result.confidence >= 0.9 ? "bg-green-500/10" : 
                      result.confidence >= 0.8 ? "bg-yellow-500/10" : "bg-red-500/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Confidence Banner */}
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-xl",
        confidenceBg
      )}>
        {result.confidence >= 0.8 ? (
          <CheckCircle2 className={cn("w-5 h-5", confidenceColor)} />
        ) : (
          <AlertCircle className={cn("w-5 h-5", confidenceColor)} />
        )}
        <div className="flex-1">
          <p className={cn("text-sm font-medium", confidenceColor)}>
            OCR Confidence: {Math.round(result.confidence * 100)}%
          </p>
          <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)]">
            {result.confidence >= 0.9 
              ? "High confidence - Information looks accurate" 
              : result.confidence >= 0.8 
                ? "Medium confidence - Please verify the information" 
                : "Low confidence - Please review and correct the information"}
          </p>
        </div>
      </div>

      {/* Extracted Data */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[rgb(var(--tp-fg-rgb))]">
              Extracted Information
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isProcessing}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={editedData.fullName || ""}
                  onChange={(e) => setEditedData({ ...editedData, fullName: e.target.value })}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
              ) : (
                <p className="text-sm text-[rgb(var(--tp-fg-rgb))] p-2 bg-[rgba(var(--tp-fg-rgb),0.05)] rounded-lg">
                  {result.fullName || "-"}
                </p>
              )}
            </div>

            {/* ID Number */}
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              {isEditing ? (
                <Input
                  id="idNumber"
                  value={editedData.idNumber || ""}
                  onChange={(e) => setEditedData({ ...editedData, idNumber: e.target.value })}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
              ) : (
                <p className="text-sm text-[rgb(var(--tp-fg-rgb))] p-2 bg-[rgba(var(--tp-fg-rgb),0.05)] rounded-lg">
                  {result.idNumber || "-"}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              {isEditing ? (
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={editedData.dateOfBirth || ""}
                  onChange={(e) => setEditedData({ ...editedData, dateOfBirth: e.target.value })}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
              ) : (
                <p className="text-sm text-[rgb(var(--tp-fg-rgb))] p-2 bg-[rgba(var(--tp-fg-rgb),0.05)] rounded-lg">
                  {result.dateOfBirth || "-"}
                </p>
              )}
            </div>

            {/* Nationality */}
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              {isEditing ? (
                <Input
                  id="nationality"
                  value={editedData.nationality || ""}
                  onChange={(e) => setEditedData({ ...editedData, nationality: e.target.value })}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
              ) : (
                <p className="text-sm text-[rgb(var(--tp-fg-rgb))] p-2 bg-[rgba(var(--tp-fg-rgb),0.05)] rounded-lg">
                  {result.nationality || "-"}
                </p>
              )}
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              {isEditing ? (
                <Input
                  id="expiryDate"
                  type="date"
                  value={editedData.expiryDate || ""}
                  onChange={(e) => setEditedData({ ...editedData, expiryDate: e.target.value })}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
              ) : (
                <p className="text-sm text-[rgb(var(--tp-fg-rgb))] p-2 bg-[rgba(var(--tp-fg-rgb),0.05)] rounded-lg">
                  {result.expiryDate || "-"}
                </p>
              )}
            </div>

            {/* Address */}
            {result.address && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={editedData.address || ""}
                    onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                    className="bg-[rgb(var(--tp-surface-rgb))]"
                  />
                ) : (
                  <p className="text-sm text-[rgb(var(--tp-fg-rgb))] p-2 bg-[rgba(var(--tp-fg-rgb),0.05)] rounded-lg">
                    {result.address || "-"}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onRetry}
          disabled={isProcessing}
          className="flex-1 h-12"
        >
          Retake Photo
        </Button>
        <Button
          onClick={isEditing ? handleSave : () => onConfirm(editedData)}
          disabled={isProcessing}
          className="flex-1 h-12 bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Confirm & Continue"
          )}
        </Button>
      </div>
    </motion.div>
  );
}
