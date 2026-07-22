"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_CAREPATH_API_URL ??
  "http://localhost:3000/api";

const roleRedirect: Record<string, string> = {
  PATIENT: "/patient/dashboard",
  DRIVER: "/driver/dashboard",
  COORDINATOR: "/coordinator/pooling",
  ADMIN: "/admin/credits",
  PARTNER: "/admin/credits",
  ADVOCATE: "/coordinator/pooling",
};

export default function LoginPage() {
  const router = useRouter();

  const [apiBase] = useState(DEFAULT_API_BASE);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));

        throw new Error(
          body?.message ?? `Login failed (${response.status}).`,
        );
      }

      const { token, user } = await response.json();
      const role: string = user?.role ?? "PATIENT";

      window.localStorage.setItem(
        `carepath.${role.toLowerCase()}.token`,
        token,
      );

      router.push(roleRedirect[role] ?? "/");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e5dbea] via-[#ede9f7] to-[#d2b9d8] p-6">
      <section
        className="w-full rounded-[20px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(69,4,102,0.14)]"
        style={{
          maxWidth: "760px",
          padding: "48px 52px",
        }}
      >
        {/* Logo */}
        <div className="mb-5 flex items-center justify-center gap-3">
          <Image
            src="/carepath-logo.png"
            alt="CarePath"
            width={48}
            height={48}
            className="rounded-[10px] object-contain"
          />

          <span className="text-lg font-extrabold uppercase tracking-[0.12em] text-[#1b9c86]">
            CarePath
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-slate-900">
            Welcome back
          </h1>

          <p className="text-[15px] leading-relaxed text-[#a589b1]">
            Sign in to manage rides and transportation services.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            style={{
              width: "100%",
              maxWidth: "620px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-5"
          style={{
            width: "100%",
            maxWidth: "620px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="min-h-12 w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-[#ae5a8b] focus:ring-2 focus:ring-[#ae5a8b]/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="min-h-12 w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-[#ae5a8b] focus:ring-2 focus:ring-[#ae5a8b]/20"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mb-2 mt-2 min-h-[50px] w-full rounded-[11px] bg-[#ae5a8b] px-5 py-3 text-[15px] font-extrabold text-white shadow-[0_4px_12px_rgba(174,90,139,0.28)] transition hover:bg-[#9d4f7d] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Links */}
        <div
         
  className="flex flex-col items-center gap-4 text-center"
  style={{
    marginTop: "32px",
    width: "100%",
    maxWidth: "620px",
    marginLeft: "auto",
    marginRight: "auto",
  }}
>
        
          <p className="text-sm text-slate-500">
            Need an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#0c6bc2] hover:underline"
            >
              Register here
            </Link>
          </p>

          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
          >
            Return to the CarePath home page
          </Link>

          <p className="pt-2 text-xs leading-relaxed text-slate-400">
            You will be redirected to the correct dashboard after login.
          </p>
        </div>
      </section>
    </main>
  );
}