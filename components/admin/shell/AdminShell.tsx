import { GeistSans } from "geist/font/sans";
import { BottomNav } from "./BottomNav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${GeistSans.className} flex min-h-screen bg-ap-bg text-ap-text`}
    >
      <BottomNav />
      {/* pb-14 = clearance for mobile bottom nav height */}
      <main className="flex flex-1 flex-col overflow-auto pb-14 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
