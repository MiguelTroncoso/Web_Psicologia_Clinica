"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { METHOD_LABELS, Patient, Payment, PaymentMethod } from "@/lib/types";
import {
  Field,
  Modal,
  PrimaryButton,
  SecondaryButton,
  inputClass,
} from "./ui";
import { format } from "date-fns";

export function PaymentModal({
  payment,
  patients,
  defaultPatientId,
  defaultAmount,
  onClose,
  onSaved,
}: {
  payment: Payment | null;
  patients: Pick<Patient, "id" | "full_name">[];
  defaultPatientId?: string;
  defaultAmount?: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const editing = payment !== null;

  const [patientId, setPatientId] = useState(
    payment?.patient_id ?? defaultPatientId ?? ""
  );
  const [amount, setAmount] = useState<string>(
    String(payment?.amount ?? defaultAmount ?? "")
  );
  const [method, setMethod] = useState<PaymentMethod>(
    payment?.method ?? "transferencia"
  );
  const [paidAt, setPaidAt] = useState(
    payment?.paid_at ?? format(new Date(), "yyyy-MM-dd")
  );
  const [notes, setNotes] = useState(payment?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const data = {
      patient_id: patientId,
      amount: Number(amount),
      method,
      paid_at: paidAt,
      notes: notes.trim() || null,
    };
    const { error: err } = editing
      ? await supabase.from("payments").update(data).eq("id", payment.id)
      : await supabase.from("payments").insert(data);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  }

  async function remove() {
    if (!payment) return;
    if (!confirm("¿Eliminar este pago?")) return;
    setSaving(true);
    const { error: err } = await supabase
      .from("payments")
      .delete()
      .eq("id", payment.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  }

  return (
    <Modal title={editing ? "Editar pago" : "Registrar pago"} onClose={onClose}>
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
          <Field label="Monto (CLP)">
            <input
              type="number"
              className={inputClass}
              value={amount}
              min={0}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Field>
          <Field label="Fecha">
            <input
              type="date"
              className={inputClass}
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              required
            />
          </Field>
        </div>

        <Field label="Método de pago">
          <select
            className={inputClass}
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          >
            {Object.entries(METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

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
