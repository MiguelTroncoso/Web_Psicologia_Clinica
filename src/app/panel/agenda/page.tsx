"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Appointment,
  Patient,
  Settings,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/types";
import { formatTime, formatDayLabel } from "@/lib/format";
import { whatsappReminderLink } from "@/lib/whatsapp";
import { AppointmentModal } from "@/components/appointment-modal";
import { EmptyState, PageHeader, PrimaryButton, Spinner } from "@/components/ui";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Plus,
  Video,
} from "lucide-react";
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";

export default function AgendaPage() {
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Pick<Patient, "id" | "full_name">[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [modal, setModal] = useState<{ open: boolean; appointment: Appointment | null }>({
    open: false,
    appointment: null,
  });

  const weekStart = useMemo(
    () => startOfWeek(selectedDay, { weekStartsOn: 1 }),
    [selectedDay]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const load = useCallback(async () => {
    const supabase = createClient();
    const weekEnd = endOfWeek(selectedDay, { weekStartsOn: 1 });

    const [apptsRes, patientsRes, settingsRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("*, patients(full_name, phone)")
        .gte("starts_at", weekStart.toISOString())
        .lte("starts_at", weekEnd.toISOString())
        .order("starts_at"),
      supabase.from("patients").select("id, full_name").order("full_name"),
      supabase.from("settings").select("*").maybeSingle(),
    ]);

    setAppointments((apptsRes.data as Appointment[]) ?? []);
    setPatients(patientsRes.data ?? []);
    setSettings(settingsRes.data);
    setLoading(false);
  }, [selectedDay, weekStart]);

  useEffect(() => {
    load();
  }, [load]);

  const dayAppointments = appointments.filter((a) =>
    isSameDay(new Date(a.starts_at), selectedDay)
  );

  function countFor(day: Date) {
    return appointments.filter(
      (a) =>
        isSameDay(new Date(a.starts_at), day) &&
        a.status !== "cancelada" &&
        a.status !== "no_asistio"
    ).length;
  }

  return (
    <div>
      <PageHeader
        title="Agenda"
        action={
          <PrimaryButton onClick={() => setModal({ open: true, appointment: null })}>
            <Plus size={18} /> Nueva cita
          </PrimaryButton>
        }
      />

      {/* Navegación de semana */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setSelectedDay((d) => addWeeks(d, -1))}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
          aria-label="Semana anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setSelectedDay(new Date())}
          className="text-sm font-medium capitalize text-teal-700 hover:underline"
        >
          {format(weekStart, "MMMM yyyy", { locale: es })}
        </button>
        <button
          onClick={() => setSelectedDay((d) => addWeeks(d, 1))}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
          aria-label="Semana siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="mb-6 grid grid-cols-7 gap-1.5">
        {weekDays.map((day) => {
          const selected = isSameDay(day, selectedDay);
          const count = countFor(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`flex flex-col items-center rounded-xl border py-2.5 transition-colors ${
                selected
                  ? "border-teal-600 bg-teal-600 text-white"
                  : isToday(day)
                    ? "border-teal-300 bg-teal-50 text-teal-800"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-teal-300"
              }`}
            >
              <span className="text-[11px] uppercase opacity-75">
                {format(day, "EEE", { locale: es })}
              </span>
              <span className="text-lg font-bold leading-tight">
                {format(day, "d")}
              </span>
              <span
                className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                  count > 0 ? (selected ? "bg-white" : "bg-teal-500") : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Citas del día */}
      <h2 className="mb-3 font-semibold capitalize text-zinc-800">
        {formatDayLabel(selectedDay)}
      </h2>

      {loading ? (
        <Spinner />
      ) : dayAppointments.length === 0 ? (
        <EmptyState message="No hay citas para este día." />
      ) : (
        <ul className="space-y-2.5">
          {dayAppointments.map((a) => (
            <li
              key={a.id}
              className="flex cursor-pointer items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-teal-300"
              onClick={() => setModal({ open: true, appointment: a })}
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
                  {a.notes && (
                    <span className="truncate text-xs text-zinc-400">
                      {a.notes}
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
                  onClick={(e) => e.stopPropagation()}
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

      {modal.open && (
        <AppointmentModal
          appointment={modal.appointment}
          patients={patients}
          defaultDate={selectedDay}
          onClose={() => setModal({ open: false, appointment: null })}
          onSaved={() => {
            setModal({ open: false, appointment: null });
            load();
          }}
        />
      )}
    </div>
  );
}
