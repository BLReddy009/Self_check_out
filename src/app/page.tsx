import Link from "next/link";

export default function HomePage() {
  return (
    <main className="aurora-shell relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="glass-grid absolute inset-0" />
      <div className="relative z-10 w-full max-w-sm rounded-lg border border-white/15 bg-white/10 p-6 shadow-glass backdrop-blur-xl">
        <p className="text-sm font-semibold text-mint">FreshMart</p>
        <h1 className="mt-1 text-3xl font-semibold">Self Checkout</h1>
        <div className="mt-6 grid gap-3">
          <Link className="rounded-md bg-mint px-4 py-3 text-center font-semibold text-ink" href="/customer">
            Continue as Guest
          </Link>
          <Link className="rounded-md border border-white/20 bg-white/10 px-4 py-3 text-center font-semibold" href="/login?next=/customer">
            Customer Login
          </Link>
          <Link className="rounded-md border border-white/20 px-4 py-3 text-center font-semibold" href="/admin/login?next=/admin">
            Admin Login
          </Link>
        </div>
      </div>
    </main>
  );
}
