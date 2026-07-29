import { Wifi, BatteryFull, SignalHigh } from "lucide-react";

/**
 * Modern iPhone frame (Dynamic Island, titanium rail, thin bezels).
 * Used for both the mobile email preview and the SMS preview so the two
 * surfaces stay visually consistent.
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
        {/* Titanium outer rail */}
        <div className="relative size-full rounded-[3.4rem] bg-gradient-to-b from-zinc-400 via-zinc-600 to-zinc-500 p-[3px] shadow-[0_40px_80px_-20px_rgba(24,24,27,0.55)]">
          {/* Side buttons */}
          <span className="absolute -left-[3px] top-[124px] h-8 w-[3px] rounded-l-sm bg-zinc-500" />
          <span className="absolute -left-[3px] top-[176px] h-14 w-[3px] rounded-l-sm bg-zinc-500" />
          <span className="absolute -left-[3px] top-[240px] h-14 w-[3px] rounded-l-sm bg-zinc-500" />
          <span className="absolute -right-[3px] top-[210px] h-20 w-[3px] rounded-r-sm bg-zinc-500" />

          {/* Bezel */}
          <div className="size-full overflow-hidden rounded-[3.25rem] bg-zinc-950 p-[10px]">
            {/* Screen */}
            <div className={`relative flex size-full flex-col overflow-hidden rounded-[2.6rem] ${contentClassName}`}>
              {statusBar && (
                <div className="relative z-20 flex h-[54px] shrink-0 items-end justify-between px-8 pb-1.5">
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
              <div className="pointer-events-none absolute left-1/2 top-[11px] z-30 h-[34px] w-[124px] -translate-x-1/2 rounded-full bg-zinc-950">
                <span className="absolute right-3 top-1/2 size-[9px] -translate-y-1/2 rounded-full bg-zinc-800" />
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
