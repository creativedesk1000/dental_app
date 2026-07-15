"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    fetch(`/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.message || "Verification failed");
          return;
        }
        setStatus("success");
        setMessage(data.data?.message || "Email verified successfully");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed");
      });
  }, [email, token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Email verification</CardTitle>
        <CardDescription>
          {status === "loading" && "Verifying your email..."}
          {status === "success" && "Your email has been verified"}
          {status === "error" && "Verification failed"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{message}</p>
        {status !== "loading" && (
          <Button render={<Link href="/login" />} className="w-full">
            Go to sign in
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Card><CardContent className="py-8 text-center text-muted-foreground">Verifying your email...</CardContent></Card>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
