
"use client";

import { useState } from "react";

export default function AccionesTarjeta() {
  const [mensaje, setMensaje] = useState("");
  const [mostrarAyuda, setMostrarAyuda] = useState(false);

  async function compartirTarjeta() {
    const direccion = new URL(window.location.href);

    // Evitar conservar parámetros de origen anteriores.
    direccion.searchParams.delete("origen");

    // Identificar las visitas que llegan desde un enlace compartido.
    direccion.searchParams.set("origen", "compartido");

    const url = direccion.toString();

    // Registrar el clic en compartir sin bloquear la acción.
    try {
      const visitorId = localStorage.getItem("balsas_visitor_id");
      const segmentos = window.location.pathname
        .split("/")
        .filter(Boolean);

      const slug = segmentos[segmentos.length - 1];

      if (slug) {
        void fetch(
          `/api/tarjeta/${encodeURIComponent(slug)}/evento`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "SHARE",
              visitorId: visitorId || undefined,
            }),
            keepalive: true,
          }
        ).catch(() => {});
      }
    } catch {
      // Un error de estadísticas no debe impedir compartir.
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Tarjeta digital",
          text: "Te comparto esta tarjeta de contacto.",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setMensaje("Enlace copiado. Ya puedes compartirlo.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setMensaje(
        "No se pudo compartir. Copia el enlace desde el navegador."
      );
    }
  }

  async function copiarEnlace() {
    try {
      const direccion = new URL(window.location.href);
      direccion.searchParams.delete("origen");

      await navigator.clipboard.writeText(direccion.toString());
      setMensaje("Enlace copiado correctamente.");
    } catch {
      setMensaje("Abre el menú del navegador para copiar el enlace.");
    }
  }

  return (
    <div className="mt-6 space-y-3">
      <button
        type="button"
        onClick={compartirTarjeta}
        className="flex min-h-9 items-center justify-center border border-blue-600 px-1 text-center text-[10px] font-medium text-blue-700 transition hover:bg-blue-50 sm:text-xs"
      >
        Compartir tarjeta
      </button>

      <button
        type="button"
        onClick={() => {
          setMostrarAyuda(!mostrarAyuda);
          setMensaje("");
        }}
        className="flex min-h-9 items-center justify-center border border-blue-600 px-1 text-center text-[10px] font-medium text-blue-700 transition hover:bg-blue-50 sm:text-xs"
      >
        Guardar en pantalla de inicio
      </button>

      {mostrarAyuda && (
        <div className="rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-700">
          <h3 className="font-bold text-slate-900">
            Guarda esta tarjeta en tu teléfono
          </h3>

          <p className="mt-3 font-semibold">iPhone (Safari)</p>
          <p className="mt-1">
            1. Pulsa el botón Compartir del navegador.
            <br />
            2. Selecciona “Añadir a pantalla de inicio”.
            <br />
            3. Pulsa “Añadir”.
          </p>

          <p className="mt-3 font-semibold">Android (Chrome)</p>
          <p className="mt-1">
            1. Abre el menú de los tres puntos del navegador.
            <br />
            2. Selecciona “Añadir a pantalla de inicio” o “Instalar
            aplicación”, si aparece.
            <br />
            3. Confirma la acción.
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Las opciones pueden variar según el navegador y el teléfono.
            Añade esta tarjeta desde su propia página para conservar el
            enlace del vendedor.
          </p>
        </div>
      )}

      {mensaje && (
        <p role="status" className="text-sm text-slate-600">
          {mensaje}
        </p>
      )}
    </div>
  );
}
