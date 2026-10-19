export const instant = false;

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CodigoQR from "./CodigoQR";

type Props = {
  params: Promise<{ slug: string }>;
};

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
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="h-32" style={{ backgroundColor: color }} />

        <div className="-mt-16 px-6 pb-8 text-center">
          {vendedor.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendedor.photoUrl}
              alt={`Fotografía de ${vendedor.displayName}`}
              className="mx-auto h-32 w-32 rounded-full border-4 border-white bg-white object-cover shadow-md"
            />
          ) : (
            <div
              className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-white text-3xl font-bold text-white shadow-md"
              style={{ backgroundColor: color }}
            >
              {iniciales}
            </div>
          )}

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {vendedor.company.name}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {vendedor.displayName}
          </h1>

          {vendedor.jobTitle && (
            <p className="mt-2 text-lg font-medium text-slate-700">
              {vendedor.jobTitle}
            </p>
          )}

          {vendedor.department && (
            <p className="mt-1 text-sm text-slate-500">
              {vendedor.department}
            </p>
          )}

          <div className="mt-8 grid grid-cols-2 gap-3">
            {telefono ? (
              <a
                href={`tel:${telefono}`}
                className="rounded-xl px-4 py-3 font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: color }}
              >
                Llamar
              </a>
            ) : (
              <div className="rounded-xl bg-slate-200 px-4 py-3 text-sm text-slate-500">
                Sin teléfono
              </div>
            )}

            {whatsapp ? (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                WhatsApp
              </a>
            ) : (
              <div className="rounded-xl bg-slate-200 px-4 py-3 text-sm text-slate-500">
                Sin WhatsApp
              </div>
            )}
          </div>

          {vendedor.email && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Correo electrónico
              </p>
              <a
                href={`mailto:${vendedor.email}`}
                className="mt-2 block break-all text-sm text-blue-800 hover:underline"
              >
                {vendedor.email}
              </a>
            </div>
          )}

          <a
            href={`/api/tarjeta/${encodeURIComponent(slug)}/contacto`}
            className="mt-6 block w-full rounded-xl border-2 px-4 py-3 font-semibold transition hover:bg-slate-50"
            style={{ borderColor: color, color }}
          >
            Guardar contacto
          </a>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900">
              Comparte tu tarjeta
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              El cliente puede escanear este código para abrir tu tarjeta digital.
            </p>

            <CodigoQR color={color} />

            <p className="mt-3 text-xs text-slate-400">
              Código QR personal del vendedor
            </p>
          </div>

          <p className="mt-5 text-xs text-slate-400">
            Tarjeta de contacto digital
          </p>
        </div>
      </section>
    </main>
  );
}
