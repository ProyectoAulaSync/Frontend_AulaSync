import { UserGroup, GraduationCap, MessageSquare, MonitorUp, Users, Video } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

const funciones = [
  { Icono: MessageSquare, titulo: "Chat con historial", texto: "Conversa en tiempo real y recupera los mensajes cuando vuelvas." },
  { Icono: Video, titulo: "Video y audio", texto: "Habla y mira a tu grupo con baja latencia." },
  { Icono: MonitorUp, titulo: "Pantalla compartida", texto: "Muestra tus apuntes y documentos a tu grupo." },
];

const pasos = [
  { titulo: "Crea tu cuenta", texto: "Regístrate en menos de un minuto con tu correo institucional o personal para comenzar." },
  { titulo: "Crea una sala o únete con su ID", texto: "Organiza una nueva sala de trabajo con un código único o accede a la reunión de tus compañeros." },
  { titulo: "Estudia con tu grupo", texto: "Revisen ejercicios, compartan referencias y avancen juntos en tiempo real y sin interrupciones." },
];

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mx-auto max-w-6xl px-4 py-10">
      <h2 id={id}>{titulo}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function InicioPage() {
  usePageTitle("Inicio");
  return (
    <>
      <div className="bg-gradient-to-b from-primary-tint to-bg">
        <section aria-labelledby="titulo-hero" className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md border border-border-decor bg-primary-tint px-2 py-1 text-sm text-primary-active">
              <GraduationCap aria-hidden="true" className="h-4 w-4" />
              Plataforma académica accesible
            </p>
            <h1 id="titulo-hero" className="mt-4 text-4xl">
              Estudia en grupo, estés donde estés
            </h1>
            <p className="mt-4 max-w-prose text-text-muted">
              Crea una sala, invita a tu grupo y estudien juntos con chat, videollamada y pantalla compartida.
            </p>
          </div>

          {/* Ilustración decorativa: sustituir por la fotografía del prototipo cuando esté en /public */}
          <div aria-hidden="true" className="relative flex min-h-64 items-end rounded-xl bg-gradient-to-br from-primary to-primary-active p-4">
            <Users className="absolute right-6 top-6 h-24 w-24 text-white/30" />
            <div className="flex w-full items-center gap-3 rounded-lg bg-white p-3 text-ink shadow-sm">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <div className="text-sm">
                <p className="font-bold">Sala: Álgebra Lineal Grupo 4</p>
                <p className="text-text-muted">5 participantes conectados</p>
              </div>
              <Video className="ml-auto h-5 w-5 text-primary" />
            </div>
          </div>
        </section>
      </div>

      <div className="bg-surface">
        <Seccion id="titulo-funciones" titulo="¿Qué puedes hacer?">
          <ul className="grid gap-6 md:grid-cols-3">
            {funciones.map(({ Icono, titulo, texto }) => (
              <li key={titulo} className="rounded-xl border border-border-decor bg-white p-6 shadow-sm">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-tint text-primary">
                  <Icono className="h-5 w-5" />
                </span>
                <h3 className="mt-4">{titulo}</h3>
                <p className="mt-2 text-text-muted">{texto}</p>
              </li>
            ))}
          </ul>
        </Seccion>
      </div>

      <Seccion id="titulo-pasos" titulo="Cómo funciona">
        <ol className="grid gap-6 md:grid-cols-3">
          {pasos.map(({ titulo, texto }, i) => (
            <li key={titulo} className="rounded-xl border border-border-decor bg-white p-6 shadow-sm">
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-tint font-heading font-bold text-primary">
                {i + 1}
              </span>
              <h3 className="mt-4">
                <span className="sr-only">Paso {i + 1}: </span>
                {titulo}
              </h3>
              <p className="mt-2 text-text-muted">{texto}</p>
            </li>
          ))}
        </ol>
      </Seccion>

      <div className="mx-auto max-w-6xl px-4 pb-12">
        <section aria-labelledby="titulo-accesibilidad" className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-primary-tint p-6">
          <div className="flex items-center gap-4">
            <UserGroup aria-hidden="true" className="h-8 w-8 shrink-0 text-primary-active" />
            <div>
              <h2 id="titulo-accesibilidad" className="text-xl">Pensado para todas las personas</h2>
              <p className="text-text-muted">Funciona solo con teclado y con lector de pantalla.</p>
            </div>
          </div>
          <Link to="/accesibilidad">Conocer pautas de accesibilidad</Link>
        </section>
      </div>
    </>
  );
}
