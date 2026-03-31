"use client";
import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/user";

import { getLoggedInUser } from "@/lib/utils";
import { addNewCategory, getAllCategories } from "@/lib/Category";

const Categories = () => {
  const { setUser, setLoading, setError, isLoading, error } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
  });
  const [activityLog, setActivityLog] = useState([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const loggedIn = getLoggedInUser();
    if (loggedIn?.email) {
      setUser(loggedIn);
    }
  }, []);

  //   const addLog = (action) => {
  //     const now = new Date();
  //     const newLog = {
  //       id: now.getTime(),
  //       action,
  //       timestamp: now.toLocaleTimeString(),
  //     };
  //     setActivityLog([newLog, ...activityLog.slice(0, 9)]);
  //   };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      setError("Please fill the category name!");
      return;
    }
    if (newCategory.name.length < 4) {
      setError("Category name must be at least 4 characters long!");
      return;
    }

    try {
      const category = await addNewCategory(newCategory);
      console.log("category", category);
      if (category?.message) {
        setAdded((added) => !added);
      }
    } catch (error) {
      console.log("err", error);
    }
    // addLog(`Added category: ${newCategory.name}`);
    setNewCategory({ name: "" });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        setLoading(true);
        const response = await getAllCategories();
        if (response?.data?.length) {
          setCategories(response.data);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [added]);

  //   const toggleLeave = (id) => {
  //     setStaff(
  //       staff.map((s) => (s.id === id ? { ...s, onLeave: !s.onLeave } : s)),
  //     );
  //     const staffMember = staff.find((s) => s.id === id);
  //     addLog(`${staffMember.name} availability changed`);
  //   };

  return (
    <section className="p-6">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Add New Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              placeholder="Name"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 outline-none"
            />

            <Button
              disabled={isLoading ? true : false}
              onClick={handleAddCategory}
              className=" text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Plus size={18} /> {isLoading ? "Adding..." : "Add Category"}
            </Button>
          </div>
          <p className="text-xs text-red-500 mt-2 px-1">{error && error}</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Available categories Name
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((s) => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{s.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No categories added yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
