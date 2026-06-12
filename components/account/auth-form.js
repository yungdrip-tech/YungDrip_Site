"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Button from "@/components/button";
import { useAuth } from "@/components/providers/auth-provider";

export default function AuthForm({ mode = "login" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";
  const nextPath = searchParams.get("next") || "/account";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register(form);
      } else {
        await login({
          email: form.email,
          password: form.password
        });
      }

      router.replace(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  return (
    <div className="shell py-12">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel flex flex-col justify-between p-8 lg:p-10">
          <div>
            <p className="muted-label mb-3">YungDrip Account</p>
            <h1 className="text-5xl font-semibold">{isRegister ? "Create your account" : "Welcome back"}</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-black/60">
              Save your profile, place orders, and track every delivery from one premium account space.
            </p>
          </div>

          <div className="mt-10 space-y-4 text-sm text-black/55">
            <p>Track orders in real time.</p>
            <p>Speed through checkout with saved details.</p>
            <p>Keep your YungDrip journey in one place.</p>
          </div>
        </div>

        <div className="panel p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister ? (
              <>
                <label className="block space-y-2 text-sm text-black/60">
                  <span>Full name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className="w-full rounded-[1.25rem] border border-black/10 px-4 py-3 outline-none transition focus:border-black/30"
                    placeholder="Your name"
                    required
                  />
                </label>
                <label className="block space-y-2 text-sm text-black/60">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    className="w-full rounded-[1.25rem] border border-black/10 px-4 py-3 outline-none transition focus:border-black/30"
                    placeholder="+91 98765 43210"
                    required
                  />
                </label>
              </>
            ) : null}

            <label className="block space-y-2 text-sm text-black/60">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-[1.25rem] border border-black/10 px-4 py-3 outline-none transition focus:border-black/30"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block space-y-2 text-sm text-black/60">
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="w-full rounded-[1.25rem] border border-black/10 px-4 py-3 outline-none transition focus:border-black/30"
                placeholder="Minimum 8 characters"
                required
              />
            </label>

            {error ? (
              <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Please wait" : isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-black/55">
            {isRegister ? "Already have an account?" : "Need an account?"}{" "}
            <Link
              href={`${isRegister ? "/login" : "/register"}?next=${encodeURIComponent(nextPath)}`}
              className="underline underline-offset-4"
            >
              {isRegister ? "Sign in" : "Create one"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
