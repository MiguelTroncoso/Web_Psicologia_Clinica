"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Field,
  PageHeader,
  PrimaryButton,
  Spinner,
  inputClass,
} from "@/components/ui";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    professional_name: "",
    professional_title: "Psicóloga",
    professional_id: "",
    clinic_name: "",
    session_price: "0",
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("settings").select("*").maybeSingle();
      if (data) {
        setForm({
          professional_name: data.professional_name,
          professional_title: data.professional_title,
          professional_id: data.professional_id,
          clinic_name: data.clinic_name,
          session_price: String(data.session_price ?? 0),
        });
      }
      setLoading(false);
    })();
  }, []);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error: err } = await supabase.from("settings").upsert({
      user_id: user!.id,
      professional_name: form.professional_name.trim(),
      professional_title: form.professional_title.trim(),
      professional_id: form.professional_id.trim(),
      clinic_name: form.clinic_name.trim(),
      session_price: Number(form.session_price) || 0,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSaved(true);
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Ajustes" />
      <form
        onSubmit={save}
        className="max-w-lg space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <p className="text-sm text-zinc-500">
          Estos datos aparecen en los informes PDF y en los mensajes de
          recordatorio por WhatsApp.
        </p>

        <Field label="Nombre profesional">
          <input
            className={inputClass}
            value={form.professional_name}
            placeholder="Ps. María Pérez González"
            onChange={(e) => set("professional_name", e.target.value)}
          />
        </Field>

        <Field label="Título / profesión">
          <input
            className={inputClass}
            value={form.professional_title}
            placeholder="Psicóloga Clínica"
            onChange={(e) => set("professional_title", e.target.value)}
          />
        </Field>

        <Field label="N° de registro profesional (opcional)">
          <input
            className={inputClass}
            value={form.professional_id}
            placeholder="Registro Superintendencia de Salud N° 123456"
            onChange={(e) => set("professional_id", e.target.value)}
          />
        </Field>

        <Field label="Nombre del centro / consulta (opcional)">
          <input
            className={inputClass}
            value={form.clinic_name}
            onChange={(e) => set("clinic_name", e.target.value)}
          />
        </Field>

        <Field label="Valor de la sesión (CLP)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.session_price}
            onChange={(e) => set("session_price", e.target.value)}
          />
        </Field>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {saved && (
          <p className="text-sm font-medium text-emerald-600">
            ✓ Ajustes guardados
          </p>
        )}

        <PrimaryButton type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar ajustes"}
        </PrimaryButton>
      </form>
    </div>
  );
}
