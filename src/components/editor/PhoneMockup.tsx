import { Wifi, BatteryFull, SignalHigh } from "lucide-react";

/**
 * iPhone 15-style frame: brushed-titanium rail, thin bezels, refined
 * Dynamic Island. Screen size and API are unchanged so every caller keeps
 * working — the previous frame is just visually upgraded.
 */
export function PhoneMockup({
  children,
  scale = 1,
  statusBar = true,
  time = "9:41",
  chrome,
  contentClassName = "bg-white",
}: {
  children: React.ReactNode;
  scale?: number;
  statusBar?: boolean;
  time?: string;
  /** Optional app chrome rendered under the status bar (e.g. Messages header). */
  chrome?: React.ReactNode;
  contentClassName?: string;
}) {
  const W = 393;
  const H = 812;
  return (
    <div
      className="relative"
      style={{ width: W * scale, height: H * scale }}
      aria-hidden={false}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: W, height: H, transform: `scale(${scale})` }}
      >
        {/* Outer titanium rail with brushed highlight */}
        <div
          className="relative size-full rounded-[3.6rem] p-[3px] shadow-[0_50px_120px_-30px_rgba(9,9,11,0.55),0_20px_50px_-20px_rgba(9,9,11,0.45)]"
          style={{
            background:
              "linear-gradient(145deg,#d4d4d8 0%,#71717a 22%,#3f3f46 50%,#71717a 78%,#d4d4d8 100%)",
          }}
        >
          {/* Inner rail shine */}
          <div className="pointer-events-none absolute inset-[3px] rounded-[3.45rem] ring-1 ring-inset ring-white/10" />

          {/* Side buttons */}
          <span className="absolute -left-[4px] top-[118px] h-8 w-[4px] rounded-l-md bg-zinc-600" />
          <span className="absolute -left-[4px] top-[168px] h-14 w-[4px] rounded-l-md bg-zinc-600" />
          <span className="absolute -left-[4px] top-[236px] h-14 w-[4px] rounded-l-md bg-zinc-600" />
          <span className="absolute -right-[4px] top-[204px] h-20 w-[4px] rounded-r-md bg-zinc-600" />

          {/* Bezel */}
          <div className="relative size-full overflow-hidden rounded-[3.35rem] bg-zinc-950 p-[9px]">
            {/* Screen */}
            <div
              className={`relative flex size-full flex-col overflow-hidden rounded-[2.8rem] ring-1 ring-inset ring-white/5 ${contentClassName}`}
            >
              {statusBar && (
                <div className="relative z-20 flex h-[54px] shrink-0 items-end justify-between px-9 pb-1.5">
                  <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
                    {time}
                  </span>
                  <div className="flex items-center gap-1.5 text-zinc-900">
                    <SignalHigh size={16} strokeWidth={2.5} />
                    <Wifi size={16} strokeWidth={2.5} />
                    <BatteryFull size={19} strokeWidth={2} />
                  </div>
                </div>
              )}

              {/* Dynamic Island */}
              <div className="pointer-events-none absolute left-1/2 top-[11px] z-30 h-[33px] w-[118px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <span className="absolute right-3.5 top-1/2 size-[8px] -translate-y-1/2 rounded-full bg-zinc-800 ring-1 ring-zinc-700/60" />
                <span className="absolute left-4 top-1/2 size-[5px] -translate-y-1/2 rounded-full bg-zinc-800" />
              </div>

              {chrome}

              <div className="relative min-h-0 flex-1 overflow-y-auto">{children}</div>

              {/* Home indicator */}
              <div className="relative z-20 flex h-6 shrink-0 items-center justify-center">
                <span className="h-[5px] w-[134px] rounded-full bg-zinc-900/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
