"use client";

import { useState } from "react";

export default function AccionesTarjeta() {
  const [mensaje, setMensaje] = useState("");
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  async function compartirTarjeta() {
  const url = window.location.href;

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
      setMensaje("No se pudo compartir. Copia el enlace desde el navegador.");
    }
  }

  async function copiarEnlace() {
        try {
        await navigator.clipboard.writeText(window.location.href);
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
            2. Selecciona “Añadir a pantalla de inicio” o “Instalar aplicación”, si aparece.
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
