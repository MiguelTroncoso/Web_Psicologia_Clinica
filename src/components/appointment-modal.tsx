"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Appointment,
  AppointmentStatus,
  Modality,
  Patient,
  STATUS_LABELS,
} from "@/lib/types";
import { toLocalInputValue } from "@/lib/format";
import {
  Field,
  Modal,
  PrimaryButton,
  SecondaryButton,
  inputClass,
} from "./ui";

export function AppointmentModal({
  appointment,
  patients,
  defaultDate,
  onClose,
  onSaved,
}: {
  appointment: Appointment | null;
  patients: Pick<Patient, "id" | "full_name">[];
  defaultDate?: Date;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const editing = appointment !== null;

  const initialDate = appointment
    ? new Date(appointment.starts_at)
    : defaultDate ?? new Date();
  if (!appointment) initialDate.setMinutes(0, 0, 0);

  const [patientId, setPatientId] = useState(appointment?.patient_id ?? "");
  const [startsAt, setStartsAt] = useState(toLocalInputValue(initialDate));
  const [duration, setDuration] = useState(appointment?.duration_min ?? 50);
  const [modality, setModality] = useState<Modality>(
    appointment?.modality ?? "presencial"
  );
  const [status, setStatus] = useState<AppointmentStatus>(
    appointment?.status ?? "pendiente"
  );
  const [notes, setNotes] = useState(appointment?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) {
      setError("Selecciona un paciente.");
      return;
    }
    setSaving(true);
    setError("");
    const data = {
      patient_id: patientId,
      starts_at: new Date(startsAt).toISOString(),
      duration_min: duration,
      modality,
      status,
      notes: notes.trim() || null,
    };
    const { error: err } = editing
      ? await supabase.from("appointments").update(data).eq("id", appointment.id)
      : await supabase.from("appointments").insert(data);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  }

  async function remove() {
    if (!appointment) return;
    if (!confirm("¿Eliminar esta cita?")) return;
    setSaving(true);
    const { error: err } = await supabase
      .from("appointments")
      .delete()
      .eq("id", appointment.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  }

  return (
    <Modal title={editing ? "Editar cita" : "Nueva cita"} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <Field label="Paciente">
          <select
            className={inputClass}
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          >
            <option value="">Seleccionar paciente…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha y hora">
            <input
              type="datetime-local"
              className={inputClass}
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
          </Field>
          <Field label="Duración (min)">
            <input
              type="number"
              className={inputClass}
              value={duration}
              min={10}
              step={5}
              onChange={(e) => setDuration(Number(e.target.value))}
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Modalidad">
            <select
              className={inputClass}
              value={modality}
              onChange={(e) => setModality(e.target.value as Modality)}
            >
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
            </select>
          </Field>
          <Field label="Estado">
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Notas (opcional)">
          <textarea
            className={inputClass}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
              Eliminar
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
