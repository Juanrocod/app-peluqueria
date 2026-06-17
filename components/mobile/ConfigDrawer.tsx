"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { ConfigMenu } from "./config/ConfigMenu";
import { PerfilSection } from "./config/PerfilSection";
import { ServiciosSection } from "./config/ServiciosSection";

export function ConfigDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [screen, setScreen] = useState<string>("menu");

  function handleClose() {
    onClose();
    setScreen("menu");
  }

  function handleSelect(key: string) {
    if (key === "productos") {
      handleClose();
      // Navigate via Link — handled below as fallback
      window.location.href = "/admin/catalogo";
      return;
    }
    if (key === "horarios") {
      handleClose();
      window.location.href = "/admin/horarios";
      return;
    }
    setScreen(key);
  }

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-200 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`fixed inset-y-0 left-0 z-[70] flex w-[280px] flex-col bg-ap-bg transition-transform duration-200 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {screen === "menu" && (
          <>
            <div className="flex items-end justify-end border-b border-[#1A1A1C] px-4 py-2">
              <button onClick={handleClose} className="flex rounded p-1 text-ap-muted">
                <X size={18} />
              </button>
            </div>
            <ConfigMenu businessName="BarberFras" onSelect={handleSelect} />
          </>
        )}

        {screen === "config" && (
          <PerfilSection onBack={() => setScreen("menu")} />
        )}

        {screen === "servicios" && (
          <ServiciosSection onBack={() => setScreen("menu")} />
        )}
      </div>
    </>
  );
}
