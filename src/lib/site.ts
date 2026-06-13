/**
 * Datos públicos del sitio web. Edita aquí el teléfono, correo y textos.
 * (El nombre y título también se usan en el pie de página y la sección "Sobre mí").
 */
export const SITE = {
  professionalName: "Natalia Anton Klickmann",
  professionalTitle: "Licenciada en Psicología",
  tagline: "Acompañamiento psicológico para adultos y adolescentes",
  // Teléfono en formato internacional sin signos, ej: 56912345678 (Chile +56 9 ...)
  whatsappPhone: "56900000000",
  email: "contacto@nataliaanton.cl",
  city: "Santiago, Chile",
  // Modalidades de atención
  modalities: ["Presencial", "Online por videollamada"],
} as const;
