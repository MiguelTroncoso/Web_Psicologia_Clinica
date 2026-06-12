"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  METHOD_LABELS,
  Patient,
  Payment,
  Report,
  Session,
  Settings,
} from "@/lib/types";
import {
  calcAge,
  formatCLP,
  formatDate,
  formatDateShort,
} from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { generateReportPdf } from "@/lib/pdf";
import { PatientModal } from "@/components/patient-modal";
import { PaymentModal } from "@/components/payment-modal";
import {
  EmptyState,
  Field,
  Modal,
  PrimaryButton,
  SecondaryButton,
  Spinner,
  inputClass,
} from "@/components/ui";
import {
  ArrowLeft,
  Download,
  FileText,
  MessageCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

type Tab = "sesiones" | "informes" | "pagos" | "datos";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [tab, setTab] = useState<Tab>("sesiones");

  const [editPatient, setEditPatient] = useState(false);
  const [sessionModal, setSessionModal] = useState<Session | null | "new">(null);
  const [reportModal, setReportModal] = useState<Report | null | "new">(null);
  const [paymentModal, setPaymentModal] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [patientRes, sessionsRes, reportsRes, paymentsRes, settingsRes] =
      await Promise.all([
        supabase.from("patients").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("sessions")
          .select("*")
          .eq("patient_id", id)
          .order("session_date", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("reports")
          .select("*")
          .eq("patient_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("payments")
          .select("*")
          .eq("patient_id", id)
          .order("paid_at", { ascending: false }),
        supabase.from("settings").select("*").maybeSingle(),
      ]);

    setPatient(patientRes.data);
    setSessions(sessionsRes.data ?? []);
    setReports(reportsRes.data ?? []);
    setPayments(paymentsRes.data ?? []);
    setSettings(settingsRes.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner />;
  if (!patient) {
    return <EmptyState message="Paciente no encontrado." />;
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "sesiones", label: `Sesiones (${sessions.length})` },
    { key: "informes", label: `Informes (${reports.length})` },
    { key: "pagos", label: `Pagos (${payments.length})` },
    { key: "datos", label: "Datos" },
  ];

  return (
    <div>
      <button
        onClick={() => router.push("/pacientes")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-teal-700"
      >
        <ArrowLeft size={16} /> Pacientes
      </button>

      {/* Encabezado */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-700">
            {patient.full_name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              {patient.full_name}
            </h1>
            <p className="text-sm text-zinc-500">
              {[
                patient.rut,
                patient.birth_date
                  ? `${calcAge(patient.birth_date)} años`
                  : null,
                patient.occupation,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {patient.phone && (
            <a
              href={whatsappLink(patient.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700 hover:bg-emerald-200"
              title="Abrir WhatsApp"
            >
              <MessageCircle size={19} />
            </a>
          )}
          <SecondaryButton onClick={() => setEditPatient(true)}>
            <Pencil size={16} /> Editar
          </SecondaryButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? "bg-white text-teal-700 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== Sesiones ===== */}
      {tab === "sesiones" && (
        <div>
          <div className="mb-4 flex justify-end">
            <PrimaryButton onClick={() => setSessionModal("new")}>
              <Plus size={18} /> Nueva nota de sesión
            </PrimaryButton>
          </div>
          {sessions.length === 0 ? (
            <EmptyState message="Sin notas de sesión todavía." />
          ) : (
            <ul className="space-y-3">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-teal-300"
                  onClick={() => setSessionModal(s)}
                >
                  <p className="mb-1.5 text-sm font-semibold text-teal-700">
                    {formatDate(s.session_date)}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                    {s.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ===== Informes ===== */}
      {tab === "informes" && (
        <div>
          <div className="mb-4 flex justify-end">
            <PrimaryButton onClick={() => setReportModal("new")}>
              <Plus size={18} /> Nuevo informe
            </PrimaryButton>
          </div>
          {reports.length === 0 ? (
            <EmptyState message="Sin informes generados. Crea uno y descárgalo en PDF." />
          ) : (
            <ul className="space-y-3">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600">
                    <FileText size={20} />
                  </div>
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setReportModal(r)}
                  >
                    <p className="truncate font-medium text-zinc-900">
                      {r.title}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {formatDate(r.created_at)}
                    </p>
                  </button>
                  <button
                    onClick={() => generateReportPdf(r, patient, settings)}
                    className="rounded-lg bg-teal-600 p-2.5 text-white hover:bg-teal-700"
                    title="Descargar PDF"
                  >
                    <Download size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ===== Pagos ===== */}
      {tab === "pagos" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-zinc-600">
              Total pagado:{" "}
              <span className="font-bold text-zinc-900">
                {formatCLP(
                  payments.reduce((sum, p) => sum + Number(p.amount), 0)
                )}
              </span>
            </p>
            <PrimaryButton onClick={() => setPaymentModal(true)}>
              <Plus size={18} /> Registrar pago
            </PrimaryButton>
          </div>
          {payments.length === 0 ? (
            <EmptyState message="Sin pagos registrados." />
          ) : (
            <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              {payments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-zinc-900">
                      {formatCLP(Number(p.amount))}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {formatDateShort(p.paid_at)} · {METHOD_LABELS[p.method]}
                      {p.notes ? ` · ${p.notes}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ===== Datos ===== */}
      {tab === "datos" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <DataItem label="RUT" value={patient.rut} />
            <DataItem
              label="Fecha de nacimiento"
              value={
                patient.birth_date
                  ? `${formatDateShort(patient.birth_date)} (${calcAge(patient.birth_date)} años)`
                  : null
              }
            />
            <DataItem label="Teléfono" value={patient.phone} />
            <DataItem label="Email" value={patient.email} />
            <DataItem label="Dirección" value={patient.address} />
            <DataItem label="Ocupación" value={patient.occupation} />
            <DataItem
              label="Contacto de emergencia"
              value={patient.emergency_contact}
            />
            <DataItem
              label="Paciente desde"
              value={formatDate(patient.created_at)}
            />
          </dl>
          {patient.notes && (
            <div className="mt-5 border-t border-zinc-100 pt-4">
              <p className="mb-1 text-sm font-medium text-zinc-500">
                Antecedentes / notas
              </p>
              <p className="whitespace-pre-wrap text-sm text-zinc-700">
                {patient.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===== Modales ===== */}
      {editPatient && (
        <PatientModal
          patient={patient}
          onClose={() => setEditPatient(false)}
          onSaved={() => {
            setEditPatient(false);
            load();
          }}
        />
      )}

      {sessionModal !== null && (
        <SessionModal
          patientId={patient.id}
          session={sessionModal === "new" ? null : sessionModal}
          onClose={() => setSessionModal(null)}
          onSaved={() => {
            setSessionModal(null);
            load();
          }}
        />
      )}

      {reportModal !== null && (
        <ReportModal
          patient={patient}
          settings={settings}
          report={reportModal === "new" ? null : reportModal}
          onClose={() => setReportModal(null)}
          onSaved={() => {
            setReportModal(null);
            load();
          }}
        />
      )}

      {paymentModal && (
        <PaymentModal
          payment={null}
          patients={[{ id: patient.id, full_name: patient.full_name }]}
          defaultPatientId={patient.id}
          defaultAmount={settings?.session_price || undefined}
          onClose={() => setPaymentModal(false)}
          onSaved={() => {
            setPaymentModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-sm font-medium text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-900">{value || "—"}</dd>
    </div>
  );
}

/* ===== Modal de nota de sesión ===== */
function SessionModal({
  patientId,
  session,
  onClose,
  onSaved,
}: {
  patientId: string;
  session: Session | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const editing = session !== null;
  const [sessionDate, setSessionDate] = useState(
    session?.session_date ?? format(new Date(), "yyyy-MM-dd")
  );
  const [content, setContent] = useState(session?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const data = {
      patient_id: patientId,
      session_date: sessionDate,
      content: content.trim(),
    };
    const { error: err } = editing
      ? await supabase.from("sessions").update(data).eq("id", session.id)
      : await supabase.from("sessions").insert(data);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  }

  async function remove() {
    if (!session) return;
    if (!confirm("¿Eliminar esta nota de sesión?")) return;
    setSaving(true);
    const { error: err } = await supabase
      .from("sessions")
      .delete()
      .eq("id", session.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  }

  return (
    <Modal
      title={editing ? "Editar nota de sesión" : "Nueva nota de sesión"}
      onClose={onClose}
    >
      <form onSubmit={save} className="space-y-4">
        <Field label="Fecha de la sesión">
          <input
            type="date"
            className={inputClass}
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            required
          />
        </Field>
        <Field label="Notas de la sesión">
          <textarea
            className={inputClass}
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Motivo, evolución, observaciones, acuerdos…"
            required
            autoFocus={!editing}
          />
        </Field>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex justify-between gap-3 pt-2">
          {editing ? (
            <SecondaryButton
              type="button"
              onClick={remove}
              disabled={saving}
              className="!border-rose-200 !text-rose-600 hover:!bg-rose-50"
            >
              <Trash2 size={16} /> Eliminar
            </SecondaryButton>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <SecondaryButton type="button" onClick={onClose}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Modal>
  );
}

/* ===== Modal de informe ===== */
function ReportModal({
  patient,
  settings,
  report,
  onClose,
  onSaved,
}: {
  patient: Patient;
  settings: Settings | null;
  report: Report | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const editing = report !== null;
  const [title, setTitle] = useState(report?.title ?? "Informe Psicológico");
  const [content, setContent] = useState(report?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent, downloadAfter: boolean) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const data = {
      patient_id: patient.id,
      title: title.trim(),
      content: content.trim(),
    };
    const { data: saved, error: err } = editing
      ? await supabase
          .from("reports")
          .update(data)
          .eq("id", report.id)
          .select()
          .single()
      : await supabase.from("reports").insert(data).select().single();
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (downloadAfter && saved) {
      generateReportPdf(saved as Report, patient, settings);
    }
    onSaved();
  }

  async function remove() {
    if (!report) return;
    if (!confirm("¿Eliminar este informe?")) return;
    setSaving(true);
    const { error: err } = await supabase
      .from("reports")
      .delete()
      .eq("id", report.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  }

  return (
    <Modal
      title={editing ? "Editar informe" : "Nuevo informe"}
      onClose={onClose}
    >
      <form onSubmit={(e) => save(e, false)} className="space-y-4">
        <Field label="Título del informe">
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Informe Psicológico / Certificado de atención…"
            required
          />
        </Field>
        <Field label="Contenido">
          <textarea
            className={inputClass}
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Motivo de consulta, evaluación, conclusiones, sugerencias…"
            required
            autoFocus={!editing}
          />
        </Field>
        <p className="text-xs text-zinc-500">
          El PDF incluirá automáticamente tus datos profesionales (configúralos
          en Ajustes) y los datos del paciente.
        </p>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex flex-wrap justify-between gap-3 pt-2">
          {editing ? (
            <SecondaryButton
              type="button"
              onClick={remove}
              disabled={saving}
              className="!border-rose-200 !text-rose-600 hover:!bg-rose-50"
            >
              <Trash2 size={16} /> Eliminar
            </SecondaryButton>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-3">
            <SecondaryButton type="button" onClick={onClose}>
              Cancelar
            </SecondaryButton>
            <SecondaryButton
              type="button"
              disabled={saving}
              onClick={(e) => save(e as unknown as React.FormEvent, true)}
            >
              <Download size={16} /> Guardar y descargar PDF
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Modal>
  );
}
