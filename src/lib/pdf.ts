import { jsPDF } from "jspdf";
import type { Patient, Report, Settings } from "./types";
import { formatDate, formatDateShort, calcAge } from "./format";

const MARGIN = 22;
const LINE_HEIGHT = 6.5;

export function generateReportPdf(
  report: Pick<Report, "title" | "content" | "created_at">,
  patient: Patient,
  settings: Settings | null
) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  // Encabezado profesional
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(settings?.professional_name || "Informe Psicológico", MARGIN, y);
  y += 5.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (settings?.professional_title) {
    doc.text(settings.professional_title, MARGIN, y);
    y += 5;
  }
  if (settings?.professional_id) {
    doc.text(`Registro: ${settings.professional_id}`, MARGIN, y);
    y += 5;
  }
  if (settings?.clinic_name) {
    doc.text(settings.clinic_name, MARGIN, y);
    y += 5;
  }
  y += 2;
  doc.setDrawColor(120);
  doc.line(MARGIN, y, pageWidth - MARGIN, y);
  y += 10;

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(report.title.toUpperCase(), pageWidth / 2, y, { align: "center" });
  y += 12;

  // Datos del paciente
  doc.setFontSize(11);
  doc.text("I. Identificación del paciente", MARGIN, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);

  const fields: [string, string][] = [["Nombre", patient.full_name]];
  if (patient.rut) fields.push(["RUT", patient.rut]);
  if (patient.birth_date)
    fields.push([
      "Fecha de nacimiento",
      `${formatDateShort(patient.birth_date)} (${calcAge(patient.birth_date)} años)`,
    ]);
  if (patient.occupation) fields.push(["Ocupación", patient.occupation]);
  fields.push(["Fecha del informe", formatDate(report.created_at)]);

  for (const [label, value] of fields) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}: `, MARGIN, y);
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.setFont("helvetica", "normal");
    doc.text(value, MARGIN + labelWidth, y);
    y += LINE_HEIGHT;
  }
  y += 4;

  // Contenido
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("II. Informe", MARGIN, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);

  const paragraphs = report.content.split(/\n/);
  for (const paragraph of paragraphs) {
    const lines: string[] = paragraph.trim()
      ? doc.splitTextToSize(paragraph, contentWidth)
      : [""];
    for (const line of lines) {
      if (y > pageHeight - MARGIN - 10) {
        doc.addPage();
        y = MARGIN;
      }
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
  }

  // Firma
  if (y > pageHeight - 55) {
    doc.addPage();
    y = MARGIN;
  }
  y = Math.max(y + 25, pageHeight - 50);
  const centerX = pageWidth / 2;
  doc.line(centerX - 35, y, centerX + 35, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text(settings?.professional_name || "", centerX, y, { align: "center" });
  y += 5.5;
  doc.setFont("helvetica", "normal");
  if (settings?.professional_title) {
    doc.text(settings.professional_title, centerX, y, { align: "center" });
    y += 5.5;
  }
  if (settings?.professional_id) {
    doc.text(`Registro: ${settings.professional_id}`, centerX, y, {
      align: "center",
    });
  }

  const safeName = patient.full_name.replace(/[^\p{L}\d ]/gu, "").replace(/ +/g, "_");
  doc.save(`${report.title.replace(/ +/g, "_")}_${safeName}.pdf`);
}
