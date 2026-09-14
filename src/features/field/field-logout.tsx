"use client";

import { useRouter } from "next/navigation";

export function FieldLogout() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/admin/login");
      }}
      className="w-full rounded-xl border border-slate-700 py-3 text-sm font-semibold text-slate-400 active:bg-slate-800"
    >
      Sign out
    </button>
  );
}
