"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    clinicName: "",
    subdomain: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: [] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (data.errors) {
      setFieldErrors(data.errors);
    }

    if (!res.ok) {
      setError(data.message || "Registration failed");
      return;
    }

    router.push("/login?registered=true");
  }

  function fieldError(field: string) {
    return fieldErrors[field]?.length ? fieldErrors[field][0] : null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Register your clinic</CardTitle>
        <CardDescription>Create your clinic account and admin user</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic name</Label>
            <Input
              id="clinicName"
              value={form.clinicName}
              onChange={(e) => updateField("clinicName", e.target.value)}
              className={fieldError("clinicName") ? "border-destructive" : ""}
              required
            />
            {fieldError("clinicName") && (
              <p className="text-xs text-destructive">{fieldError("clinicName")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <Input
              id="subdomain"
              value={form.subdomain}
              onChange={(e) =>
                updateField("subdomain", e.target.value.toLowerCase())
              }
              placeholder="my-clinic"
              className={fieldError("subdomain") ? "border-destructive" : ""}
              required
            />
            {fieldError("subdomain") && (
              <p className="text-xs text-destructive">{fieldError("subdomain")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={fieldError("name") ? "border-destructive" : ""}
              required
            />
            {fieldError("name") && (
              <p className="text-xs text-destructive">{fieldError("name")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={fieldError("email") ? "border-destructive" : ""}
              required
            />
            {fieldError("email") && (
              <p className="text-xs text-destructive">{fieldError("email")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className={fieldError("password") ? "border-destructive" : ""}
              required
            />
            {fieldError("password") && (
              <p className="text-xs text-destructive">{fieldError("password")}</p>
            )}
            {!fieldError("password") && (
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and a number
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating clinic..." : "Create clinic"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
