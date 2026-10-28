"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  color: string;
};

export default function CodigoQR({ color }: Props) {
  const [imagenQR, setImagenQR] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    setImagenQR("");
    setError("");

    const url = new URL(window.location.href);
      url.searchParams.set("origen", "qr");
      const direccion = url.toString();

    QRCode.toDataURL(direccion, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: color,
        light: "#FFFFFF",
      },
    })
      .then((imagen) => {
        if (activo) setImagenQR(imagen);
      })
      .catch(() => {
        if (activo) {
          setError("No se pudo generar el código QR.");
        }
      });

    return () => {
      activo = false;
    };
  }, [color]);

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {imagenQR ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagenQR}
          alt="Código QR de la tarjeta digital"
          className="h-40 w-40 rounded-lg border border-slate-100 bg-white p-1"
        />
      ) : (
        <div
          role="status"
          className="flex h-40 w-40 items-center justify-center rounded-lg bg-slate-50 text-center text-xs text-slate-500"
        >
          Generando QR...
        </div>
      )}
    </div>
  );
}
