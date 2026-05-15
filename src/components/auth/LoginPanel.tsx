"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Loader2, Phone, ReceiptText, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { saveAuthSession } from "@/lib/auth-client";

type LoginPanelProps = {
  mode?: "customer" | "admin";
};

function GoogleMark() {
  return (
    <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-bold text-ink shadow-sm">
      G
    </span>
  );
}

function LoginPanelContent({ mode = "customer" }: LoginPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("Demo OTP is 1234 after sending.");

  const defaultNext = mode === "admin" ? "/admin" : "/customer";
  const requestedNextPath = searchParams.get("next") || defaultNext;
  const nextPath = requestedNextPath.startsWith("/") && !requestedNextPath.startsWith("//") ? requestedNextPath : defaultNext;
  const title = mode === "admin" ? "Admin Login" : "Customer Login";
  const subtitle =
    mode === "admin"
      ? "Access traffic, inventory, and sales controls."
      : "Save rewards, receipts, and faster checkout sessions.";
  const roleLabel = mode === "admin" ? "Staff access" : "Rewards access";

  const canSendOtp = useMemo(() => phone.replace(/\D/g, "").length >= 8, [phone]);

  function sendOtp() {
    if (!canSendOtp) {
      setMessage("Enter a valid phone number first.");
      return;
    }
    setIsOtpSent(true);
    setOtp("");
    setMessage("OTP sent. Use 1234 for this demo.");
  }

  function verifyOtp() {
    if (otp !== "1234") {
      setMessage("Incorrect OTP. Use 1234 for this demo.");
      return;
    }
    finishLogin("phone");
  }

  function loginWithGoogle() {
    setIsLoadingGoogle(true);
    setMessage("Signing in with Google...");
    window.setTimeout(() => {
      finishLogin("google");
    }, 650);
  }

  function finishLogin(provider: "phone" | "google") {
    const session = {
      provider,
      mode,
      phone: provider === "phone" ? phone : "",
      loggedInAt: new Date().toISOString()
    };

    saveAuthSession(session);
    setIsLoadingGoogle(false);
    setIsLoggedIn(true);
    setMessage("Login successful. Redirecting...");
    window.setTimeout(() => router.replace(nextPath), 700);
  }

  return (
    <main className="aurora-shell relative min-h-screen overflow-hidden text-white">
      <div className="glass-grid absolute inset-0" />
      <div className="absolute left-1/2 top-10 h-52 w-52 -translate-x-1/2 rounded-full bg-mint/10 blur-3xl" />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-4">
        <Link className="mb-5 flex w-fit items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur-xl transition active:scale-[0.98]" href="/">
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>

        <GlassPanel className="slide-up overflow-hidden">
          {isLoggedIn ? (
            <div className="grid min-h-[520px] place-items-center p-6 text-center">
              <div>
                <CheckCircle2 className="mx-auto h-20 w-20 text-mint" />
                <h1 className="mt-5 text-3xl font-semibold">You are signed in</h1>
                <p className="mt-2 text-sm text-white/60">Taking you to checkout now.</p>
                <button className="mt-6 h-12 rounded-lg bg-mint px-6 font-bold text-ink" onClick={() => router.replace(nextPath)}>
                  Continue
                </button>
              </div>
            </div>
          ) : (
          <>
          <div className="relative overflow-hidden border-b border-white/10 bg-white/[0.06] p-5">
            <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs font-bold text-mint">
              {roleLabel}
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-mint to-lemon text-ink shadow-[0_20px_50px_rgba(43,231,167,0.22)]">
              {mode === "admin" ? <ShieldCheck className="h-7 w-7" /> : <UserRound className="h-7 w-7" />}
            </div>
            <h1 className="mt-5 text-3xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-white/62">{subtitle}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                [ShieldCheck, "Secure"],
                [ReceiptText, "Receipts"],
                [Clock3, "Fast"]
              ].map(([Icon, label]) => (
                <div className="rounded-lg border border-white/10 bg-black/20 p-2 text-center" key={String(label)}>
                  <Icon className="mx-auto h-4 w-4 text-mint" />
                  <p className="mt-1 text-[11px] font-semibold text-white/58">{String(label)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5">
            <button
              className="group flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-white px-4 font-bold text-ink shadow-[0_18px_50px_rgba(255,255,255,0.12)] transition active:scale-[0.98] disabled:opacity-70"
              disabled={isLoadingGoogle}
              onClick={loginWithGoogle}
              type="button"
            >
              {isLoadingGoogle ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleMark />}
              <span className="flex-1 text-left">Continue with Google</span>
              <Sparkles className="h-4 w-4 text-coral opacity-80" />
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">or phone</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45" htmlFor="phone">
              Phone number
            </label>
            <div className="mt-2 flex h-14 items-center gap-3 rounded-lg border border-white/15 bg-black/25 px-3 ring-1 ring-white/[0.02] focus-within:border-mint/70 focus-within:shadow-[0_0_0_4px_rgba(43,231,167,0.08)]">
              <Phone className="h-5 w-5 text-mint" />
              <input
                className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none placeholder:text-white/30"
                id="phone"
                inputMode="tel"
                onChange={(event) => setPhone(event.target.value.replace(/[^\d+]/g, ""))}
                placeholder="+91 98765 43210"
                value={phone}
              />
            </div>

            {isOtpSent ? (
              <>
                <div className="mt-4 flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/45" htmlFor="otp">
                    OTP
                  </label>
                  <button className="text-xs font-bold text-mint" onClick={sendOtp} type="button">
                    Resend
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      className="h-14 rounded-lg border border-white/15 bg-black/25 text-center text-2xl font-bold outline-none focus:border-mint/70"
                      inputMode="numeric"
                      key={index}
                      maxLength={1}
                      onChange={(event) => {
                        const digits = `${otp.slice(0, index)}${event.target.value.replace(/\D/g, "")}${otp.slice(index + 1)}`.slice(0, 4);
                        setOtp(digits);
                        const next = event.currentTarget.parentElement?.children[index + 1] as HTMLInputElement | undefined;
                        if (event.target.value && next) next.focus();
                      }}
                      value={otp[index] ?? ""}
                    />
                  ))}
                </div>
              </>
            ) : null}

            <button
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-mint font-bold text-ink transition active:scale-[0.98] disabled:opacity-50"
              disabled={!isOtpSent && !canSendOtp}
              onClick={isOtpSent ? verifyOtp : sendOtp}
              type="button"
            >
              {isOtpSent ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Verify OTP
                </>
              ) : (
                "Send OTP"
              )}
            </button>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.06] p-3">
              <p className="text-sm font-medium text-white/72">{message}</p>
              <p className="mt-1 text-xs text-white/42">Demo only. Production auth should use a verified OTP and OAuth provider.</p>
            </div>
          </div>
          </>
          )}
        </GlassPanel>
      </section>
    </main>
  );
}

export function LoginPanel(props: LoginPanelProps) {
  return (
    <Suspense fallback={<main className="aurora-shell min-h-screen" />}>
      <LoginPanelContent {...props} />
    </Suspense>
  );
}
