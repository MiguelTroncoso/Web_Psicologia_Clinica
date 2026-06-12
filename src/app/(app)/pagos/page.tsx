"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { METHOD_LABELS, Patient, Payment } from "@/lib/types";
import { formatCLP, formatDateShort } from "@/lib/format";
import { PaymentModal } from "@/components/payment-modal";
import {
  EmptyState,
  PageHeader,
  PrimaryButton,
  Spinner,
} from "@/components/ui";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [payments, setPayments] = useState<Payment[]>([]);
  const [patients, setPatients] = useState<Pick<Patient, "id" | "full_name">[]>([]);
  const [modal, setModal] = useState<{ open: boolean; payment: Payment | null }>({
    open: false,
    payment: null,
  });

  const load = useCallback(async () => {
    const supabase = createClient();
    const [paymentsRes, patientsRes] = await Promise.all([
      supabase
        .from("payments")
        .select("*, patients(full_name)")
        .gte("paid_at", format(month, "yyyy-MM-dd"))
        .lte("paid_at", format(endOfMonth(month), "yyyy-MM-dd"))
        .order("paid_at", { ascending: false }),
      supabase.from("patients").select("id, full_name").order("full_name"),
    ]);
    setPayments((paymentsRes.data as Payment[]) ?? []);
    setPatients(patientsRes.data ?? []);
    setLoading(false);
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <PageHeader
        title="Pagos"
        action={
          <PrimaryButton onClick={() => setModal({ open: true, payment: null })}>
            <Plus size={18} /> Registrar pago
          </PrimaryButton>
        }
      />

      {/* Selector de mes */}
      <div className="mb-5 flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
        <button
          onClick={() => setMonth((m) => addMonths(m, -1))}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="font-semibold capitalize text-zinc-900">
            {format(month, "MMMM yyyy", { locale: es })}
          </p>
          <p className="text-sm text-zinc-500">
            Total: <span className="font-bold text-teal-700">{formatCLP(total)}</span>
            {" · "}
            {payments.length} pago{payments.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : payments.length === 0 ? (
        <EmptyState message="No hay pagos registrados en este mes." />
      ) : (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {payments.map((p) => (
            <li key={p.id}>
              <button
                className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-teal-50/50"
                onClick={() => setModal({ open: true, payment: p })}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900">
                    {p.patients?.full_name ?? "Paciente"}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {formatDateShort(p.paid_at)} · {METHOD_LABELS[p.method]}
                    {p.notes ? ` · ${p.notes}` : ""}
                  </p>
                </div>
                <span className="ml-3 shrink-0 font-bold text-teal-700">
                  {formatCLP(Number(p.amount))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {modal.open && (
        <PaymentModal
          payment={modal.payment}
          patients={patients}
          onClose={() => setModal({ open: false, payment: null })}
          onSaved={() => {
            setModal({ open: false, payment: null });
            load();
          }}
        />
      )}
    </div>
  );
}
