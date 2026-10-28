import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TIPOS_EVENTO = ["VISIT", "QR_VISIT", "SHARE"] as const;

type TipoEvento = (typeof TIPOS_EVENTO)[number];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const type = body?.type;
    const visitorId = body?.visitorId;

    if (
      typeof type !== "string" ||
      !TIPOS_EVENTO.includes(type as TipoEvento)
    ) {
      return NextResponse.json(
        { error: "Tipo de evento no válido." },
        { status: 400 }
      );
    }

    if (
      visitorId !== undefined &&
      (typeof visitorId !== "string" || visitorId.length > 100)
    ) {
      return NextResponse.json(
        { error: "Identificador de visitante no válido." },
        { status: 400 }
      );
    }

    const vendedor = await prisma.seller.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!vendedor) {
      return NextResponse.json(
        { error: "Tarjeta no encontrada." },
        { status: 404 }
      );
    }

    await prisma.cardEvent.create({
      data: {
        type: type as TipoEvento,
        visitorId: visitorId || null,
        sellerId: vendedor.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al registrar evento de tarjeta:", error);

    return NextResponse.json(
      { error: "No se pudo registrar el evento." },
      { status: 500 }
    );
  }
}
