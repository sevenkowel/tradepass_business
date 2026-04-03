"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Smartphone, Mail, Lock, Unlock, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import type { PersonalInfo } from "@/lib/kyc/types";
import type { ContactVerificationConfig } from "@/lib/config/types";
import { useDevConfig } from "@/lib/dev-config";

interface ContactVerificationFormProps {
  config: ContactVerificationConfig;
  preVerifiedPhone?: string;
  preVerifiedEmail?: string;
}

interface VerificationState {
  phone: {
    sent: boolean;
    verified: boolean;
    code: string;
    loading: boolean;
    error: string | null;
    countdown: number;
  };
  email: {
    sent: boolean;
    verified: boolean;
    code: string;
    loading: boolean;
    error: string | null;
    countdown: number;
  };
}

export function ContactVerificationForm({
  config,
  preVerifiedPhone,
  preVerifiedEmail,
}: ContactVerificationFormProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext<PersonalInfo>();
  const { skipOtpVerification } = useDevConfig();
  
  const phone = watch("phone");
  const email = watch("email");

  const [state, setState] = useState<VerificationState>({
    phone: { sent: false, verified: false, code: "", loading: false, error: null, countdown: 0 },
    email: { sent: false, verified: false, code: "", loading: false, error: null, countdown: 0 },
  });

  // 如果配置了跳过已验证，且提供了预验证值，自动填充
  useEffect(() => {
    if (config.skipIfPreVerified && preVerifiedPhone) {
      setValue("phone", preVerifiedPhone);
      setState(prev => ({
        ...prev,
        phone: { ...prev.phone, verified: true },
      }));
    }
    if (config.skipIfPreVerified && preVerifiedEmail) {
      setValue("email", preVerifiedEmail);
      setState(prev => ({
        ...prev,
        email: { ...prev.email, verified: true },
      }));
    }
  }, [config.skipIfPreVerified, preVerifiedPhone, preVerifiedEmail, setValue]);

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        phone: { ...prev.phone, countdown: Math.max(0, prev.phone.countdown - 1) },
        email: { ...prev.email, countdown: Math.max(0, prev.email.countdown - 1) },
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sendCode = async (type: "phone" | "email") => {
    const value = type === "phone" ? phone : email;
    if (!value) return;

    setState(prev => ({
      ...prev,
      [type]: { ...prev[type], loading: true, error: null },
    }));

    try {
      // 模拟发送验证码 API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 开发工具：如果启用了跳过 OTP，直接标记为已发送
      if (skipOtpVerification) {
        console.log(`[Dev] Mock OTP sent to ${type}: ${value}`);
      }

      setState(prev => ({
        ...prev,
        [type]: { ...prev[type], sent: true, loading: false, countdown: 60 },
      }));
    } catch {
      setState(prev => ({
        ...prev,
        [type]: { ...prev[type], loading: false, error: "Failed to send code" },
      }));
    }
  };

  const verifyCode = async (type: "phone" | "email") => {
    setState(prev => ({
      ...prev,
      [type]: { ...prev[type], loading: true, error: null },
    }));

    try {
      // 开发工具：如果启用了跳过 OTP，任意验证码都通过
      if (skipOtpVerification) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setState(prev => ({
          ...prev,
          [type]: { ...prev[type], verified: true, loading: false },
        }));
        return;
      }

      // 模拟验证 API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 实际验证逻辑（模拟成功）
      if (state[type].code.length === 6) {
        setState(prev => ({
          ...prev,
          [type]: { ...prev[type], verified: true, loading: false },
        }));
      } else {
        throw new Error("Invalid code");
      }
    } catch {
      setState(prev => ({
        ...prev,
        [type]: { ...prev[type], loading: false, error: "Invalid verification code" },
      }));
    }
  };

  const isPhoneLocked = config.lockIfPreVerified && !!preVerifiedPhone;
  const isEmailLocked = config.lockIfPreVerified && !!preVerifiedEmail;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[rgb(var(--tp-fg-rgb))]">Contact Verification</h3>
      
      {/* Phone Verification */}
      {config.phoneOtpRequired && (
        <div className="space-y-3 p-4 rounded-lg bg-[rgba(var(--tp-fg-rgb),0.03)] border border-[rgba(var(--tp-fg-rgb),0.08)]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[rgb(var(--tp-accent-rgb))]" />
            <Label className="font-medium">Phone Number</Label>
            {state.phone.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          </div>
          
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder="+84 123 456 789"
              {...register("phone")}
              disabled={isPhoneLocked || state.phone.verified}
              className="flex-1 bg-[rgb(var(--tp-surface-rgb))]"
            />
            {!state.phone.verified && !isPhoneLocked && (
              <Button
                type="button"
                variant="outline"
                onClick={() => sendCode("phone")}
                disabled={!phone || state.phone.loading || state.phone.countdown > 0}
              >
                {state.phone.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : state.phone.countdown > 0 ? (
                  `${state.phone.countdown}s`
                ) : state.phone.sent ? (
                  "Resend"
                ) : (
                  "Send Code"
                )}
              </Button>
            )}
          </div>
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          
          {state.phone.sent && !state.phone.verified && !isPhoneLocked && (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={state.phone.code}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  phone: { ...prev.phone, code: e.target.value },
                }))}
                className="flex-1 bg-[rgb(var(--tp-surface-rgb))]"
              />
              <Button
                type="button"
                onClick={() => verifyCode("phone")}
                disabled={state.phone.code.length !== 6 || state.phone.loading}
              >
                {state.phone.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </Button>
            </div>
          )}
          
          {state.phone.error && <p className="text-xs text-red-500">{state.phone.error}</p>}
          
          {isPhoneLocked && (
            <div className="flex items-center gap-2 text-xs text-[rgba(var(--tp-fg-rgb),0.6)]">
              <Lock className="w-3 h-3" />
              <span>Pre-verified phone cannot be modified</span>
            </div>
          )}
          
          {state.phone.verified && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <Unlock className="w-3 h-3" />
              <span>Phone verified successfully</span>
            </div>
          )}
        </div>
      )}

      {/* Email Verification */}
      {config.emailOtpRequired && (
        <div className="space-y-3 p-4 rounded-lg bg-[rgba(var(--tp-fg-rgb),0.03)] border border-[rgba(var(--tp-fg-rgb),0.08)]">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[rgb(var(--tp-accent-rgb))]" />
            <Label className="font-medium">Email Address</Label>
            {state.email.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          </div>
          
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="user@example.com"
              {...register("email")}
              disabled={isEmailLocked || state.email.verified}
              className="flex-1 bg-[rgb(var(--tp-surface-rgb))]"
            />
            {!state.email.verified && !isEmailLocked && (
              <Button
                type="button"
                variant="outline"
                onClick={() => sendCode("email")}
                disabled={!email || state.email.loading || state.email.countdown > 0}
              >
                {state.email.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : state.email.countdown > 0 ? (
                  `${state.email.countdown}s`
                ) : state.email.sent ? (
                  "Resend"
                ) : (
                  "Send Code"
                )}
              </Button>
            )}
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          
          {state.email.sent && !state.email.verified && !isEmailLocked && (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={state.email.code}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  email: { ...prev.email, code: e.target.value },
                }))}
                className="flex-1 bg-[rgb(var(--tp-surface-rgb))]"
              />
              <Button
                type="button"
                onClick={() => verifyCode("email")}
                disabled={state.email.code.length !== 6 || state.email.loading}
              >
                {state.email.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </Button>
            </div>
          )}
          
          {state.email.error && <p className="text-xs text-red-500">{state.email.error}</p>}
          
          {isEmailLocked && (
            <div className="flex items-center gap-2 text-xs text-[rgba(var(--tp-fg-rgb),0.6)]">
              <Lock className="w-3 h-3" />
              <span>Pre-verified email cannot be modified</span>
            </div>
          )}
          
          {state.email.verified && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <Unlock className="w-3 h-3" />
              <span>Email verified successfully</span>
            </div>
          )}
        </div>
      )}

      {/* Dev Mode Notice */}
      {skipOtpVerification && (
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
          <strong>Dev Mode:</strong> OTP verification is bypassed. Any code will be accepted.
        </div>
      )}
    </div>
  );
}
