"use client";
import { Input as FormInput } from "@/components/ui/input";
import { Select as FormSelect } from "@/components/ui/select";
import { Textarea as FormTextarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const inputClass =
  "border-input bg-background focus-visible:ring-ring mt-1 min-h-11 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2";
/** The supplied action must authenticate with the selected identity provider and issue a server-side session. */
export function AdminSignIn({
  onSignIn,
}: {
  onSignIn: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setPending(true);
    try {
      await onSignIn(email.trim(), password);
      setPassword("");
    } catch {
      setError("Sign in failed. Check your credentials and try again.");
      setPassword("");
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md gap-0">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl">Sign in to admin</CardTitle>
          <CardDescription>Manage your portfolio content.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            {error && (
              <p
                role="alert"
                className="rounded-md border border-red-500/50 px-3 py-2 text-sm text-red-500"
              >
                {error}
              </p>
            )}
            <label className="block text-sm font-medium">
              Email
              <FormInput
                type="email"
                autoComplete="username"
                required
                maxLength={320}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <FormInput
                type="password"
                autoComplete="current-password"
                required
                maxLength={1024}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
              />
            </label>
            <Button
              type="submit"
              className="min-h-11 w-full"
              disabled={pending}
            >
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}