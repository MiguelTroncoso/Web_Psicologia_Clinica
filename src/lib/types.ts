export type AppointmentStatus =
  | "pendiente"
  | "confirmada"
  | "completada"
  | "cancelada"
  | "no_asistio";

export type Modality = "presencial" | "online";

export type PaymentMethod = "efectivo" | "transferencia" | "tarjeta" | "otro";

export interface Patient {
  id: string;
  full_name: string;
  rut: string | null;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  occupation: string | null;
  emergency_contact: string | null;
  notes: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  starts_at: string;
  duration_min: number;
  status: AppointmentStatus;
  modality: Modality;
  notes: string | null;
  created_at: string;
  patients?: Pick<Patient, "full_name" | "phone">;
}

export interface Session {
  id: string;
  patient_id: string;
  session_date: string;
  content: string;
  created_at: string;
}

export interface Payment {
  id: string;
  patient_id: string;
  amount: number;
  method: PaymentMethod;
  paid_at: string;
  notes: string | null;
  created_at: string;
  patients?: Pick<Patient, "full_name">;
}

export interface Report {
  id: string;
  patient_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface Settings {
  user_id: string;
  professional_name: string;
  professional_title: string;
  professional_id: string;
  clinic_name: string;
  session_price: number;
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  confirmada: "bg-emerald-100 text-emerald-800",
  completada: "bg-sky-100 text-sky-800",
  cancelada: "bg-rose-100 text-rose-800",
  no_asistio: "bg-zinc-200 text-zinc-700",
};

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  otro: "Otro",
};
