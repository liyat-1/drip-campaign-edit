import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  MessageSquarePlus,
  BedDouble,
  Send,
  ThumbsUp,
  MessageSquareDashed,
  CheckSquare,
  Image as ImageIcon,
  ChevronDown,
  Globe,
  Info,
} from "lucide-react";

type Item = { label: string; to?: string; icon: React.ComponentType<{ size?: number; className?: string }> };

const GROUPS: { label?: string; items: Item[] }[] = [
  {
    items: [
      { label: "Analytics", to: "/analytics", icon: BarChart3 },
      { label: "Bookings", icon: CalendarDays },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Automated Invites", to: "/marketing/invites", icon: MessageSquarePlus },
      { label: "Automated Transactional", to: "/marketing/transactional", icon: BedDouble },
      { label: "In-Property Automated Transactional", to: "/marketing/in-property", icon: BedDouble },
      { label: "Drip Campaign", to: "/campaign", icon: Send },
      { label: "Guest Responses", icon: ThumbsUp },
      { label: "Before Stay", icon: MessageSquareDashed },
      { label: "Site Abandonment", icon: CheckSquare },
    ],
  },
  {
    label: "Marketing Assets",
    items: [{ label: "Media", to: "/marketing/media", icon: ImageIcon }],
  },
];

/**
 * The enterprise application shell: property selector, left navigation and a
 * compact page header. Matches the existing Directful dashboard chrome.
 */
export function MarketingShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <div className="flex min-h-dvh bg-[#f5f6f7] text-zinc-900">
      <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col overflow-y-auto border-r border-zinc-200 bg-white lg:flex">
        <div className="border-b border-zinc-200 px-5 py-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400">
            Holiday Inn
          </p>
          <button className="mt-1 flex w-full items-start justify-between gap-2 text-left">
            <span className="text-[14px] font-semibold leading-snug text-zinc-900">
              New York City – Times Square by IHG
            </span>
            <ChevronDown size={16} className="mt-0.5 shrink-0 text-zinc-400" />
          </button>
        </div>

        <nav className="flex-1 px-2.5 py-3">
          {GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-4 border-t border-zinc-100 pt-4" : ""}>
              {group.label && (
                <p className="px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const active = item.to ? pathname.startsWith(item.to) : false;
                const cls = `flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[13px] transition-colors ${
                  active
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`;
                const inner = (
                  <>
                    <item.icon size={16} className={active ? "text-blue-600" : "text-zinc-400"} />
                    <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
                  </>
                );
                return item.to ? (
                  <Link key={item.label} to={item.to} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <button key={item.label} type="button" className={cls}>
                    {inner}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-zinc-100 px-5 py-3 text-[11px] text-zinc-400">
          Dashboard version 7.73.0
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-3.5">
          <h1 className="truncate text-[19px] font-semibold tracking-tight">{title}</h1>
          <div className="flex items-center gap-4 text-zinc-400">
            <Info size={18} />
            <span className="hidden text-[12.5px] text-zinc-500 sm:inline">View as client</span>
            <Globe size={18} />
          </div>
        </header>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
