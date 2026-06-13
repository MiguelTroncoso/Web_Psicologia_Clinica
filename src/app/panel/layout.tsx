"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CalendarDays,
  CreditCard,
  HeartPulse,
  Home,
  Inbox,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

const NAV = [
  { href: "/panel", label: "Inicio", icon: Home },
  { href: "/panel/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/panel/solicitudes", label: "Solicitudes", icon: Inbox },
  { href: "/panel/pacientes", label: "Pacientes", icon: Users },
  { href: "/panel/pagos", label: "Pagos", icon: CreditCard },
  { href: "/panel/ajustes", label: "Ajustes", icon: Settings },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    return href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-zinc-200 bg-white md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="rounded-xl bg-teal-600 p-2 text-white">
            <HeartPulse size={20} />
          </div>
          <span className="text-lg font-bold text-zinc-900">
            Agenda Clínica
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-teal-50 text-teal-700"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
        >
          <LogOut size={19} />
          Cerrar sesión
        </button>
      </aside>

      {/* Contenido */}
      <main className="flex-1 px-4 pb-24 pt-5 md:ml-60 md:px-8 md:pb-10 md:pt-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      {/* Barra inferior móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              isActive(href) ? "text-teal-600" : "text-zinc-500"
            }`}
          >
            <Icon size={21} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
