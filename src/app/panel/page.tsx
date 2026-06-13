"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Appointment,
  Settings,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/types";
import { formatCLP, formatTime, formatDayLabel } from "@/lib/format";
import { whatsappReminderLink } from "@/lib/whatsapp";
import { EmptyState, Spinner } from "@/components/ui";
import {
  CalendarDays,
  CreditCard,
  Inbox,
  MessageCircle,
  Users,
  Video,
} from "lucide-react";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format } from "date-fns";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  const [monthIncome, setMonthIncome] = useState(0);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [newRequests, setNewRequests] = useState(0);

  const load = useCallback(async () => {
    const supabase = createClient();
    const now = new Date();

    const [apptsRes, patientsRes, paymentsRes, settingsRes, requestsRes] =
      await Promise.all([
      supabase
        .from("appointments")
        .select("*, patients(full_name, phone)")
        .gte("starts_at", startOfDay(now).toISOString())
        .lte("starts_at", endOfDay(now).toISOString())
        .order("starts_at"),
      supabase
        .from("patients")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("payments")
        .select("amount")
        .gte("paid_at", format(startOfMonth(now), "yyyy-MM-dd"))
        .lte("paid_at", format(endOfMonth(now), "yyyy-MM-dd")),
      supabase.from("settings").select("*").maybeSingle(),
      supabase
        .from("appointment_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "nueva"),
    ]);

    setTodayAppointments((apptsRes.data as Appointment[]) ?? []);
    setPatientCount(patientsRes.count ?? 0);
    setMonthIncome(
      (paymentsRes.data ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
    );
    setSettings(settingsRes.data);
    setNewRequests(requestsRes.count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner />;

  const active = todayAppointments.filter(
    (a) => a.status !== "cancelada" && a.status !== "no_asistio"
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">
        Hola{settings?.professional_name ? `, ${settings.professional_name.split(" ")[0]}` : ""} 👋
      </h1>
      <p className="mb-6 mt-1 capitalize text-zinc-500">
        {formatDayLabel(new Date())}
      </p>

      {newRequests > 0 && (
        <Link
          href="/panel/solicitudes"
          className="mb-6 flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-teal-800 transition-colors hover:bg-teal-100"
        >
          <Inbox size={20} className="shrink-0" />
          <span className="text-sm font-medium">
            Tienes {newRequests} solicitud{newRequests === 1 ? "" : "es"} de hora
            nueva{newRequests === 1 ? "" : "s"} desde tu sitio web.
          </span>
        </Link>
      )}

      {/* Estadísticas */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<CalendarDays size={20} />}
          label="Citas hoy"
          value={String(active.length)}
          href="/panel/agenda"
        />
        <StatCard
          icon={<Users size={20} />}
          label="Pacientes"
          value={String(patientCount)}
          href="/panel/pacientes"
        />
        <StatCard
          icon={<CreditCard size={20} />}
          label="Ingresos del mes"
          value={formatCLP(monthIncome)}
          href="/panel/pagos"
        />
      </div>

      {/* Citas de hoy */}
      <h2 className="mb-3 text-lg font-semibold text-zinc-900">
        Citas de hoy
      </h2>
      {todayAppointments.length === 0 ? (
        <EmptyState message="No tienes citas agendadas para hoy. ¡Disfruta tu día! 🌿" />
      ) : (
        <ul className="space-y-2.5">
          {todayAppointments.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex w-14 flex-col items-center">
                <span className="text-lg font-bold text-teal-700">
                  {formatTime(a.starts_at)}
                </span>
                <span className="text-xs text-zinc-400">{a.duration_min}′</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900">
                  {a.patients?.full_name ?? "Paciente"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status]}`}
                  >
                    {STATUS_LABELS[a.status]}
                  </span>
                  {a.modality === "online" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      <Video size={12} /> Online
                    </span>
                  )}
                </div>
              </div>
              {a.patients?.phone && (
                <a
                  href={whatsappReminderLink(
                    a.patients.phone,
                    a.patients.full_name,
                    a.starts_at,
                    settings?.professional_name ?? ""
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-emerald-100 p-2.5 text-emerald-700 hover:bg-emerald-200"
                  title="Enviar recordatorio por WhatsApp"
                >
                  <MessageCircle size={20} />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="rounded-xl bg-teal-50 p-3 text-teal-600">{icon}</div>
      <div>
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="text-xl font-bold text-zinc-900">{value}</p>
      </div>
    </Link>
  );
}
