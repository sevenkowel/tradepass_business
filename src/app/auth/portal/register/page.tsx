import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

export default function PortalRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
