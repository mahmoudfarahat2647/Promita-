"use client";
import { useEffect } from "react";
import { initPosthog } from "@/lib/posthog";

export function Analytics() {
  useEffect(() => {
    initPosthog();
  }, []);
  return null;
}
