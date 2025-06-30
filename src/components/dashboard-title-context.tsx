"use client"
import React, { createContext, useContext, useState } from "react";

type DashboardTitleContextType = {
  title: string;
  setTitle: (title: string) => void;
};

const DashboardTitleContext = createContext<DashboardTitleContextType | undefined>(undefined);

export function DashboardTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("Documents");
  return (
    <DashboardTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </DashboardTitleContext.Provider>
  );
}

export function useDashboardTitle() {
  const ctx = useContext(DashboardTitleContext);
  if (!ctx) throw new Error("useDashboardTitle must be used within DashboardTitleProvider");
  return ctx;
} 