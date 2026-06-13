import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { SITE } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";
import {
  Brain,
  HeartHandshake,
  Leaf,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

const NAV = [
  { href: "#sobre-mi", label: "Sobre mí" },
  { href: "#servicios", label: "Servicios" },
  { href: "#enfoque", label: "Cómo trabajo" },
  { href: "#reservar", label: "Reservar hora" },
];

const SERVICES = [
  {
    icon: Brain,
    title: "Terapia individual para adultos",
    text: "Un espacio confidencial para trabajar ansiedad, estrés, autoestima, duelos y procesos de cambio personal.",
  },
  {
    icon: Sparkles,
    title: "Atención a adolescentes",
    text: "Acompañamiento en etapas de cambio, manejo emocional, vínculos y desafíos propios de la adolescencia.",
  },
  {
    icon: HeartHandshake,
    title: "Ansiedad y estado de ánimo",
    text: "Herramientas concretas para comprender y regular la ansiedad, el ánimo bajo y los pensamientos repetitivos.",
  },
  {
    icon: Leaf,
    title: "Bienestar y autoconocimiento",
    text: "Procesos orientados a reconectar contigo, fortalecer tus recursos y avanzar hacia una vida más equilibrada.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Solicita tu hora",
    text: "Completa el formulario o escríbeme por WhatsApp. Coordinamos día, horario y modalidad.",
  },
  {
    n: "02",
    title: "Primera sesión",
    text: "Nos conocemos, conversamos sobre lo que te trae y definimos juntos los objetivos del proceso.",
  },
  {
    n: "03",
    title: "Acompañamiento",
    text: "Avanzamos sesión a sesión a tu ritmo, con un enfoque cálido, respetuoso y basado en evidencia.",
  },
];

export default function HomePage() {
  const waLink = whatsappLink(
    SITE.whatsappPhone,
    `Hola ${SITE.professionalName}, me gustaría agendar una hora.`
  );

  return (
    <div className="bg-white text-zinc-800">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 font-bold text-white">
              NA
            </span>
            <span className="hidden text-sm font-semibold leading-tight text-zinc-900 sm:block">
              {SITE.professionalName}
              <span className="block text-xs font-normal text-zinc-500">
                {SITE.professionalTitle}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-teal-700"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#reservar"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              Reservar hora
            </a>
            <Link
              href="/login"
              className="hidden text-xs font-medium text-zinc-400 hover:text-zinc-600 sm:block"
              title="Acceso exclusivo para la profesional"
            >
              Acceso profesional
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
              <Leaf size={14} /> {SITE.tagline}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
              Un espacio seguro para cuidar tu{" "}
              <span className="text-teal-600">salud mental</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-zinc-600">
              Soy {SITE.professionalName}, {SITE.professionalTitle}. Te acompaño
              en un proceso terapéutico cercano y confidencial, a tu propio
              ritmo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#reservar"
                className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
              >
                Reservar una hora
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                <MessageCircle size={18} className="text-emerald-600" />
                Escribir por WhatsApp
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={16} className="text-teal-600" /> {SITE.city}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Video size={16} className="text-teal-600" /> Atención online
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock size={16} className="text-teal-600" /> 100% confidencial
              </span>
            </div>
          </div>

          {/* Tarjeta decorativa */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-teal-200/50 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-44 w-44 rounded-full bg-emerald-200/50 blur-2xl" />
            <div className="relative rounded-3xl border border-zinc-100 bg-white p-8 shadow-xl">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-3xl font-bold text-white shadow-inner">
                NA
              </div>
              <p className="mt-5 text-center text-lg font-semibold text-zinc-900">
                {SITE.professionalName}
              </p>
              <p className="text-center text-sm text-teal-700">
                {SITE.professionalTitle}
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Enfoque cálido y sin juicios",
                  "Orientado a tus objetivos",
                  "Adultos y adolescentes",
                ].map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-3 rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-800"
                  >
                    <Sparkles size={16} className="shrink-0 text-teal-600" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Sobre mí ===== */}
      <section id="sobre-mi" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="flex aspect-square max-w-md items-center justify-center rounded-3xl bg-gradient-to-br from-teal-100 to-emerald-100">
              <Quote size={120} className="text-teal-300" />
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold text-zinc-900">Sobre mí</h2>
            <p className="mt-5 text-zinc-600">
              Mi nombre es {SITE.professionalName} y soy{" "}
              {SITE.professionalTitle}. Creo en una terapia humana, respetuosa y
              adaptada a cada persona. Mi propósito es ofrecerte un espacio
              seguro donde puedas expresarte sin temor a ser juzgada o juzgado.
            </p>
            <p className="mt-4 text-zinc-600">
              Trabajo con adultos y adolescentes que atraviesan momentos de
              ansiedad, estrés, dificultades emocionales o simplemente buscan
              conocerse mejor. Juntos identificamos tus recursos y construimos
              herramientas para tu bienestar.
            </p>
            <blockquote className="mt-6 border-l-4 border-teal-500 pl-4 text-zinc-700 italic">
              “Pedir ayuda no es un signo de debilidad, sino el primer paso
              hacia tu bienestar.”
            </blockquote>
          </div>
        </div>
      </section>

      {/* ===== Servicios ===== */}
      <section id="servicios" className="bg-zinc-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-zinc-900">
              ¿En qué te puedo acompañar?
            </h2>
            <p className="mt-4 text-zinc-600">
              Procesos terapéuticos personalizados, presenciales u online, según
              lo que necesites.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {SERVICES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-xl bg-teal-50 p-3 text-teal-600">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Cómo trabajo ===== */}
      <section id="enfoque" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-zinc-900">Cómo trabajamos</h2>
          <p className="mt-4 text-zinc-600">
            Un proceso simple y claro, desde el primer contacto.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ n, title, text }) => (
            <div key={n} className="relative rounded-2xl bg-teal-50/60 p-6">
              <span className="text-4xl font-bold text-teal-300">{n}</span>
              <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {text}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {SITE.modalities.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-5 py-2 text-sm font-medium text-teal-800"
            >
              {m.toLowerCase().includes("online") ? (
                <Video size={16} />
              ) : (
                <Users size={16} />
              )}
              {m}
            </span>
          ))}
        </div>
      </section>

      {/* ===== Reservar hora ===== */}
      <section
        id="reservar"
        className="bg-gradient-to-br from-teal-600 to-emerald-600 py-16 md:py-24"
      >
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 md:grid-cols-2">
          <div className="text-white">
            <h2 className="text-3xl font-bold">Reserva tu hora</h2>
            <p className="mt-4 max-w-md text-teal-50">
              Déjame tus datos y te contactaré para coordinar tu primera sesión.
              También puedes escribirme directamente por WhatsApp.
            </p>
            <div className="mt-8 space-y-4">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-teal-50 hover:text-white"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                  <MessageCircle size={20} />
                </span>
                <span className="text-sm">
                  WhatsApp
                  <span className="block font-semibold">Escríbeme aquí</span>
                </span>
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-3 text-teal-50 hover:text-white"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                  <Phone size={20} />
                </span>
                <span className="text-sm">
                  Correo
                  <span className="block font-semibold">{SITE.email}</span>
                </span>
              </a>
            </div>
          </div>
          <BookingForm />
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-zinc-900 py-10 text-zinc-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-semibold text-white">{SITE.professionalName}</p>
            <p className="text-sm">{SITE.professionalTitle}</p>
          </div>
          <div className="text-sm">
            <p>{SITE.city}</p>
            <p>{SITE.email}</p>
          </div>
          <div className="flex flex-col items-center gap-1 sm:items-end">
            <p className="text-xs">
              © {new Date().getFullYear()} {SITE.professionalName}
            </p>
            <Link href="/login" className="text-xs hover:text-white">
              Acceso profesional
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
