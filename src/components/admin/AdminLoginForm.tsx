"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/branding/BrandMark";
import { requestJson } from "@/lib/client-api";

export function AdminLoginForm({
  brandName,
  logoUrl,
}: {
  brandName: string;
  logoUrl?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await requestJson(
        "/api/admin/session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
        "Email hoặc mật khẩu không đúng.",
      );
      router.push("/admin");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể kết nối. Vui lòng thử lại.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="adminAuth">
      <form className="adminAuthCard" onSubmit={submit}>
        <div className="adminAuthBrand">
          <BrandMark logoUrl={logoUrl} size={42} />
          <span>{brandName}</span>
        </div>
        <h1>Đăng nhập quản trị</h1>
        <p className="muted">Quản lý tin đăng và khách hàng tư vấn.</p>
        <label>
          Email
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            placeholder="Email quản trị"
            aria-invalid={Boolean(error)}
            autoFocus
            required
          />
        </label>
        <label className="passwordLabel">
          <span>Mật khẩu</span>
          <span className="authInputWithIcon">
            <LockKeyhole size={16} aria-hidden="true" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              required
            />
            <button
              type="button"
              className="authToggleVisibility"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={16} aria-hidden="true" />
              ) : (
                <Eye size={16} aria-hidden="true" />
              )}
            </button>
          </span>
        </label>
        {error && (
          <p className="adminAuthError" role="alert">
            <AlertCircle size={15} aria-hidden="true" />
            {error}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="button h-12 w-full bg-primary text-primary-foreground"
          disabled={pending}
        >
          {pending ? (
            "Đang kiểm tra…"
          ) : (
            <>
              Đăng nhập <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </Button>
        <Link href="/" className="adminAuthBack">
          <ArrowLeft size={14} aria-hidden="true" />
          Về trang chủ
        </Link>
      </form>
    </main>
  );
}
