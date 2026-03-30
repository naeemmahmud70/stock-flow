"use client";
import { LogOut } from "lucide-react";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/user";
import { usePathname, useRouter } from "next/navigation";
import { getLoggedInUser } from "@/lib/utils";

export const DashboardHeader = () => {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loggedIn = getLoggedInUser();
    if (loggedIn?.email) {
      setUser(loggedIn);
    }
  }, []);

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "Dashboard";
    return (
      lastSegment.charAt(0).toUpperCase() +
      lastSegment.slice(1).replace(/[-_]/g, " ")
    );
  };

  const handleLogout = () => {
    logout;
    localStorage.clear();
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
