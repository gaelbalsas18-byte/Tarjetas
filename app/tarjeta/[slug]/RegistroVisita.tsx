
"use client";

import { useEffect, useRef } from "react";

type Props = {
  slug: string;
};

function obtenerVisitorId() {
  const clave = "balsas_visitor_id";

  try {
    let id = localStorage.getItem(clave);

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(clave, id);
    }

    return id;
  } catch {
    return undefined;
  }
}

export default function RegistroVisita({ slug }: Props) {
  const enviado = useRef(false);

  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;

    const visitorId = obtenerVisitorId();

    const url = new URL(window.location.href);
    const type =
      url.searchParams.get("origen") === "qr"
        ? "QR_VISIT"
        : "VISIT";

    fetch(`/api/tarjeta/${encodeURIComponent(slug)}/evento`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        visitorId,
      }),
      keepalive: true,
    }).catch(() => {
      // Un error de estadísticas no debe afectar la tarjeta.
    });
  }, [slug]);

  return null;
}
