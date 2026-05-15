"use client";

type ShoppingBasketSceneProps = {
  itemCount: number;
};

const colors = ["bg-coral", "bg-lemon", "bg-mint", "bg-sky-300"];

export function ShoppingBasketScene({ itemCount }: ShoppingBasketSceneProps) {
  const visibleItems = Math.min(itemCount, 10);

  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden" aria-hidden="true">
      <div className="absolute h-44 w-44 rounded-full bg-mint/15 blur-3xl" />
      <div className="absolute h-32 w-56 rounded-full bg-coral/10 blur-2xl" />

      <div className="float-soft relative h-44 w-64 [perspective:700px]">
        <div className="absolute left-1/2 top-8 h-20 w-28 -translate-x-1/2 rounded-t-full border-[10px] border-b-0 border-lemon/90 shadow-[0_0_26px_rgba(247,216,75,0.18)]" />

        <div className="absolute bottom-4 left-1/2 h-24 w-56 -translate-x-1/2 rounded-lg border border-white/20 bg-white/[0.08] shadow-[0_30px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl [transform:rotateX(58deg)_rotateZ(-1deg)]">
          <div className="absolute inset-x-2 bottom-2 h-8 rounded-md bg-mint/80 shadow-[0_0_24px_rgba(43,231,167,0.34)]" />
          <div className="absolute left-2 top-2 h-16 w-4 rounded bg-sky-300/50" />
          <div className="absolute right-2 top-2 h-16 w-4 rounded bg-sky-300/50" />
          <div className="absolute left-8 right-8 top-4 grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div className="h-12 rounded-full bg-white/12" key={index} />
            ))}
          </div>
        </div>

        <div className="absolute bottom-14 left-1/2 h-24 w-48 -translate-x-1/2">
          {Array.from({ length: visibleItems }).map((_, index) => {
            const left = 18 + (index % 5) * 34;
            const bottom = Math.floor(index / 5) * 22;
            const rotate = -10 + index * 7;

            return (
              <div
                className={`absolute h-9 w-9 rounded-md ${colors[index % colors.length]} shadow-[0_12px_24px_rgba(0,0,0,0.24)] ring-1 ring-white/25`}
                key={index}
                style={{
                  left,
                  bottom,
                  transform: `rotate(${rotate}deg) translateZ(0)`
                }}
              />
            );
          })}
        </div>

        <div className="absolute bottom-3 left-8 h-3 w-3 rounded-full bg-white/50 blur-[1px]" />
        <div className="absolute bottom-3 right-8 h-3 w-3 rounded-full bg-white/50 blur-[1px]" />
      </div>
    </div>
  );
}
