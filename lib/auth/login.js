export async function LoginUser(values) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed!");
  }

  return res.json();
}
