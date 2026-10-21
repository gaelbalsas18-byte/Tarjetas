
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;

  const manifest = {
    id: `/tarjeta/${slug}`,
    name: "Tarjeta digital",
    short_name: "Tarjeta",
    description: "Tarjeta digital de contacto",
    start_url: `/tarjeta/${slug}`,
    scope: "/tarjeta/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#142b45",
    icons: [
      {
        src: "/Balsas.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/Balsas.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
}
