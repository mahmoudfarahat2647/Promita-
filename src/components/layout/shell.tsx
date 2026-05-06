"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((v) => !v);
  const close = () => setIsOpen(false);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", isOpen);
    return () => document.body.classList.remove("sidebar-open");
  }, [isOpen]);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      <div className="min-h-screen bg-background">
        {/* Mobile backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={close}
            aria-hidden="true"
          />
        )}
        <Sidebar />
        <div className="lg:ml-[220px] flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
