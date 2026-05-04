import Link from "next/link";
import { CalendarDays, LogOut, MessageCircle, Scissors, Settings } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/services", label: "Servicios", icon: Scissors },
  { href: "/dashboard/settings", label: "Configuracion", icon: Settings },
  { href: "/dashboard/whatsapp", label: "WhatsApp", icon: MessageCircle }
];

export function DashboardNav({ logoutAction }: { logoutAction: () => Promise<void> }) {
  return (
    <aside className="rounded bg-ink p-4 text-white shadow-soft lg:min-h-[calc(100vh-48px)]">
      <Link className="mb-8 flex items-center gap-3" href="/">
        <div className="grid h-10 w-10 place-items-center rounded bg-white/10">
          <Scissors size={20} />
        </div>
        <div>
          <p className="font-black">BarberFlow</p>
          <p className="text-xs text-white/60">Admin piloto</p>
        </div>
      </Link>
      <nav className="grid gap-2">
        {links.map((item) => (
          <Link
            className="flex items-center gap-3 rounded px-3 py-3 font-bold text-white/78 transition hover:bg-white/10 hover:text-white"
            href={item.href}
            key={item.href}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>
      <form action={logoutAction} className="mt-8">
        <button className="flex w-full items-center gap-3 rounded px-3 py-3 font-bold text-white/78 transition hover:bg-white/10 hover:text-white" type="submit">
          <LogOut size={18} />
          Salir
        </button>
      </form>
    </aside>
  );
}
