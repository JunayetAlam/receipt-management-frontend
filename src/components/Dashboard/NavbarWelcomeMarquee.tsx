"use client";

import { useEffect, useState } from "react";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { useGetMeQuery } from "@/redux/api/userApi";

interface WelcomeInfo {
  period: "morning" | "afternoon" | "evening" | "night";
  message: string;
}

function getWelcomeInfo(hour: number, name: string): WelcomeInfo {
  // 5:00 AM - 11:59 AM
  if (hour >= 5 && hour < 12) {
    return {
      period: "morning",
      message: `Wishing you a productive morning, ${name}! Ready to streamline today's receipts and sales?`,
    };
  }
  // 12:00 PM - 4:59 PM
  if (hour >= 12 && hour < 17) {
    return {
      period: "afternoon",
      message: `Hope your afternoon is going smoothly, ${name}! Keep up the wonderful momentum today.`,
    };
  }
  // 5:00 PM - 9:59 PM
  if (hour >= 17 && hour < 22) {
    return {
      period: "evening",
      message: `Wishing you a pleasant evening, ${name}! Let's wrap up today's accounts effortlessly.`,
    };
  }
  // 10:00 PM - 4:59 AM
  return {
    period: "night",
    message: `Peaceful night to you, ${name}! Thank you for your continued dedication and commitment.`,
  };
}

export default function NavbarWelcomeMarquee() {
  const { data } = useGetMeQuery(undefined);
  const profile = data?.data;

  const [mounted, setMounted] = useState(false);
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    profile?.firstName ||
    profile?.email?.split("@")[0] ||
    "Partner";

  const { period, message } = getWelcomeInfo(currentHour, displayName);

  const PeriodIcon =
    period === "morning"
      ? Sunrise
      : period === "afternoon"
      ? Sun
      : period === "evening"
      ? Sunset
      : Moon;

  const iconColor =
    period === "morning"
      ? "text-amber-500 dark:text-amber-400"
      : period === "afternoon"
      ? "text-amber-500 dark:text-amber-400"
      : period === "evening"
      ? "text-orange-500 dark:text-orange-400"
      : "text-indigo-400 dark:text-indigo-300";

  if (!mounted) {
    return (
      <div className="flex-1 max-w-xl mx-2 sm:mx-6 h-8 rounded-full bg-muted/20 animate-pulse hidden sm:block" />
    );
  }

  return (
    <div
      className="relative flex-1 min-w-0 max-w-xl lg:max-w-2xl mx-2 sm:mx-6 overflow-hidden rounded-full border border-border/40 bg-muted/20 py-1"
      title={message}
    >
      {/* Left & Right gradient fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-l from-background to-transparent z-10" />

      {/* Marquee Track (Double copy for seamless loop) */}
      <div className="animate-navbar-marquee flex items-center whitespace-nowrap cursor-default select-none">
        {/* First instance */}
        <div className="flex items-center gap-2 px-6">
          <PeriodIcon className={`size-3.5 sm:size-4 shrink-0 ${iconColor}`} />
          <span className="text-xs sm:text-sm font-medium text-foreground/90 tracking-tight">
            {message}
          </span>
        </div>

        {/* Second instance for infinite seamless wrap */}
        <div className="flex items-center gap-2 px-6" aria-hidden="true">
          <PeriodIcon className={`size-3.5 sm:size-4 shrink-0 ${iconColor}`} />
          <span className="text-xs sm:text-sm font-medium text-foreground/90 tracking-tight">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
