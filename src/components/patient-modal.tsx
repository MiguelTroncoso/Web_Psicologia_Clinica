"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Patient } from "@/lib/types";
import {
  Field,
  Modal,
  PrimaryButton,
  SecondaryButton,
  inputClass,
} from "./ui";

export function PatientModal({
  patient,
  onClose,
  onSaved,
}: {
  patient: Patient | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const editing = patient !== null;

  const [form, setForm] = useState({
    full_name: patient?.full_name ?? "",
    rut: patient?.rut ?? "",
    birth_date: patient?.birth_date ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    address: patient?.address ?? "",
    occupation: patient?.occupation ?? "",
    emergency_contact: patient?.emergency_contact ?? "",
    notes: patient?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const data = {
      full_name: form.full_name.trim(),
      rut: form.rut.trim() || null,
      birth_date: form.birth_date || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      occupation: form.occupation.trim() || null,
      emergency_contact: form.emergency_contact.trim() || null,
      notes: form.notes.trim() || null,
    };
    const { error: err } = editing
      ? await supabase.from("patients").update(data).eq("id", patient.id)
      : await supabase.from("patients").insert(data);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  }

  return (
    <Modal
      title={editing ? "Editar paciente" : "Nuevo paciente"}
      onClose={onClose}
    >
      <form onSubmit={save} className="space-y-4">
        <Field label="Nombre completo">
          <input
            className={inputClass}
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            required
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="RUT">
            <input
              className={inputClass}
              value={form.rut}
              placeholder="12.345.678-9"
              onChange={(e) => set("rut", e.target.value)}
            />
          </Field>
          <Field label="Fecha de nacimiento">
            <input
              type="date"
              className={inputClass}
              value={form.birth_date}
              onChange={(e) => set("birth_date", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono">
            <input
              className={inputClass}
              value={form.phone}
              placeholder="+56 9 1234 5678"
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Dirección">
          <input
            className={inputClass}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Ocupación">
            <input
              className={inputClass}
              value={form.occupation}
              onChange={(e) => set("occupation", e.target.value)}
            />
          </Field>
          <Field label="Contacto de emergencia">
            <input
              className={inputClass}
              value={form.emergency_contact}
              onChange={(e) => set("emergency_contact", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Antecedentes / notas generales">
          <textarea
            className={inputClass}
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <SecondaryButton type="button" onClick={onClose}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
