// pages/login.tsx
import Head from 'next/head';
import Link from 'next/link';
import { useState, FormEvent } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (resp.ok) {
      // login succeeded, redirect somewhere
      router.push("/dashboard");
    } else {
      const data = await resp.json();
      setError(data.error || "Login failed");
    }
  }

  return (
    <>
      <Head>
        <title>Shadow Miracle Records — Login</title>
      </Head>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md bg-white p-8 shadow-md rounded">
            <h2 className="text-2xl font-semibold mb-6">Shadow Miracle Records</h2>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
        <footer className="py-4 text-center text-sm text-gray-400 space-x-4">
          <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:underline">Terms of Service</Link>
        </footer>
      </div>
    </>
  );
}
