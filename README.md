# Natalia Anton Klickmann · Psicología 🩺

Proyecto con dos partes que conviven en la misma aplicación:

1. **Sitio web público** (`/`) — la página de la consulta de Natalia Anton Klickmann, Licenciada en Psicología. Presenta sus servicios y permite **solicitar una hora online**.
2. **Software de gestión** (`/panel`) — privado, protegido con login. Agenda de citas, fichas de pacientes, notas de sesión, informes en PDF, recordatorios por WhatsApp, pagos y las solicitudes recibidas desde la web.

Todo es responsivo (celular, tablet y computador) e instalable como app desde el navegador.

## Cómo se conectan la web y el software

Cuando un visitante completa el formulario de **"Reservar hora"** en la web pública, la solicitud se guarda en la base de datos y aparece automáticamente en la sección **Solicitudes** del panel, con un aviso en el inicio. Desde ahí Natalia puede responder por WhatsApp, crear la ficha del paciente con un clic y marcar el estado (nueva / contactada / agendada / descartada).

## Personalizar el sitio web

Los datos públicos (nombre, teléfono de WhatsApp, correo, ciudad, textos) se editan en un solo archivo: [`src/lib/site.ts`](src/lib/site.ts). **Importante:** cambia el `whatsappPhone` y el `email` por los reales antes de publicar.

## Funcionalidades del panel

- **Agenda**: calendario semanal con citas, estados (pendiente, confirmada, completada, cancelada, no asistió) y modalidad presencial/online.
- **Pacientes**: ficha completa con datos personales, antecedentes y búsqueda por nombre o RUT.
- **Notas de sesión**: historial clínico privado por paciente.
- **Informes PDF**: redacta el informe y descárgalo con formato profesional (encabezado, datos del paciente y firma).
- **Recordatorios WhatsApp**: un clic abre WhatsApp con el mensaje de recordatorio ya escrito.
- **Pagos**: registro por paciente, resumen mensual de ingresos.
- **Privado y seguro**: requiere inicio de sesión; los datos viven en tu propia base de datos Supabase con Row Level Security.

## Puesta en marcha (una sola vez)

### 1. Crear el proyecto en Supabase (gratis)

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta.
2. Crea un **New project** (elige una contraseña de base de datos y la región más cercana, ej. São Paulo).
3. Cuando termine de crearse, ve a **SQL Editor → New query**, pega TODO el contenido de [`supabase/schema.sql`](supabase/schema.sql) y presiona **Run**.

### 2. Crear el usuario de tu esposa

1. En Supabase ve a **Authentication → Users → Add user → Create new user**.
2. Ingresa su correo y una contraseña. Marca **Auto Confirm User**.

> No hay página de registro público a propósito: solo entran los usuarios que tú crees aquí.

### 3. Conectar la app

1. En Supabase ve a **Project Settings → API** (o *Data API*).
2. Copia la **Project URL** y la **anon/public key**.
3. Pégalas en el archivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Probar en tu computador

```bash
npm install
npm run dev
```

Abre http://localhost:3000 e inicia sesión con el usuario creado en el paso 2.

## Publicar en internet (para usarla desde el celular)

La forma más fácil y gratuita es [Vercel](https://vercel.com):

1. Sube el proyecto a un repositorio de GitHub (privado).
2. En Vercel: **Add New → Project → importa el repositorio**.
3. En **Environment Variables** agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con los mismos valores de `.env.local`.
4. Deploy. Te dará una URL tipo `https://agenda-clinica.vercel.app`.

- La **web pública** quedará en la raíz (`https://...vercel.app/`).
- El **panel privado** en `https://...vercel.app/panel` (botón discreto "Acceso profesional" en el sitio).

En el celular, abre la URL del panel en Chrome/Safari y usa **"Agregar a pantalla de inicio"**: queda instalada como una app con su propio ícono.

## Primeros pasos dentro del panel

1. Ve a **Ajustes** y completa el nombre profesional, título y valor de la sesión (aparecen en los PDF y recordatorios).
2. Crea pacientes en **Pacientes → Nuevo paciente** (o desde una solicitud web en **Solicitudes**).
3. Agenda citas en **Agenda → Nueva cita**.
4. Desde la ficha del paciente puedes escribir notas de sesión, generar informes PDF y registrar pagos.
5. Revisa las reservas que llegan desde la web en **Solicitudes**.

## Tecnología

- [Next.js 16](https://nextjs.org) + React 19 + Tailwind CSS 4
- [Supabase](https://supabase.com) (PostgreSQL + Auth, con Row Level Security)
- jsPDF para los informes
- PWA instalable en celular y escritorio
