"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function TarjetaDosCaras({ children }: Props) {
  const [volteada, setVolteada] = useState(false);
  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setVolteada(true);
    }, 3000);

    return () => window.clearTimeout(temporizador);
  }, []);

  return (
    <main className="min-h-screen bg-white px-3 py-5 sm:px-5 sm:py-8">
      <div className="mx-auto max-w-md">

        {/* Contenedor de las dos caras */}
        <div
          className="grid"
          style={{ perspective: "1200px" }}
        >
          <div
            className="grid transition-transform duration-700 ease-in-out"
            style={{
              gridArea: "1 / 1",
              transformStyle: "preserve-3d",
              transform: volteada ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >

            {/* CARA FRONTAL */}
            <section
              aria-label="Portada de Balsas Dental"
              className="relative flex min-h-[390px] flex-col overflow-hidden rounded-2xl bg-[#07105E] shadow-lg"
              style={{
                gridArea: "1 / 1",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {/* Franjas azules superiores */}
              <div className="shrink-0">
                <div className="h-8 bg-[#A0FFFF]" />
                <div className="h-9 bg-[#66B9FF]" />
                <div className="h-10 bg-[#2994F5]" />
                <div className="h-11 bg-[#0878F9]" />
                <div className="h-12 bg-[#0863C4]" />
              </div>

              {/* Fondo azul marino y logotipo centrado */}
              <div className="flex flex-1 items-center justify-center bg-[#07105E] p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/BalsasTrans.png"
                  alt="Balsas Dental"
                  className="h-auto max-h-36 w-auto max-w-[85%] object-contain"
                />
              </div>

              {/* Acción para pasar a la otra cara */}
              <button
                type="button"
                onClick={() => setVolteada(true)}
                className="absolute bottom-3 right-3 rounded-full bg-white/15 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/25"
              >
                Ver tarjeta →
              </button>
            </section>

            {/* CARA POSTERIOR */}
            <section
              aria-label="Información de contacto del vendedor"
              className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-lg"
              style={{
                gridArea: "1 / 1",
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {children}

              <div className="flex justify-center px-4 pb-4">
                <button
                  type="button"
                  onClick={() => setVolteada(false)}
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  ↻ Volver a la portada
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
