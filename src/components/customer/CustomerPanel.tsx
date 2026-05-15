"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  CreditCard,
  Download,
  Flashlight,
  Gift,
  LocateFixed,
  Minus,
  Plus,
  QrCode,
  ReceiptText,
  RotateCcw,
  ScanLine,
  ShoppingCart,
  Sparkles,
  Trash2,
  UserRound,
  Wallet,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useCameraPermission } from "@/hooks/useCameraPermission";
import { clearAuthSession, getAuthSession, onAuthSessionChange, type AuthSession } from "@/lib/auth-client";

const ShoppingBasketScene = dynamic(
  () => import("@/components/three/ShoppingBasketScene").then((mod) => mod.ShoppingBasketScene),
  { ssr: false }
);

type Product = {
  id: string;
  name: string;
  barcode: string;
  price: number;
  taxRate: number;
  category: string;
  imageUrl?: string;
};

type CartLine = Product & {
  quantity: number;
};

type PaymentMethod = "UPI" | "CARD" | "WALLET";

const sampleProducts: Product[] = [
  { id: "banana", name: "Organic Bananas", barcode: "8901000000011", price: 8900, taxRate: 0, category: "Produce" },
  { id: "bread", name: "Whole Wheat Bread", barcode: "8901000000028", price: 6500, taxRate: 5, category: "Bakery" },
  { id: "coffee", name: "Cold Brew Coffee", barcode: "8901000000035", price: 14900, taxRate: 18, category: "Beverages" },
  { id: "yogurt", name: "Greek Yogurt", barcode: "8901000000042", price: 11900, taxRate: 12, category: "Dairy" }
];

const recommendations = ["Reusable tote", "Fruit jam", "Ice cubes", "Protein bar"];
const recommendationProducts: Product[] = [
  { id: "tote", name: "Reusable Tote", barcode: "8901000000059", price: 3900, taxRate: 5, category: "Checkout" },
  { id: "jam", name: "Fruit Jam", barcode: "8901000000066", price: 9900, taxRate: 12, category: "Pantry" },
  { id: "ice", name: "Ice Cubes", barcode: "8901000000073", price: 4900, taxRate: 5, category: "Frozen" },
  { id: "protein", name: "Protein Bar", barcode: "8901000000080", price: 12900, taxRate: 18, category: "Snacks" }
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value / 100);
}

export function CustomerPanel() {
  const { cameraState, cameraError, requestCamera, stream } = useCameraPermission();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState<"welcome" | "scan" | "cart" | "pay" | "success">("welcome");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("Try WELCOME10 for 10% off.");
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("UPI");
  const [toast, setToast] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [rewardsPhone, setRewardsPhone] = useState("");
  const [rewardsOtp, setRewardsOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraState]);

  useEffect(() => {
    setSession(getAuthSession());
    return onAuthSessionChange(() => setSession(getAuthSession()));
  }, []);

  useEffect(() => {
    const track = stream?.getVideoTracks()[0];
    if (!track) return;

    track
      .applyConstraints({
        advanced: [{ torch: isTorchOn } as MediaTrackConstraintSet & { torch: boolean }]
      })
      .catch(() => {
        if (isTorchOn) {
          showToast("Torch is not available on this device");
          setIsTorchOn(false);
        }
      });
  }, [isTorchOn, stream]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = cart.reduce((sum, item) => sum + Math.round(item.price * item.quantity * (item.taxRate / 100)), 0);
    const discount = coupon.trim().toUpperCase() === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
    return { subtotal, tax, discount, grand: Math.max(0, subtotal + tax - discount) };
  }, [cart, coupon]);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const lastAdded = cart.find((item) => item.id === lastAddedId);

  async function startShopping() {
    await requestCamera();
    setStep("scan");
  }

  function addProduct(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setLastAddedId(product.id);
    showToast(`${product.name} added`);
  }

  function scanNext() {
    addProduct(sampleProducts[itemCount % sampleProducts.length]);
  }

  function setQuantity(productId: string, quantity: number) {
    setCart((current) =>
      current.flatMap((item) => (item.id === productId ? (quantity <= 0 ? [] : [{ ...item, quantity }]) : [item]))
    );
    if (quantity <= 0 && lastAddedId === productId) {
      setLastAddedId(null);
    }
  }

  function submitManualCode() {
    const code = manualCode.trim();
    if (!code) {
      showToast("Enter a barcode first");
      return;
    }

    const product = [...sampleProducts, ...recommendationProducts].find(
      (item) => item.barcode.endsWith(code) || item.barcode === code
    );

    if (!product) {
      showToast("No product found for that barcode");
      return;
    }

    addProduct(product);
    setManualCode("");
    setIsManualOpen(false);
  }

  function applyCoupon(value: string) {
    setCoupon(value);
    if (!value.trim()) {
      setCouponMessage("Try WELCOME10 for 10% off.");
      return;
    }
    setCouponMessage(value.trim().toUpperCase() === "WELCOME10" ? "Coupon applied." : "Coupon not recognized.");
  }

  function completePayment() {
    setReceiptNumber(`FM-${Date.now().toString().slice(-6)}`);
    setStep("success");
  }

  function downloadReceipt() {
    const lines = [
      "FreshMart Self Checkout Receipt",
      `Receipt: ${receiptNumber || "FM-DEMO"}`,
      `Payment: ${selectedPayment}`,
      "",
      ...cart.map((item) => `${item.name} x${item.quantity} - ${formatMoney(item.price * item.quantity)}`),
      "",
      `Subtotal: ${formatMoney(totals.subtotal)}`,
      `Tax: ${formatMoney(totals.tax)}`,
      `Discount: -${formatMoney(totals.discount)}`,
      `Total: ${formatMoney(totals.grand)}`
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${receiptNumber || "freshmart-receipt"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetSession() {
    setStep("welcome");
    setCart([]);
    setCoupon("");
    setCouponMessage("Try WELCOME10 for 10% off.");
    setManualCode("");
    setIsCartOpen(false);
    setIsManualOpen(false);
    setLastAddedId(null);
    setReceiptNumber("");
    setSelectedPayment("UPI");
  }

  function sendRewardsOtp() {
    if (rewardsPhone.trim().length < 8) {
      showToast("Enter a valid mobile number");
      return;
    }
    setIsOtpSent(true);
    setRewardsOtp("1234");
    showToast("Demo OTP is 1234");
  }

  function verifyRewardsOtp() {
    if (rewardsOtp.trim() !== "1234") {
      showToast("Use demo OTP 1234");
      return;
    }
    setIsRewardsOpen(false);
    setIsOtpSent(false);
    setRewardsPhone("");
    setRewardsOtp("");
    showToast("Rewards linked");
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function logout() {
    clearAuthSession();
    showToast("Logged out");
  }

  if (step === "welcome") {
    return (
      <main className="aurora-shell relative min-h-screen overflow-hidden text-white">
        <div className="glass-grid absolute inset-0" />
        <section className="relative z-10 flex min-h-screen flex-col justify-end p-4">
          <div className="absolute left-4 right-4 top-5 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-xl">
              <LocateFixed className="h-4 w-4 text-coral" />
              <span className="text-sm font-semibold">FreshMart BLR</span>
            </div>
            {session?.mode === "customer" ? (
              <button className="rounded-full bg-mint/15 px-3 py-2 text-xs font-bold text-mint" onClick={logout} type="button">
                Rewards active
              </button>
            ) : (
              <div className="rounded-full bg-mint/15 px-3 py-2 text-xs font-bold text-mint">Express lane</div>
            )}
          </div>
          <GlassPanel className="slide-up p-4">
            <div className="relative mb-5 h-72 overflow-hidden rounded-lg border border-white/10 bg-black/20">
              <ShoppingBasketScene itemCount={2} />
              <div className="absolute bottom-3 left-3 rounded-full bg-black/35 px-3 py-2 text-xs font-semibold text-white/75 backdrop-blur-xl">
                3D cart preview
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-mint">
              <Sparkles className="h-4 w-4" />
              FreshMart Self Checkout
            </div>
            <h1 className="mt-2 text-4xl font-semibold leading-tight">Shop fast. Leave smooth.</h1>
            <p className="mt-3 text-sm leading-6 text-white/64">
              Scan items as you shop, review your smart cart, and show the exit QR at the gate.
            </p>
            {session?.mode === "customer" ? (
              <div className="mt-5 flex items-center gap-3 rounded-lg border border-mint/25 bg-mint/10 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-mint text-ink">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Signed in for rewards</p>
                  <p className="text-xs text-white/55">{session.provider === "google" ? "Google account" : session.phone}</p>
                </div>
              </div>
            ) : null}
            <div className="mt-5 grid gap-3">
              <button className="flex h-14 items-center justify-center gap-2 rounded-lg bg-mint font-bold text-ink" onClick={startShopping}>
                <Camera className="h-5 w-5" />
                Start Shopping
              </button>
            {session?.mode === "customer" ? (
              <button className="flex h-14 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 font-semibold" onClick={logout} type="button">
                <Gift className="h-5 w-5 text-lemon" />
                Logout Rewards
              </button>
            ) : (
              <Link className="flex h-14 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 font-semibold" href="/login?next=/customer">
                <Gift className="h-5 w-5 text-lemon" />
                Login for Rewards
              </Link>
            )}
            </div>
          </GlassPanel>
        </section>
      </main>
    );
  }

  return (
    <main className="aurora-shell min-h-screen text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <div className="relative h-[44vh] min-h-80 overflow-hidden bg-black">
          {cameraState === "granted" ? (
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover opacity-80" />
          ) : (
            <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,rgba(43,231,167,0.2),transparent_42%)]">
              <ScanLine className="h-20 w-20 text-mint" />
            </div>
          )}
          <div className="absolute inset-x-8 top-1/2 h-28 -translate-y-1/2 rounded-lg border-2 border-mint/80 shadow-[0_0_32px_rgba(43,231,167,0.35)]">
            <div className="scan-line absolute left-3 right-3 top-1/2 h-0.5 rounded-full bg-mint shadow-[0_0_18px_rgba(43,231,167,0.9)]" />
            <div className="absolute -left-1 -top-1 h-5 w-5 border-l-4 border-t-4 border-lemon" />
            <div className="absolute -right-1 -top-1 h-5 w-5 border-r-4 border-t-4 border-lemon" />
            <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-4 border-l-4 border-lemon" />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-4 border-r-4 border-lemon" />
          </div>
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
            <GlassPanel className="px-3 py-2 text-sm font-semibold">{cameraState === "granted" ? "Live scan" : "Manual scan mode"}</GlassPanel>
            <button
              className={`grid h-11 w-11 place-items-center rounded-lg border border-white/15 ${isTorchOn ? "bg-lemon text-ink" : "bg-white/10"}`}
              onClick={() => setIsTorchOn((value) => !value)}
              type="button"
            >
              <Flashlight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative -mt-6 flex-1 rounded-t-[28px] border-t border-white/10 bg-ink/95 px-4 pb-24 pt-5 backdrop-blur-xl">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/[0.18]" />
          <div className="mb-4 grid grid-cols-3 gap-2">
            <Metric label="Items" value={String(itemCount)} />
            <Metric label="Tax" value={formatMoney(totals.tax)} />
            <Metric label="Total" value={formatMoney(totals.grand)} />
          </div>
          <GlassPanel className="float-soft relative h-56 overflow-hidden p-3">
            <ShoppingBasketScene itemCount={itemCount} />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Basket</p>
                <p className="text-2xl font-semibold">{itemCount} items</p>
              </div>
              <p className="rounded-full bg-white/10 px-3 py-2 text-sm font-bold text-mint">{formatMoney(totals.grand)}</p>
            </div>
            {lastAdded ? (
              <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between rounded-lg border border-white/15 bg-black/35 p-2 backdrop-blur-xl">
                <span className="truncate text-sm font-semibold">{lastAdded.name}</span>
                <div className="flex items-center gap-2">
                  <button aria-label="Decrease quantity" className="grid h-9 w-9 place-items-center rounded-md bg-white/10" onClick={() => setQuantity(lastAdded.id, lastAdded.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-5 text-center font-bold">{lastAdded.quantity}</span>
                  <button aria-label="Increase quantity" className="grid h-9 w-9 place-items-center rounded-md bg-mint text-ink" onClick={() => setQuantity(lastAdded.id, lastAdded.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </GlassPanel>

          <div className="mt-4 grid grid-cols-[1.25fr_0.75fr] gap-3">
            <button className="flex h-16 items-center justify-center gap-2 rounded-lg bg-mint font-bold text-ink shadow-[0_16px_36px_rgba(43,231,167,0.22)] active:scale-[0.98]" onClick={scanNext}>
              <ScanLine className="h-5 w-5" />
              Tap to Scan
            </button>
            <button className="h-16 rounded-lg border border-white/15 bg-white/10 font-semibold active:scale-[0.98]" onClick={() => setIsManualOpen(true)}>
              Manual Entry
            </button>
          </div>
          {cameraError ? <p className="mt-3 text-sm text-coral">{cameraError}</p> : null}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Quick add demo items</p>
            <div className="grid grid-cols-2 gap-2">
              {sampleProducts.map((product) => (
                <button
                  className="rounded-lg border border-white/10 bg-white/[0.07] p-3 text-left active:scale-[0.98]"
                  key={product.id}
                  onClick={() => addProduct(product)}
                  type="button"
                >
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="mt-1 text-xs text-white/50">{formatMoney(product.price)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          className="fixed bottom-5 left-1/2 z-10 flex h-14 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-between rounded-lg bg-lemon px-4 font-bold text-ink shadow-glass"
          onClick={() => setIsCartOpen(true)}
        >
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            View Cart
          </span>
          <span>{formatMoney(totals.grand)}</span>
        </button>
      </section>

      {isCartOpen || step === "cart" || step === "pay" || step === "success" ? (
        <div className="fixed inset-0 z-20 flex items-end bg-black/55 backdrop-blur-sm">
          <GlassPanel className="slide-up max-h-[88vh] w-full overflow-y-auto rounded-b-none p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{step === "success" ? "Receipt" : step === "pay" ? "Payment" : "Smart Cart"}</h2>
              <button className="grid h-10 w-10 place-items-center rounded-lg bg-white/10" onClick={() => { setIsCartOpen(false); setStep("scan"); }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {step === "success" ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-mint" />
                <h3 className="mt-4 text-2xl font-semibold">Payment complete</h3>
                <p className="mt-2 text-sm text-white/60">Show this QR at the exit gate.</p>
                <div className="mx-auto mt-5 grid h-48 w-48 place-items-center rounded-lg bg-white text-ink shadow-[0_0_50px_rgba(255,255,255,0.18)]">
                  <QrCode className="h-32 w-32" />
                </div>
                <p className="mt-3 text-sm font-semibold text-white/70">Receipt {receiptNumber}</p>
                <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-mint font-bold text-ink" onClick={downloadReceipt}>
                  <Download className="h-5 w-5" />
                  Download Receipt
                </button>
                <button className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 font-semibold" onClick={resetSession}>
                  <RotateCcw className="h-5 w-5" />
                  Start New Session
                </button>
              </div>
            ) : step === "pay" ? (
              <div className="mt-4 grid gap-3">
                <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                  <p className="text-sm text-white/58">Amount payable</p>
                  <p className="mt-1 text-3xl font-semibold">{formatMoney(totals.grand)}</p>
                </div>
                {[
                  ["UPI", Wallet],
                  ["Card", CreditCard],
                  ["Wallet", Wallet]
                ].map(([label, Icon]) => (
                  <button
                    key={String(label)}
                    className={`flex h-14 items-center gap-3 rounded-lg border px-4 font-semibold ${
                      selectedPayment === String(label).toUpperCase() ? "border-mint bg-mint/15" : "border-white/15 bg-white/10"
                    }`}
                    onClick={() => setSelectedPayment(String(label).toUpperCase() as PaymentMethod)}
                    type="button"
                  >
                    <Icon className="h-5 w-5 text-mint" />
                    Pay with {String(label)}
                  </button>
                ))}
                <button className="mt-2 h-14 rounded-lg bg-mint font-bold text-ink" onClick={completePayment}>
                  Confirm Payment
                </button>
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-3">
                  {cart.length ? cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.08] p-3 transition hover:bg-white/[0.12]">
                      <div className="grid h-12 w-12 place-items-center rounded-md bg-gradient-to-br from-mint/25 to-lemon/20 text-lg font-bold text-mint">{item.name[0]}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{item.name}</p>
                        <p className="text-sm text-white/55">{item.quantity} x {formatMoney(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="grid h-9 w-9 place-items-center rounded-md bg-white/10" onClick={() => setQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </button>
                        <button className="grid h-9 w-9 place-items-center rounded-md bg-white/10" onClick={() => setQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button className="grid h-10 w-10 place-items-center rounded-md bg-coral/20 text-coral" onClick={() => setQuantity(item.id, 0)}>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )) : <p className="rounded-lg bg-white/[0.08] p-4 text-white/60">Your cart is empty.</p>}
                </div>
                <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
                    <Sparkles className="h-4 w-4 text-lemon" />
                    You Might Also Need
                  </p>
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {recommendations.map((item, index) => (
                      <button
                        key={item}
                        className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm"
                        onClick={() => addProduct(recommendationProducts[index])}
                        type="button"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <input className="mt-4 h-12 w-full rounded-lg border border-white/15 bg-black/25 px-3 outline-none" placeholder="Apply coupon" value={coupon} onChange={(event) => applyCoupon(event.target.value)} />
                <p className={`mt-2 text-sm ${coupon.trim().toUpperCase() === "WELCOME10" ? "text-mint" : "text-white/55"}`}>{couponMessage}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-white/60"><span>Subtotal</span><span>{formatMoney(totals.subtotal)}</span></div>
                  <div className="flex justify-between text-white/60"><span>Tax</span><span>{formatMoney(totals.tax)}</span></div>
                  <div className="flex justify-between text-mint"><span>Discount</span><span>-{formatMoney(totals.discount)}</span></div>
                  <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatMoney(totals.grand)}</span></div>
                </div>
                <button className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-mint font-bold text-ink disabled:opacity-50" disabled={!cart.length} onClick={() => setStep("pay")}>
                  <ReceiptText className="h-5 w-5" />
                  Proceed to Checkout
                </button>
              </>
            )}
          </GlassPanel>
        </div>
      ) : null}

      {isManualOpen ? (
        <div className="fixed inset-0 z-30 flex items-end bg-black/55 p-4 backdrop-blur-sm">
          <GlassPanel className="slide-up w-full p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Manual Entry</h2>
              <button className="grid h-10 w-10 place-items-center rounded-lg bg-white/10" onClick={() => setIsManualOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-white/55">Try ending digits 0011, 0028, 0035, or 0042.</p>
            <input className="mt-4 h-14 w-full rounded-lg border border-white/15 bg-black/25 px-4 text-center text-2xl font-bold tracking-widest outline-none" inputMode="numeric" value={manualCode} onChange={(event) => setManualCode(event.target.value.replace(/\D/g, ""))} />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {"123456789".split("").map((digit) => (
                <button key={digit} className="h-12 rounded-lg bg-white/10 text-lg font-bold" onClick={() => setManualCode((value) => value + digit)}>{digit}</button>
              ))}
              <button className="h-12 rounded-lg bg-white/10 text-sm font-bold" onClick={() => setManualCode((value) => value.slice(0, -1))}>Del</button>
              <button className="h-12 rounded-lg bg-white/10 text-lg font-bold" onClick={() => setManualCode((value) => value + "0")}>0</button>
              <button className="h-12 rounded-lg bg-white/10 text-sm font-bold" onClick={() => setManualCode("")}>Clear</button>
              <button className="col-span-3 h-12 rounded-lg bg-mint font-bold text-ink" onClick={submitManualCode}>Add Item</button>
            </div>
          </GlassPanel>
        </div>
      ) : null}
      {isRewardsOpen ? (
        <div className="fixed inset-0 z-30 flex items-end bg-black/55 p-4 backdrop-blur-sm">
          <GlassPanel className="slide-up w-full p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Rewards Login</h2>
                <p className="mt-1 text-sm text-white/55">Use demo OTP 1234 after sending.</p>
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-lg bg-white/10" onClick={() => setIsRewardsOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              className="mt-4 h-14 w-full rounded-lg border border-white/15 bg-black/25 px-4 text-lg font-semibold outline-none"
              inputMode="tel"
              placeholder="Mobile number"
              value={rewardsPhone}
              onChange={(event) => setRewardsPhone(event.target.value.replace(/[^\d+]/g, ""))}
            />
            {isOtpSent ? (
              <input
                className="mt-3 h-14 w-full rounded-lg border border-white/15 bg-black/25 px-4 text-center text-2xl font-bold tracking-widest outline-none"
                inputMode="numeric"
                maxLength={4}
                placeholder="OTP"
                value={rewardsOtp}
                onChange={(event) => setRewardsOtp(event.target.value.replace(/\D/g, ""))}
              />
            ) : null}
            <button
              className="mt-4 h-14 w-full rounded-lg bg-lemon font-bold text-ink"
              onClick={isOtpSent ? verifyRewardsOtp : sendRewardsOtp}
              type="button"
            >
              {isOtpSent ? "Verify OTP" : "Send OTP"}
            </button>
          </GlassPanel>
        </div>
      ) : null}
      {toast ? (
        <div className="fixed left-1/2 top-5 z-40 -translate-x-1/2 rounded-full border border-white/15 bg-black/65 px-4 py-2 text-sm font-semibold text-white shadow-glass backdrop-blur-xl">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.07] px-3 py-2 backdrop-blur-xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}
