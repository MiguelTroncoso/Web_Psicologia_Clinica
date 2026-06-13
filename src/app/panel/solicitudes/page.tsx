"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AppointmentRequest,
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
  RequestStatus,
} from "@/lib/types";
import { formatDate } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { EmptyState, PageHeader, Spinner } from "@/components/ui";
import {
  CalendarClock,
  Mail,
  MessageCircle,
  Trash2,
  UserPlus,
  Video,
} from "lucide-react";

const NEXT_STATUS: { value: RequestStatus; label: string }[] = [
  { value: "nueva", label: "Nueva" },
  { value: "contactada", label: "Contactada" },
  { value: "agendada", label: "Agendada" },
  { value: "descartada", label: "Descartada" },
];

export default function RequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("appointment_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRequests((data as AppointmentRequest[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id: string, status: RequestStatus) {
    setBusy(id);
    const supabase = createClient();
    await supabase
      .from("appointment_requests")
      .update({ status })
      .eq("id", id);
    await load();
    setBusy(null);
  }

  async function createPatient(r: AppointmentRequest) {
    if (!confirm(`¿Crear la ficha de paciente para ${r.full_name}?`)) return;
    setBusy(r.id);
    const supabase = createClient();
    const { error } = await supabase.from("patients").insert({
      full_name: r.full_name,
      phone: r.phone,
      email: r.email,
      notes: r.message
        ? `Solicitud web: ${r.message}`
        : "Creado desde una solicitud web.",
    });
    if (!error) {
      await supabase
        .from("appointment_requests")
        .update({ status: "agendada" })
        .eq("id", r.id);
      await load();
    }
    setBusy(null);
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta solicitud?")) return;
    setBusy(id);
    const supabase = createClient();
    await supabase.from("appointment_requests").delete().eq("id", id);
    await load();
    setBusy(null);
  }

  const newCount = requests.filter((r) => r.status === "nueva").length;

  return (
    <div>
      <PageHeader title="Solicitudes de hora" />
      <p className="-mt-3 mb-5 text-sm text-zinc-500">
        Reservas recibidas desde tu sitio web.
        {newCount > 0 && (
          <span className="ml-1 font-medium text-teal-700">
            {newCount} nueva{newCount === 1 ? "" : "s"} sin revisar.
          </span>
        )}
      </p>

      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <EmptyState message="Aún no hay solicitudes. Aparecerán aquí cuando alguien reserve desde tu página web." />
      ) : (
        <ul className="space-y-4">
          {requests.map((r) => (
            <li
              key={r.id}
              className={`rounded-xl border bg-white p-5 shadow-sm ${
                r.status === "nueva" ? "border-teal-300" : "border-zinc-200"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-zinc-900">
                      {r.full_name}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${REQUEST_STATUS_COLORS[r.status]}`}
                    >
                      {REQUEST_STATUS_LABELS[r.status]}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                      {r.modality === "online" ? (
                        <>
                          <Video size={12} /> Online
                        </>
                      ) : (
                        "Presencial"
                      )}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Recibida el {formatDate(r.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {r.phone && (
                    <a
                      href={whatsappLink(
                        r.phone,
                        `Hola ${r.full_name.split(" ")[0]}, recibí tu solicitud de hora. `
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700 hover:bg-emerald-200"
                      title="Responder por WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </a>
                  )}
                  <button
                    onClick={() => createPatient(r)}
                    disabled={busy === r.id}
                    className="rounded-lg bg-teal-100 p-2.5 text-teal-700 hover:bg-teal-200 disabled:opacity-50"
                    title="Crear ficha de paciente"
                  >
                    <UserPlus size={18} />
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    disabled={busy === r.id}
                    className="rounded-lg bg-rose-50 p-2.5 text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                    title="Eliminar solicitud"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                {r.preferred_date && (
                  <p className="inline-flex items-center gap-1.5">
                    <CalendarClock size={15} className="text-teal-600" />
                    Prefiere: {r.preferred_date}
                  </p>
                )}
                {r.email && (
                  <p className="inline-flex items-center gap-1.5">
                    <Mail size={15} className="text-teal-600" />
                    {r.email}
                  </p>
                )}
                {r.phone && (
                  <p className="inline-flex items-center gap-1.5">
                    <MessageCircle size={15} className="text-teal-600" />
                    {r.phone}
                  </p>
                )}
              </div>

              {r.message && (
                <p className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
                  “{r.message}”
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-3">
                <span className="mr-1 text-xs text-zinc-400">
                  Marcar como:
                </span>
                {NEXT_STATUS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => changeStatus(r.id, s.value)}
                    disabled={busy === r.id || r.status === s.value}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-default ${
                      r.status === s.value
                        ? REQUEST_STATUS_COLORS[s.value]
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
