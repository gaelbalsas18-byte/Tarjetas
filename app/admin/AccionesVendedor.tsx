"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  nombre: string;
  isActive: boolean;
};

type DatosVendedor = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  email: string;
  phone: string;
  whatsapp: string;
  photoUrl: string | null;
};

const datosVacios: DatosVendedor = {
  firstName: "",
  lastName: "",
  jobTitle: "",
  department: "",
  email: "",
  phone: "",
  whatsapp: "",
  photoUrl: null,
};

export default function AccionesVendedor({
  id,
  nombre,
  isActive,
}: Props) {
  const router = useRouter();

  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datos, setDatos] = useState<DatosVendedor>(datosVacios);
  const [fotografia, setFotografia] = useState<File | null>(null);

  async function cambiarEstado() {
    const nuevoEstado = !isActive;

    const confirmar = window.confirm(
      nuevoEstado
        ? `¿Quieres activar la tarjeta de ${nombre}?`
        : `¿Quieres desactivar la tarjeta de ${nombre}?`
    );

    if (!confirmar) return;

    setGuardando(true);
    setMensaje("");

    try {
      const respuesta = await fetch(`/api/vendedores/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: nuevoEstado }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(resultado.error || "No se pudo cambiar el estado.");
        return;
      }

      setMensaje(resultado.mensaje || "Estado actualizado.");
      router.refresh();
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  }

  async function abrirEdicion() {
    setCargando(true);
    setMensaje("");
    setFotografia(null);

    try {
      const respuesta = await fetch("/api/vendedores");
      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(resultado.error || "No se pudieron cargar los datos.");
        return;
      }

      const vendedor = resultado.vendedores?.find(
        (item: {
          id: string;
          firstName: string;
          lastName: string;
          jobTitle: string | null;
          department: string | null;
          email: string | null;
          phone: string | null;
          whatsapp: string | null;
          photoUrl: string | null;
        }) => item.id === id
      );

      if (!vendedor) {
        setMensaje("No se encontró el vendedor.");
        return;
      }

      setDatos({
        firstName: vendedor.firstName || "",
        lastName: vendedor.lastName || "",
        jobTitle: vendedor.jobTitle || "",
        department: vendedor.department || "",
        email: vendedor.email || "",
        phone: vendedor.phone || "",
        whatsapp: vendedor.whatsapp || "",
        photoUrl: vendedor.photoUrl || null,
      });

      setModalAbierto(true);
    } catch {
      setMensaje("No se pudieron cargar los datos del vendedor.");
    } finally {
      setCargando(false);
    }
  }

  
async function eliminarVendedor() {
  const confirmacion = window.confirm(
    `¿Estás seguro de eliminar permanentemente la tarjeta de ${nombre}?\n\nEsta acción no se puede deshacer y el enlace de su tarjeta dejará de funcionar.`
  );

  if (!confirmacion) return;

  const segundaConfirmacion = window.confirm(
    `Confirma por segunda vez: ¿quieres eliminar a ${nombre} definitivamente?`
  );

  if (!segundaConfirmacion) return;

  setGuardando(true);
  setMensaje("");

  try {
    const respuesta = await fetch(`/api/vendedores/${id}`, {
      method: "DELETE",
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      setMensaje(resultado.error || "No se pudo eliminar al vendedor.");
      return;
    }

    setMensaje(resultado.mensaje || "Vendedor eliminado correctamente.");
    router.refresh();
  } catch {
    setMensaje("No se pudo conectar con el servidor.");
  } finally {
    setGuardando(false);
  }
}


  function cambiarCampo(
    campo: keyof Omit<DatosVendedor, "photoUrl">,
    valor: string
  ) {
    setDatos((actuales) => ({
      ...actuales,
      [campo]: valor,
    }));
  }

  async function guardarEdicion(
    evento: React.FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();
    setGuardando(true);
    setMensaje("");

    try {
      const formData = new FormData();

      formData.append("firstName", datos.firstName);
      formData.append("lastName", datos.lastName);
      formData.append("jobTitle", datos.jobTitle);
      formData.append("department", datos.department);
      formData.append("email", datos.email);
      formData.append("phone", datos.phone);
      formData.append("whatsapp", datos.whatsapp);

      if (fotografia) {
        formData.append("photo", fotografia);
      }

      const respuesta = await fetch(`/api/vendedores/${id}`, {
        method: "PUT",
        body: formData,
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(resultado.error || "No se pudieron guardar los cambios.");
        return;
      }

      setModalAbierto(false);
      setFotografia(null);
      setMensaje(resultado.mensaje || "Tarjeta actualizada correctamente.");
      router.refresh();
    } catch {
      setMensaje("No se pudieron guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={abrirEdicion}
          disabled={cargando || guardando}
          className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-200 disabled:opacity-50"
        >
          {cargando ? "Cargando..." : "Editar"}
        </button>

        <button
          type="button"
          onClick={cambiarEstado}
          disabled={guardando || cargando}
          className={`rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 ${
            isActive
              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          {guardando
            ? "Guardando..."
            : isActive
              ? "Desactivar"
              : "Activar"}
        </button>
     
        <button
        type="button"
        onClick={eliminarVendedor}
        disabled={guardando}
        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
        {guardando ? "Procesando..." : "Eliminar"}
        </button>


        {mensaje && !modalAbierto && (
          <p role="status" className="max-w-48 text-xs text-slate-600">
            {mensaje}
          </p>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Editar tarjeta
                </h2>
                <p className="mt-1 text-sm text-slate-500">{nombre}</p>
              </div>

              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                disabled={guardando}
                aria-label="Cerrar"
                className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarEdicion} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Nombre *
                  <input
                    required
                    value={datos.firstName}
                    onChange={(e) =>
                      cambiarCampo("firstName", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Apellidos *
                  <input
                    required
                    value={datos.lastName}
                    onChange={(e) =>
                      cambiarCampo("lastName", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Puesto
                  <input
                    value={datos.jobTitle}
                    onChange={(e) =>
                      cambiarCampo("jobTitle", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Departamento
                  <input
                    value={datos.department}
                    onChange={(e) =>
                      cambiarCampo("department", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  Correo electrónico
                  <input
                    type="email"
                    value={datos.email}
                    onChange={(e) => cambiarCampo("email", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Teléfono
                  <input
                    type="tel"
                    value={datos.phone}
                    onChange={(e) => cambiarCampo("phone", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  WhatsApp
                  <input
                    type="tel"
                    value={datos.whatsapp}
                    onChange={(e) =>
                      cambiarCampo("whatsapp", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Fotografía nueva (JPG, PNG o WEBP; máximo 5 MB)
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      setFotografia(e.target.files?.[0] || null)
                    }
                    className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-semibold hover:file:bg-slate-200"
                  />
                </label>

                {fotografia && (
                  <p className="mt-2 text-sm text-slate-600">
                    Nueva fotografía: {fotografia.name}
                  </p>
                )}

                {!fotografia && datos.photoUrl && (
                  <p className="mt-2 text-sm text-slate-500">
                    Se conservará la fotografía actual si no seleccionas otra.
                  </p>
                )}
              </div>

              {mensaje && (
                <p role="alert" className="text-sm text-red-600">
                  {mensaje}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  disabled={guardando}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
