"use client";

import dynamic from "next/dynamic";
import { Camera, Gift, Loader2, MapPin, ScanLine, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useCameraPermission } from "@/hooks/useCameraPermission";

const BarcodeMascotScene = dynamic(
  () => import("@/components/three/BarcodeMascotScene").then((mod) => mod.BarcodeMascotScene),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-ink" />
  }
);

type StoreOption = {
  id: string;
  name: string;
  code: string;
  city?: string | null;
};

const fallbackStores: StoreOption[] = [
  {
    id: "demo-store",
    name: "FreshMart Self Checkout",
    code: "BLR-DEMO-01",
    city: "Bengaluru"
  }
];

export function CustomerCheckInShell() {
  const { cameraState, cameraError, requestCamera } = useCameraPermission();
  const [stores, setStores] = useState<StoreOption[]>(fallbackStores);
  const [selectedStoreId, setSelectedStoreId] = useState(fallbackStores[0].id);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [otpTarget, setOtpTarget] = useState("");
  const [hasZoomed, setHasZoomed] = useState(false);

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedStoreId) ?? stores[0],
    [selectedStoreId, stores]
  );

  useEffect(() => {
    let isMounted = true;

    fetch("/api/stores")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { stores?: StoreOption[] } | null) => {
        if (!isMounted || !data?.stores?.length) return;
        setStores(data.stores);
        setSelectedStoreId(data.stores[0].id);
      })
      .catch(() => {
        setStores(fallbackStores);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleStartShopping() {
    setHasZoomed(true);
    await requestCamera();
  }

  const permissionText =
    cameraState === "granted"
      ? "Camera ready"
      : cameraState === "requesting"
        ? "Requesting camera"
        : cameraState === "denied"
          ? "Manual mode available"
          : "Scan access pending";

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-white">
      <BarcodeMascotScene />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(43,231,167,0.16),transparent_34%),linear-gradient(180deg,rgba(16,20,23,0.1),rgba(16,20,23,0.92)_72%)]" />

      <section className="relative z-10 flex min-h-screen flex-col px-4 pb-5 pt-5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl">
              <ShoppingBag className="h-5 w-5 text-mint" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Self Checkout</p>
              <p className="text-xs text-white/58">{selectedStore?.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/78 backdrop-blur-xl">
            <ShieldCheck className="h-4 w-4 text-mint" />
            Secure
          </div>
        </header>

        <div className="flex flex-1 items-end pb-4 pt-[36vh]">
          <GlassPanel
            className={`w-full p-4 transition duration-700 ease-out ${
              hasZoomed ? "translate-y-0 scale-[1.01]" : "translate-y-2"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-mint">Welcome in</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal">Scan, bag, and go.</h1>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-lemon text-ink">
                <ScanLine className="h-6 w-6" />
              </div>
            </div>

            <label className="mt-5 block text-xs font-medium uppercase text-white/58" htmlFor="store-selector">
              Store
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3">
              <MapPin className="h-4 w-4 text-coral" />
              <select
                id="store-selector"
                className="h-12 flex-1 bg-transparent text-sm font-medium outline-none"
                value={selectedStoreId}
                onChange={(event) => setSelectedStoreId(event.target.value)}
              >
                {stores.map((store) => (
                  <option className="bg-ink text-white" key={store.id} value={store.id}>
                    {store.name}
                    {store.city ? `, ${store.city}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
              <button
                className="flex h-14 items-center justify-center gap-2 rounded-lg bg-mint px-4 text-sm font-bold text-ink transition active:scale-[0.98] disabled:opacity-70"
                disabled={cameraState === "requesting"}
                onClick={handleStartShopping}
                type="button"
              >
                {cameraState === "requesting" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                Start Shopping
              </button>
              <button
                aria-label="Login for rewards"
                className="grid h-14 w-14 place-items-center rounded-lg border border-white/15 bg-white/10 transition active:scale-[0.98]"
                onClick={() => setIsRewardsOpen(true)}
                type="button"
              >
                <Gift className="h-5 w-5 text-lemon" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/18 px-3 py-3 text-sm">
              <span className="text-white/70">{permissionText}</span>
              <span className="font-semibold text-mint">{cameraState === "granted" ? "Ready" : "Optional"}</span>
            </div>
            {cameraError ? <p className="mt-3 text-sm text-coral">{cameraError}</p> : null}
          </GlassPanel>
        </div>
      </section>

      {isRewardsOpen ? (
        <div className="fixed inset-0 z-20 flex items-end bg-black/55 p-4 backdrop-blur-sm">
          <GlassPanel className="w-full p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Rewards Login</h2>
                <p className="mt-1 text-sm text-white/62">Enter your mobile number for OTP access.</p>
              </div>
              <button
                aria-label="Close rewards login"
                className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/10"
                onClick={() => setIsRewardsOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              className="mt-5 h-14 w-full rounded-lg border border-white/15 bg-black/25 px-4 py-4 text-lg font-semibold outline-none placeholder:text-white/35"
              inputMode="tel"
              onChange={(event) => setOtpTarget(event.target.value)}
              placeholder="Mobile number"
              value={otpTarget}
            />
            <button
              className="mt-4 h-14 w-full rounded-lg bg-lemon px-4 py-4 text-sm font-bold text-ink disabled:opacity-50"
              disabled={otpTarget.trim().length < 8}
              type="button"
            >
              Send OTP
            </button>
          </GlassPanel>
        </div>
      ) : null}
    </main>
  );
}
