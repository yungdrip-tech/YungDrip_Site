"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/button";
import { requestPasswordReset } from "@/lib/api-client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const payload = await requestPasswordReset({ email });
      setMessage(payload.message || "If an account exists for that email, a reset link has been sent.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="shell py-12">
      <div className="mx-auto max-w-lg">
        <div className="panel p-8 lg:p-10">
          <p className="muted-label mb-3">Account recovery</p>
          <h1 className="text-4xl font-semibold">Forgot your password?</h1>
          <p className="mt-4 text-sm leading-7 text-black/60">
            Enter your email and we will send a reset link if an account exists.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2 text-sm text-black/60">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-[1.25rem] border border-black/10 px-4 py-3 outline-none transition focus:border-black/30"
                placeholder="you@example.com"
                required
              />
            </label>

            {error ? (
              <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            ) : null}

            {message ? (
              <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-black/55">
            Remembered it?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
