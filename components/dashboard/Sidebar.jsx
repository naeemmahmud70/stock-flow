"use client";
import React from "react";
import { Home, Calendar, Users, HelpingHand } from "lucide-react";
import { redirect } from "next/navigation";

const Sidebar = () => {
  return (
    <div className="flex flex-col gap-1 mt-4">
      {[
        { id: "dashboard", label: "Dashboard", icon: Home, link: "/dashboard" },
        {
          id: "categories",
          label: "Categories",
          icon: Users,
          link: "/dashboard/categories",
        },
        {
          id: "products",
          label: "Products",
          icon: HelpingHand,
          link: "/dashboard/products",
        },
        {
          id: "orders",
          label: "Orders",
          icon: Calendar,
          link: "/dashboard/orders",
        },
        {
          id: "restock",
          label: "Restock",
          icon: Calendar,
          link: "/dashboard/restock",
        },
      ].map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={`px-4 py-3 font-medium flex items-center gap-2 transition`}
            onClick={() => redirect(tab.link)}
          >
            <Icon size={20} /> {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;
