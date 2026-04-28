import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function PortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
