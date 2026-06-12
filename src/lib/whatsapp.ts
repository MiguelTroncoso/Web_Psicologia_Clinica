import { formatDate, formatTime } from "./format";

/** Normaliza un teléfono chileno a formato internacional para wa.me */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("56")) return digits;
  if (digits.startsWith("9") && digits.length === 9) return "56" + digits;
  return digits;
}

export function whatsappReminderLink(
  phone: string,
  patientName: string,
  startsAt: string,
  professionalName: string
): string {
  const firstName = patientName.split(" ")[0];
  const message =
    `Hola ${firstName} 👋. Te recordamos tu cita de psicología ` +
    `el ${formatDate(startsAt)} a las ${formatTime(startsAt)} hrs` +
    (professionalName ? ` con ${professionalName}` : "") +
    `. Por favor confirma tu asistencia respondiendo este mensaje. ¡Gracias!`;
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function whatsappLink(phone: string, message = ""): string {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${normalizePhone(phone)}${text}`;
}
