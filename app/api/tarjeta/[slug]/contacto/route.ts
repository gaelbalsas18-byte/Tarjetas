import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

function escaparVCard(valor: string) {
  return valor
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;

  const vendedor = await prisma.seller.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      firstName: true,
      lastName: true,
      displayName: true,
      jobTitle: true,
      department: true,
      phone: true,
      whatsapp: true,
      email: true,
      company: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!vendedor) {
    return NextResponse.json(
      { error: "No se encontró el vendedor." },
      { status: 404 }
    );
  }

  const lineas = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escaparVCard(vendedor.lastName)};${escaparVCard(vendedor.firstName)};;;`,
    `FN:${escaparVCard(vendedor.displayName)}`,
    `ORG:${escaparVCard(vendedor.company.name)}`,
  ];

  if (vendedor.jobTitle) {
    lineas.push(`TITLE:${escaparVCard(vendedor.jobTitle)}`);
  }

  if (vendedor.department) {
    lineas.push(`NOTE:${escaparVCard(`Departamento: ${vendedor.department}`)}`);
  }

  if (vendedor.phone) {
    lineas.push(`TEL;TYPE=WORK,VOICE:${vendedor.phone.replace(/[^\d+]/g, "")}`);
  }

  if (vendedor.whatsapp) {
    lineas.push(`TEL;TYPE=CELL,VOICE:${vendedor.whatsapp.replace(/[^\d+]/g, "")}`);
  }

  if (vendedor.email) {
    lineas.push(`EMAIL;TYPE=WORK:${escaparVCard(vendedor.email)}`);
  }

  lineas.push("END:VCARD");

  const contenido = lineas.join("\r\n") + "\r\n";

  return new Response(contenido, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="contacto-${slug}.vcf"`,
      "Cache-Control": "no-store",
    },
  });
}

