"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  CalendarDays,
  Download,
  FileSpreadsheet,
  PackagePlus,
  Radio,
  Save,
  Search,
  ShoppingBasket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { clearAuthSession, getAuthSession, type AuthSession } from "@/lib/auth-client";

type AdminTab = "traffic" | "inventory" | "analytics";

type InventoryItem = {
  id: string;
  name: string;
  barcode: string;
  price: number;
  taxRate: number;
  stock: number;
  category: string;
  modelFormat?: string;
};

const initialInventory: InventoryItem[] = [
  { id: "banana", name: "Organic Bananas", barcode: "8901000000011", price: 8900, taxRate: 0, stock: 120, category: "Produce", modelFormat: "glb" },
  { id: "bread", name: "Whole Wheat Bread", barcode: "8901000000028", price: 6500, taxRate: 5, stock: 80, category: "Bakery", modelFormat: "glb" },
  { id: "coffee", name: "Cold Brew Coffee", barcode: "8901000000035", price: 14900, taxRate: 18, stock: 60, category: "Beverages", modelFormat: "glb" }
];

const liveFeed = [
  { id: "s1", cart: "Cart A12", item: "Cold Brew Coffee", total: "INR 149", status: "Scanning" },
  { id: "s2", cart: "Cart B08", item: "Whole Wheat Bread", total: "INR 214", status: "Checkout" },
  { id: "s3", cart: "Cart C31", item: "Organic Bananas", total: "INR 89", status: "Scanning" }
];

const flagged = [
  { id: "f1", cart: "Cart B08", reason: "Idle for 7 minutes", level: "Medium" },
  { id: "f2", cart: "Cart D18", reason: "Weight mismatch after scan", level: "High" }
];

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value / 100);
}

export function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("traffic");
  const [inventory, setInventory] = useState(initialInventory);
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<AuthSession | null | undefined>(undefined);
  const [newProduct, setNewProduct] = useState({
    name: "",
    barcode: "",
    price: "",
    taxRate: "18",
    stock: "",
    category: ""
  });

  const filteredInventory = useMemo(
    () =>
      inventory.filter((item) =>
        [item.name, item.barcode, item.category].join(" ").toLowerCase().includes(query.toLowerCase())
      ),
    [inventory, query]
  );

  useEffect(() => {
    const currentSession = getAuthSession();
    setSession(currentSession);
    if (currentSession?.mode !== "admin") {
      router.replace("/admin/login?next=/admin");
    }
  }, [router]);

  function updateStock(id: string, stock: number) {
    setInventory((items) => items.map((item) => (item.id === id ? { ...item, stock: Math.max(0, stock) } : item)));
  }

  function addProduct() {
    if (!newProduct.name.trim() || !newProduct.barcode.trim()) return;
    setInventory((items) => [
      {
        id: crypto.randomUUID(),
        name: newProduct.name,
        barcode: newProduct.barcode,
        price: Math.round(Number(newProduct.price || 0) * 100),
        taxRate: Number(newProduct.taxRate || 0),
        stock: Number(newProduct.stock || 0),
        category: newProduct.category || "General",
        modelFormat: "pending"
      },
      ...items
    ]);
    setNewProduct({ name: "", barcode: "", price: "", taxRate: "18", stock: "", category: "" });
  }

  function logout() {
    clearAuthSession();
    router.replace("/admin/login?next=/admin");
  }

  if (session === undefined) {
    return (
      <main className="aurora-shell grid min-h-screen place-items-center p-4 text-white">
        <GlassPanel className="w-full max-w-sm p-5 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-mint" />
          <p className="mt-4 font-semibold">Checking admin access...</p>
        </GlassPanel>
      </main>
    );
  }

  if (session?.mode !== "admin") {
    return (
      <main className="aurora-shell grid min-h-screen place-items-center p-4 text-white">
        <GlassPanel className="w-full max-w-sm p-5 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-lemon" />
          <h1 className="mt-4 text-2xl font-semibold">Admin login required</h1>
          <Link className="mt-5 block rounded-lg bg-mint px-4 py-3 font-bold text-ink" href="/admin/login?next=/admin">
            Go to Login
          </Link>
        </GlassPanel>
      </main>
    );
  }

  return (
    <main className="aurora-shell min-h-screen text-white">
      <div className="glass-grid absolute inset-0" />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col p-4 md:p-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-mint">
              <Radio className="h-4 w-4" />
              FreshMart Operations
            </p>
            <h1 className="mt-1 text-4xl font-semibold leading-tight">Store Command Center</h1>
            <p className="mt-2 text-sm text-white/55">
              Signed in with {session.provider === "google" ? "Google" : session.phone}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
          <nav className="grid grid-cols-3 gap-2 rounded-lg border border-white/15 bg-white/[0.08] p-1 backdrop-blur-xl md:w-[520px]">
            {[
              ["traffic", Activity, "Traffic"],
              ["inventory", Boxes, "Inventory"],
              ["analytics", BarChart3, "Analytics"]
            ].map(([key, Icon, label]) => (
              <button
                className={`flex h-11 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
                  tab === key ? "bg-mint text-ink" : "text-white/70 hover:bg-white/10"
                }`}
                key={String(key)}
                onClick={() => setTab(key as AdminTab)}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {String(label)}
              </button>
            ))}
          </nav>
          <button className="h-10 rounded-lg border border-white/15 bg-white/10 px-4 text-sm font-semibold" onClick={logout} type="button">
            Logout
          </button>
          </div>
        </header>

        {tab === "traffic" ? (
          <div className="slide-up mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
              <Stat icon={Users} label="Active Sessions" value="18" tone="mint" detail="+12% vs last hour" />
              <Stat icon={ShoppingBasket} label="Open Carts" value="42" tone="lemon" detail="INR 18.4K in progress" />
              <Stat icon={AlertTriangle} label="Flagged Carts" value="2" tone="coral" />
            </div>
            <GlassPanel className="overflow-hidden p-0">
              <div className="border-b border-white/10 bg-white/[0.06] p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Live Cart Feed</h2>
                  <span className="rounded-full bg-mint/15 px-3 py-1 text-xs font-bold text-mint">Live</span>
                </div>
              </div>
              <div className="grid gap-3 p-4">
                {liveFeed.map((entry, index) => (
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.08] p-3" key={entry.id}>
                    <div className="grid h-10 w-10 place-items-center rounded-md bg-mint/15 text-sm font-bold text-mint">{index + 1}</div>
                    <div>
                      <p className="font-semibold">{entry.cart}</p>
                      <p className="text-sm text-white/58">{entry.item}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-mint">{entry.total}</p>
                      <p className="text-xs text-white/50">{entry.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
            <GlassPanel className="overflow-hidden p-0">
              <div className="border-b border-white/10 bg-coral/10 p-4">
              <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Flagged Carts</h2>
                  <AlertTriangle className="h-5 w-5 text-coral" />
                </div>
              </div>
              <div className="grid gap-3 p-4">
                {flagged.map((entry) => (
                  <div className="rounded-lg border border-coral/30 bg-coral/10 p-3" key={entry.id}>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{entry.cart}</p>
                      <span className="rounded-full bg-coral px-2 py-1 text-xs font-bold text-ink">{entry.level}</span>
                    </div>
                    <p className="mt-1 text-sm text-white/65">{entry.reason}</p>
                    <button className="mt-3 h-9 rounded-md bg-white/10 px-3 text-sm font-semibold">Review Session</button>
                  </div>
                ))}
              </div>
            </GlassPanel>
            <GlassPanel className="lg:col-span-2 overflow-hidden p-0">
              <div className="grid gap-0 md:grid-cols-[1fr_1fr_1fr]">
                {[
                  ["Conversion", "91%", "Checkout completion rate", "mint"],
                  ["Avg Basket", "INR 438", "Across active carts", "lemon"],
                  ["Intervention", "3m 12s", "Avg response time", "coral"]
                ].map(([label, value, copy, tone]) => (
                  <div className="border-b border-white/10 p-4 md:border-b-0 md:border-r md:last:border-r-0" key={label}>
                    <p className="text-sm text-white/55">{label}</p>
                    <p className={`mt-2 text-3xl font-semibold ${tone === "mint" ? "text-mint" : tone === "lemon" ? "text-lemon" : "text-coral"}`}>{value}</p>
                    <p className="mt-1 text-sm text-white/55">{copy}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        ) : null}

        {tab === "inventory" ? (
          <div className="slide-up mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <GlassPanel className="p-4">
              <div className="flex items-center gap-2">
                <PackagePlus className="h-5 w-5 text-mint" />
                <h2 className="text-xl font-semibold">Add New Product</h2>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  ["name", "Product name"],
                  ["barcode", "Barcode"],
                  ["category", "Category"],
                  ["price", "Price"],
                  ["taxRate", "Tax %"],
                  ["stock", "Stock"]
                ].map(([field, label]) => (
                  <input
                    className="h-12 rounded-lg border border-white/15 bg-black/25 px-3 outline-none"
                    key={field}
                    inputMode={field === "price" || field === "taxRate" || field === "stock" ? "decimal" : "text"}
                    onChange={(event) => setNewProduct((product) => ({ ...product, [field]: event.target.value }))}
                    placeholder={label}
                    value={newProduct[field as keyof typeof newProduct]}
                  />
                ))}
                <label className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/25 bg-white/[0.08] text-sm font-semibold text-white/70">
                  <Upload className="h-5 w-5 text-lemon" />
                  Upload 3D Model
                  <input className="hidden" type="file" accept=".glb,.gltf,.obj" />
                </label>
                <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-mint font-bold text-ink" onClick={addProduct}>
                  <Save className="h-5 w-5" />
                  Save Product
                </button>
              </div>
            </GlassPanel>

            <GlassPanel className="overflow-hidden p-0">
              <div className="border-b border-white/10 bg-white/[0.06] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold">Inventory</h2>
                <div className="flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-black/25 px-3">
                  <Search className="h-4 w-4 text-white/45" />
                  <input className="bg-transparent outline-none" placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} />
                </div>
              </div>
              </div>
              <div className="overflow-hidden">
                {filteredInventory.map((item) => (
                  <div className="grid gap-3 border-b border-white/10 bg-white/[0.045] p-3 last:border-b-0 md:grid-cols-[1fr_auto_auto]" key={item.id}>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-white/55">{item.barcode} - {item.category} - {money(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="h-9 w-9 rounded-md bg-white/10 font-bold" onClick={() => updateStock(item.id, item.stock - 1)}>-</button>
                      <input className="h-9 w-20 rounded-md border border-white/15 bg-black/25 text-center outline-none" value={item.stock} onChange={(event) => updateStock(item.id, Number(event.target.value || 0))} />
                      <button className="h-9 w-9 rounded-md bg-mint font-bold text-ink" onClick={() => updateStock(item.id, item.stock + 1)}>+</button>
                    </div>
                    <span className="self-center rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/65">{item.modelFormat ?? "no model"}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        ) : null}

        {tab === "analytics" ? (
          <div className="slide-up mt-6 grid gap-4 lg:grid-cols-[1fr_0.75fr]">
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
              <Stat icon={TrendingUp} label="Revenue" value="INR 2.8L" tone="mint" detail="+18.6% week over week" />
              <Stat icon={ShoppingBasket} label="Orders" value="642" tone="lemon" detail="124 self-checkout" />
              <Stat icon={Activity} label="Peak Hour" value="6 PM" tone="coral" detail="Staff one more lane" />
            </div>
            <GlassPanel className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold">Sales Reports</h2>
                <div className="flex gap-2">
                  <button className="flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 text-sm font-semibold">
                    <CalendarDays className="h-4 w-4" />
                    Date Range
                  </button>
                  <button className="flex h-10 items-center gap-2 rounded-lg bg-lemon px-3 text-sm font-bold text-ink">
                    <FileSpreadsheet className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
              <div className="mt-6 grid h-72 grid-cols-7 items-end gap-3 rounded-lg border border-white/10 bg-black/20 p-4">
                {[42, 68, 55, 88, 74, 96, 83].map((height, index) => (
                  <div className="flex h-full flex-col justify-end gap-2" key={index}>
                    <div className="rounded-t-md bg-gradient-to-t from-mint to-lemon shadow-[0_0_22px_rgba(43,231,167,0.18)]" style={{ height: `${height}%` }} />
                    <span className="text-center text-xs text-white/45">{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 font-semibold">
                <Download className="h-5 w-5" />
                Export Report
              </button>
            </GlassPanel>

            <GlassPanel className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-lemon" />
                <h2 className="text-xl font-semibold">AI Insights</h2>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  "Cold beverages pair strongly with bakery scans between 3 PM and 6 PM.",
                  "Reusable bags should be placed near check-in to lift attachment.",
                  "Produce starts many carts but needs better dairy cross-sell placement."
                ].map((insight) => (
                  <div className="rounded-lg border border-white/10 bg-white/[0.08] p-3 text-sm text-white/72" key={insight}>
                    {insight}
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        ) : null}
      </section>
    </main>
  );
}

type StatProps = {
  icon: typeof Activity;
  label: string;
  value: string;
  tone: "mint" | "lemon" | "coral";
  detail?: string;
};

function Stat({ icon: Icon, label, value, tone, detail }: StatProps) {
  const toneClass = tone === "mint" ? "text-mint" : tone === "lemon" ? "text-lemon" : "text-coral";
  return (
    <GlassPanel className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/58">{label}</p>
        <Icon className={`h-5 w-5 ${toneClass}`} />
      </div>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-sm text-white/50">{detail}</p> : null}
    </GlassPanel>
  );
}
