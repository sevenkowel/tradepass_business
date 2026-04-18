"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  status: string;
  kycStatus: string | null;
}

export function useUser({ redirectTo = "/auth/login" }: { redirectTo?: string } = {}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setUser(data.user);
      })
      .catch(() => {
        router.push(redirectTo);
      })
      .finally(() => setLoading(false));
  }, [router, redirectTo]);

  return { user, loading };
}
