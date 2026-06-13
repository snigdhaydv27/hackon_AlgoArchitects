"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { PaymentSettings } from "@/components/PaymentSettings";

export default function PaymentSettingsPage() {
  return (
    <RoleGuard allowed={["seller", "small_seller"]}>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Payment Settings</h1>
        <PaymentSettings />
      </div>
    </RoleGuard>
  );
}
