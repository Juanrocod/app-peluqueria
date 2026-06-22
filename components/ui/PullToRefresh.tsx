"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 80;

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollable = (e.target as HTMLElement).closest("[data-scroll]");
    const scrollTop = scrollable ? scrollable.scrollTop : 0;
    if (scrollTop <= 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current) return;
    const delta = Math.max(0, e.touches[0].clientY - startY.current);
    setPullY(Math.min(delta * 0.5, 120));
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullY >= THRESHOLD) {
      setRefreshing(true);
      setPullY(50);
      router.refresh();
      setTimeout(() => {
        setRefreshing(false);
        setPullY(0);
      }, 1000);
    } else {
      setPullY(0);
    }
  }, [pullY, router]);

  const triggered = pullY >= THRESHOLD;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="flex flex-1 flex-col"
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: pullY > 0 ? pullY : 0 }}
      >
        <RefreshCw
          size={20}
          className={`text-ap-muted transition-transform duration-200 ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: `rotate(${pullY * 2}deg)`, opacity: Math.min(pullY / THRESHOLD, 1) }}
          color={triggered || refreshing ? "#2F6BFF" : "#6F6F73"}
        />
      </div>
      {children}
    </div>
  );
}
