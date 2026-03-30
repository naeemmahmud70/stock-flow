import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";



export const metadata = {
  title: "StockFlow",
  description: "e-Commerce",
};

export default function Layout({ children }) {
  return (
    <div className="w-full min-h-screen flex bg-gray-50">
      <div className="bg-white shadow-sm relative p-4">
        <Sidebar />
      </div>

      <div className="w-full ">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}
