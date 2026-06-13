"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Modality } from "@/lib/types";
import { SITE } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";
import { CheckCircle2, MessageCircle, Send } from "lucide-react";

const fieldClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

export function BookingForm() {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    preferred_date: "",
    modality: "presencial" as Modality,
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.from("appointment_requests").insert({
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      preferred_date: form.preferred_date.trim() || null,
      modality: form.modality,
      message: form.message.trim() || null,
    });
    setSending(false);
    if (err) {
      setError(
        "No pudimos enviar tu solicitud. Intenta nuevamente o escríbenos por WhatsApp."
      );
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-teal-600" size={44} />
        <h3 className="text-lg font-semibold text-zinc-900">
          ¡Solicitud enviada!
        </h3>
        <p className="mt-2 text-sm text-zinc-600">
          Gracias{form.full_name ? `, ${form.full_name.split(" ")[0]}` : ""}. Me
          pondré en contacto contigo a la brevedad para coordinar tu hora.
        </p>
        <a
          href={whatsappLink(
            SITE.whatsappPhone,
            `Hola, soy ${form.full_name}. Acabo de enviar una solicitud de hora desde la web.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <MessageCircle size={18} /> Escribir por WhatsApp ahora
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">
            Nombre completo *
          </span>
          <input
            className={fieldClass}
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">
            Teléfono / WhatsApp
          </span>
          <input
            className={fieldClass}
            value={form.phone}
            placeholder="+56 9 1234 5678"
            onChange={(e) => set("phone", e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">
            Correo electrónico
          </span>
          <input
            type="email"
            className={fieldClass}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">
            Modalidad
          </span>
          <select
            className={fieldClass}
            value={form.modality}
            onChange={(e) => set("modality", e.target.value as Modality)}
          >
            <option value="presencial">Presencial</option>
            <option value="online">Online por videollamada</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700">
          ¿Qué días u horarios te acomodan?
        </span>
        <input
          className={fieldClass}
          value={form.preferred_date}
          placeholder="Ej: martes o jueves por la tarde"
          onChange={(e) => set("preferred_date", e.target.value)}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700">
          Cuéntame brevemente en qué puedo ayudarte (opcional)
        </span>
        <textarea
          className={fieldClass}
          rows={3}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </label>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
      >
        <Send size={18} />
        {sending ? "Enviando…" : "Solicitar mi hora"}
      </button>
      <p className="text-center text-xs text-zinc-400">
        Tus datos se usan únicamente para coordinar tu atención. Confidencialidad
        garantizada.
      </p>
    </form>
  );
}
