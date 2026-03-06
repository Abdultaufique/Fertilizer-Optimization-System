"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("farm_user");
      if (!user) {
        router.push("/auth");
      }
    }
  }, [router]);

  const getUser = () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("farm_user");
    return user ? JSON.parse(user) : null;
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("farm_user");
    }
    router.push("/auth");
  };

  return { getUser, logout };
}