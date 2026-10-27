
export const instant = false;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CodigoQR from "./CodigoQR";
import AccionesTarjeta from "./AccionesTarjeta";
import TarjetaDosCaras from "./TarjetaDosCaras";

type Props = {
  params: Promise<{ slug: string }>;
};

type IconoProps = {
  tipo: "telefono" | "whatsapp" | "correo";
};

function IconoContacto({ tipo }: IconoProps) {
  const estilos = {
    telefono: "#0878F9",
    whatsapp: "#16B85A",
    correo: "#E94C4C",
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="29"
      height="29"
      fill="none"
      stroke={estilos[tipo]}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {tipo === "telefono" && (
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.2 18.8a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.06 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.58 2.8.7A2 2 0 0 1 22 16.92Z" />
      )}

      {tipo === "whatsapp" && (
        <>
          <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.7a8.5 8.5 0 1 1 16.3-3.8Z" />
          <path d="M8.5 7.8c.3-.6.6-.6 1-.6h.4c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4-.1.6l-.7.8c-.2.2-.2.4 0 .6.5.9 1.3 1.7 2.2 2.2.2.1.4.1.6-.1l.9-1c.2-.2.4-.3.7-.2l1.7.8c.3.1.4.3.4.5 0 .3-.2 1.2-.8 1.7-.5.5-1.3.7-2 .5-1-.2-2.2-.8-3.4-1.8a11 11 0 0 1-2.8-3.4c-.5-1-.4-2 .6-2.8Z" />
        </>
      )}

      {tipo === "correo" && (
        <>
          <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
          <path d="m3 6 9 7 9-7" />
        </>
      )}
    </svg>
  );
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: "Tarjeta digital",
    manifest: `/tarjeta/${slug}/manifest.webmanifest`,
  };
}

export default async function TarjetaPage({ params }: Props) {
  const { slug } = await params;

  const vendedor = await prisma.seller.findFirst({
    where: {
      slug,
      isActive: true,
      company: {
        is: {},
      },
    },
    select: {
      firstName: true,
      lastName: true,
      displayName: true,
      jobTitle: true,
      department: true,
      phone: true,
      whatsapp: true,
      photoUrl: true,
      email: true,
      company: {
        select: {
          name: true,
          primaryColor: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!vendedor) {
    notFound();
  }

  const telefono = vendedor.phone?.replace(/[^\d+]/g, "");
  const whatsapp = vendedor.whatsapp?.replace(/\D/g, "");

  const iniciales =
    `${vendedor.firstName.charAt(0)}${vendedor.lastName.charAt(0)}`.toUpperCase();

  const color = /^#[0-9a-fA-F]{6}$/.test(vendedor.company.primaryColor)
    ? vendedor.company.primaryColor
    : "#163B65";

  return (
    <TarjetaDosCaras>
      <section className="overflow-hidden rounded-2xl bg-white">
        {/* Encabezado y datos del vendedor */}
        <div className="px-5 pt-5">
          <div className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-5">
            {vendedor.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vendedor.photoUrl}
                alt={`Fotografía de ${vendedor.displayName}`}
                className="h-[76px] w-[76px] rounded-xl object-cover shadow-sm sm:h-[110px] sm:w-[120px]"
              />
            ) : (
              <div
                className="flex h-[76px] w-[76px] items-center justify-center rounded-xl text-2xl font-bold text-white sm:h-[110px] sm:w-[120px]"
                style={{ backgroundColor: color }}
              >
                {iniciales}
              </div>
            )}

            <div className="min-w-0 text-center">
              {vendedor.department && (
                <p className="text-xs font-medium text-blue-600">
                  {vendedor.department}
                </p>
              )}

              <h1 className="mt-1 break-words text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                {vendedor.displayName}
              </h1>

              {vendedor.jobTitle && (
                <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {vendedor.jobTitle}
                </p>
              )}

              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                {vendedor.company.name}
              </p>
            </div>
          </div>
        </div>

        {/* Iconos de contacto */}
        <div className="mt-6 flex items-center justify-center gap-9">
          {telefono && (
            <a
              href={`tel:${telefono}`}
              aria-label="Llamar al vendedor"
              title="Llamar"
              className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-blue-50"
            >
              <IconoContacto tipo="telefono" />
            </a>
          )}

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              title="WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-green-50"
            >
              <IconoContacto tipo="whatsapp" />
            </a>
          )}

          {vendedor.email && (
            <a
              href={`mailto:${vendedor.email}`}
              aria-label="Enviar correo electrónico"
              title="Correo electrónico"
              className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-red-50"
            >
              <IconoContacto tipo="correo" />
            </a>
          )}
        </div>

        {/* Guardar contacto y acciones existentes */}
        <div className="px-3 pt-5">
          <a
            href={`/api/tarjeta/${encodeURIComponent(slug)}/contacto`}
            className="flex min-h-9 items-center justify-center border border-blue-600 px-1 text-center text-[10px] font-medium text-blue-700 transition hover:bg-blue-50 sm:text-xs"
          >
            Guardar contacto
          </a>

          <AccionesTarjeta />
        </div>

        {/* Código QR */}
        <div className="px-4 pb-5 pt-4 text-center">
          <CodigoQR color={color} />
        </div>

        {/* Franja inferior y logotipo */}
        <footer className="mt-1">
          <div className="h-2 bg-cyan-200" />
          <div className="h-2 bg-sky-400" />
          <div className="h-2 bg-blue-500" />

          <div className="relative flex min-h-[66px] items-center overflow-hidden bg-gradient-to-r from-sky-500 via-blue-600 to-blue-800 px-5 py-3">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />

            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/BalsasTrans.png"
                alt="Logotipo de Balsas Dental"
                className="h-auto max-h-12 w-auto max-w-[150px] object-contain object-left"
              />
            </div>
          </div>
        </footer>
      </section>
    </TarjetaDosCaras>
  );
}
