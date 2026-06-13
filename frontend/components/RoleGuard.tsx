"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ShieldX } from "lucide-react";

interface RoleGuardProps {
  allowed: string[];
  children: React.ReactNode;
}

export function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated at all
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="p-8 text-slate-500">Loading...</div>;
  }

  // Not logged in — redirecting
  if (!user) {
    return <div className="p-8 text-slate-500">Redirecting to login...</div>;
  }

  // Logged in but wrong role — show restricted page
  if (!allowed.includes(user.role)) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
          <ShieldX className="size-8 text-rose-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
        <p className="text-slate-600 mt-2">
          You don&apos;t have permission to view this page. This page is not available for your role.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
        >
          Go back
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
