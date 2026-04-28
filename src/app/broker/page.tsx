import { Suspense } from "react";
import BrokerContent from "./BrokerContent";

export default function BrokerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BrokerContent />
    </Suspense>
  );
}
