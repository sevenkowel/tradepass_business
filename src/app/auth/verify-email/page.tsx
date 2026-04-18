"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("正在验证邮箱...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("验证链接无效，缺少 token 参数。");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage("邮箱验证成功！您的账号已激活，即将跳转到登录页面...");
          setTimeout(() => router.push("/auth/login"), 2500);
        } else {
          setStatus("error");
          setMessage(data.error || "验证失败，链接可能已过期或无效。");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("网络错误，请稍后重试。");
      });
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 max-w-md w-full text-center space-y-6"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-14 h-14 text-blue-600 animate-spin mx-auto" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">邮箱验证中</h1>
              <p className="text-slate-500">{message}</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">验证成功</h1>
              <p className="text-slate-500">{message}</p>
            </div>
            <Button
              onClick={() => router.push("/auth/login")}
              className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white rounded-xl h-11 px-6"
            >
              前往登录
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">验证失败</h1>
              <p className="text-slate-500">{message}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/auth/register")}
                className="rounded-xl h-11 px-6"
              >
                重新注册
              </Button>
              <Button
                onClick={() => router.push("/auth/login")}
                className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white rounded-xl h-11 px-6"
              >
                前往登录
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
