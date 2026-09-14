"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BUSINESS } from "@/config/business";

const MIN_MS = 900;
const FADE_MS = 600;
const FAILSAFE_MS = 5000;

export function SplashLoader() {
  const [phase, setPhase] = useState<"show" | "hide" | "gone">("show");

  useEffect(() => {
    let done = false;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const hide = () => {
      if (done) return;
      done = true;
      setPhase("hide");
      fadeTimer = setTimeout(() => setPhase("gone"), FADE_MS);
    };

    const start = performance.now();
    const finish = () => {
      const elapsed = performance.now() - start;
      setTimeout(hide, Math.max(0, MIN_MS - elapsed));
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
    }

    const failSafe = setTimeout(hide, FAILSAFE_MS);

    return () => {
      window.removeEventListener("load", finish);
      clearTimeout(failSafe);
      clearTimeout(fadeTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-white transition-opacity duration-500 ${
        phase === "hide" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={phase === "hide"}
    >
      <span className="loader-pulse">
        <Image
          src="/logo-1.png"
          alt={`${BUSINESS.name} logo`}
          width={160}
          height={150}
          priority
          className="h-auto w-36 object-contain"
        />
      </span>
      <span className="loader-bar" aria-hidden />
      <span className="sr-only">Loading…</span>
    </div>
  );
}