"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Patient } from "@/lib/types";
import { calcAge } from "@/lib/format";
import { PatientModal } from "@/components/patient-modal";
import {
  EmptyState,
  PageHeader,
  PrimaryButton,
  Spinner,
  inputClass,
} from "@/components/ui";
import { ChevronRight, Plus, Search } from "lucide-react";

export default function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("patients")
      .select("*")
      .order("full_name");
    setPatients((data as Patient[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = patients.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(q) ||
      (p.rut ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Pacientes"
        action={
          <PrimaryButton onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nuevo paciente
          </PrimaryButton>
        }
      />

      <div className="relative mb-5">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          className={`${inputClass} !pl-10`}
          placeholder="Buscar por nombre o RUT…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          message={
            patients.length === 0
              ? "Aún no tienes pacientes registrados. Crea el primero con el botón “Nuevo paciente”."
              : "No se encontraron pacientes con esa búsqueda."
          }
        />
      ) : (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                href={`/panel/pacientes/${p.id}`}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-teal-50/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-700">
                  {p.full_name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900">
                    {p.full_name}
                  </p>
                  <p className="truncate text-sm text-zinc-500">
                    {[
                      p.rut,
                      p.birth_date ? `${calcAge(p.birth_date)} años` : null,
                      p.phone,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Sin datos de contacto"}
                  </p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-zinc-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <PatientModal
          patient={null}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}
