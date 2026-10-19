
"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  color: string;
};

export default function CodigoQR({ color }: Props) {
  const [url, setUrl] = useState("");
  const [imagenQR, setImagenQR] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const direccion = window.location.href;
    setUrl(direccion);

    QRCode.toDataURL(direccion, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: color,
        light: "#FFFFFF",
      },
    })
      .then(setImagenQR)
      .catch(() => setError("No se pudo generar el código QR."));
  }, [color]);

  if (error) {
    return <p className="mt-4 text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="mt-4 flex flex-col items-center">
      {imagenQR ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagenQR}
          alt="Código QR de la tarjeta digital"
          className="h-64 w-64 rounded-xl border border-slate-100 bg-white p-2"
        />
      ) : (
        <div className="flex h-64 w-64 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
          Generando QR...
        </div>
      )}

      <button
        type="button"
        disabled={!imagenQR}
        onClick={() => {
          if (!imagenQR) return;

          const enlace = document.createElement("a");
          enlace.href = imagenQR;
          enlace.download = "codigo-qr-tarjeta.png";
          enlace.click();
        }}
        className="mt-4 w-full rounded-xl px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: color }}
      >
        Descargar código QR
      </button>

      <button
        type="button"
        disabled={!url}
        onClick={async () => {
          if (!url) return;

          try {
            await navigator.clipboard.writeText(url);
          } catch {
            window.prompt("Copia la dirección de tu tarjeta:", url);
          }
        }}
        className="mt-3 text-sm font-medium text-blue-800 hover:underline disabled:opacity-50"
      >
        Copiar enlace de la tarjeta
      </button>
    </div>
  );
}
