import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/admin/login-form";

export const metadata: Metadata = {
  title: "Team Sign In",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
        <div className="text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden>
              <path d="M12 2.25c.414 0 .75.336.75.75v1.786a6.75 6.75 0 0 1 6 6.714c0 4.556-3.36 8.32-7.728 8.946l-.272 1.09a.75.75 0 0 1-1.456-.364l.23-.922A6.75 6.75 0 0 1 3 11.5a6.75 6.75 0 0 1 8.25-6.714V3a.75.75 0 0 1 .75-.75Zm-.75 4.05A5.25 5.25 0 0 0 4.5 11.5a5.25 5.25 0 0 0 4.71 5.224l1.29-5.162a.75.75 0 0 1 1.456.364l-1.207 4.83A5.25 5.25 0 0 0 17.25 11.5a5.25 5.25 0 0 0-6-5.2Z" />
            </svg>
          </span>
          <h1 className="mt-3 text-lg font-bold text-slate-900">Peepal Flow Fix Team</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to the operations dashboard</p>
        </div>
        <div className="mt-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
