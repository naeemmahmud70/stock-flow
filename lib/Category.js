export async function addNewCategory(payload) {
  const res = await fetch("/api/dashboard/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Category adding failed!");
  }

  return res.json();
}

export async function getAllCategories() {
  const res = await fetch(`/api/dashboard/categories`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Fetching categories failed!");
  }

  return res.json();
}
