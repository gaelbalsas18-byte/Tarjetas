
"use client";

import { useEffect, useState, type FormEvent } from "react";

export default function VendedoresPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    jobTitle: "",
    department: "",
    email: "",
    phone: "",
    whatsapp: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(photo);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function actualizarCampo(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  function seleccionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];

    if (!archivo) {
      setPhoto(null);
      return;
    }

    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

    if (!tiposPermitidos.includes(archivo.type)) {
      setMensaje("Selecciona una imagen JPG, PNG o WEBP.");
      e.target.value = "";
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setMensaje("La fotografía no debe superar los 5 MB.");
      e.target.value = "";
      return;
    }

    setMensaje("");
    setPhoto(archivo);
  }

  async function guardarVendedor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGuardando(true);
    setMensaje("Guardando vendedor y fotografía...");

    try {
      const datos = new FormData();

      Object.entries(form).forEach(([clave, valor]) => {
        datos.append(clave, valor);
      });

      if (photo) {
        datos.append("photo", photo);
      }

      const respuesta = await fetch("/api/vendedores", {
        method: "POST",
        body: datos,
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(resultado.error || "No se pudo guardar el vendedor.");
        return;
      }

      setMensaje(
        `¡Vendedor registrado! Tarjeta: /tarjeta/${resultado.vendedor.slug}`
      );

      setForm({
        firstName: "",
        lastName: "",
        jobTitle: "",
        department: "",
        email: "",
        phone: "",
        whatsapp: "",
      });

      setPhoto(null);

      const selector = document.getElementById(
        "photo"
      ) as HTMLInputElement | null;

      if (selector) selector.value = "";
    } catch (error) {
      console.error("Error al registrar vendedor:", error);
      setMensaje("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  }

  const campos = [
    { name: "firstName", label: "Nombre", required: true },
    { name: "lastName", label: "Apellido", required: true },
    { name: "jobTitle", label: "Puesto" },
    { name: "department", label: "Departamento" },
    { name: "email", label: "Correo electrónico", type: "email" },
    { name: "phone", label: "Teléfono", type: "tel" },
    { name: "whatsapp", label: "WhatsApp", type: "tel" },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10 text-black">
      <div className="mx-auto max-w-3xl">
        <a
          href="/admin"
          className="text-sm font-medium text-blue-800 hover:underline"
        >
          ← Volver al panel
        </a>

        <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold text-blue-800">
            ADMINISTRACIÓN
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Registrar vendedor
          </h1>

          <p className="mt-2 text-slate-600">
            Completa los datos para crear su tarjeta digital.
          </p>

          <form onSubmit={guardarVendedor} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {campos.map((campo) => (
                <div key={campo.name}>
                  <label
                    htmlFor={campo.name}
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    {campo.label}
                    {"required" in campo && campo.required ? " *" : ""}
                  </label>

                  <input
                    id={campo.name}
                    name={campo.name}
                    type={"type" in campo ? campo.type : "text"}
                    value={form[campo.name as keyof typeof form]}
                    onChange={actualizarCampo}
                    required={"required" in campo && campo.required}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>

            <div>
              <label
                htmlFor="photo"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Fotografía del vendedor
              </label>

              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={seleccionarFoto}
                className="block w-full rounded-lg border border-slate-300 p-3 text-sm"
              />

              <p className="mt-1 text-xs text-slate-500">
                Formatos JPG, PNG o WEBP. Máximo 5 MB.
              </p>

              {preview && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-slate-600">
                    Vista previa
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Vista previa de la fotografía"
                    className="h-32 w-32 rounded-full border object-cover"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="w-full rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {guardando ? "Guardando..." : "Guardar vendedor"}
            </button>

            {mensaje && (
              <p role="status" className="break-words text-sm text-blue-800">
                {mensaje}
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
