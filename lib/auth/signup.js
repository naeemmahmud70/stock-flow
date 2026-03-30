export async function signUpUser(values) {
  console.log("data", values);
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "User creation failed!");
  }

  return res.json();
}
