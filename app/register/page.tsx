"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { useAuth } from "@/context/AuthContext";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { register, user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    router.replace(redirectUrl);
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      router.push(redirectUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 460,
        margin: "0 auto",
        background: "#F8F5EF",
        padding: "48px 36px",
        border: "1px solid rgba(6,34,60,0.1)",
        boxShadow: "0 16px 40px rgba(6,34,60,0.06)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 32,
              height: 1,
              background: "#C99A3D",
              opacity: 0.7,
            }}
          />
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#C99A3D",
              fontWeight: 600,
            }}
          >
            JOIN DHAAGA
          </span>
          <div
            style={{
              width: 32,
              height: 1,
              background: "#C99A3D",
              opacity: 0.7,
            }}
          />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)",
            fontSize: "2.4rem",
            color: "#06223C",
            fontWeight: 500,
            lineHeight: 1.1,
            marginBottom: 8,
          }}
        >
          Create Account
        </h1>
        <p style={{ fontSize: 13, color: "#496174" }}>
          Crafted Indian clothing, seamless order tracking, and member exclusives.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(180, 40, 40, 0.08)",
            border: "1px solid rgba(180, 40, 40, 0.25)",
            color: "#900",
            padding: "10px 14px",
            fontSize: 13,
            marginBottom: 20,
            borderRadius: 2,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label
            htmlFor="reg-name"
            style={{
              display: "block",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#06223C",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Full Name
          </label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Aditya Sharma"
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#FFFFFF",
              border: "1px solid rgba(6,34,60,0.2)",
              fontSize: 14,
              color: "#06223C",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="reg-email"
            style={{
              display: "block",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#06223C",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Email Address
          </label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#FFFFFF",
              border: "1px solid rgba(6,34,60,0.2)",
              fontSize: 14,
              color: "#06223C",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="reg-password"
            style={{
              display: "block",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#06223C",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Password (Min. 8 characters)
          </label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#FFFFFF",
              border: "1px solid rgba(6,34,60,0.2)",
              fontSize: 14,
              color: "#06223C",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            marginTop: 8,
            padding: "14px 20px",
            fontSize: 12,
            letterSpacing: "0.2em",
          }}
        >
          {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
        </button>
      </form>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          margin: "24px 0",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "rgba(6,34,60,0.12)" }} />
        <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#496174", textTransform: "uppercase" }}>
          OR
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(6,34,60,0.12)" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <GoogleLoginButton
          onSuccess={() => {
            router.push(redirectUrl);
          }}
        />
      </div>

      <div
        style={{
          marginTop: 32,
          paddingTop: 20,
          borderTop: "1px solid rgba(6,34,60,0.08)",
          textAlign: "center",
          fontSize: 13,
          color: "#496174",
        }}
      >
        Already have an account?{" "}
        <Link
          href={`/login${redirectUrl !== "/account" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          style={{
            color: "#06223C",
            fontWeight: 700,
            textDecoration: "underline",
          }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: "75vh",
          padding: "60px 20px 100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #F8F5EF 0%, #E8DFD1 100%)",
        }}
      >
        <Suspense fallback={<div style={{ textAlign: "center", padding: 40 }}>Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}