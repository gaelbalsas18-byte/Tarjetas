export const instant = false;

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verificarTokenSesion } from "@/lib/auth";
import AccionesVendedor from "./AccionesVendedor";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tarjetas_session")?.value;

  if (!token) redirect("/login");

  const session = await verificarTokenSesion(token);

  if (!session?.sub) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      name: true,
      email: true,
      role: true,
      isActive: true,
      companyId: true,
    },
  });

  if (!user || !user.isActive || user.role !== "ADMIN") {
    redirect("/login");
  }

    const vendedores = await prisma.seller.findMany({
      where: {
        companyId: user.companyId,
      },
      select: {
        id: true,
        displayName: true,
        jobTitle: true,
        photoUrl: true,
        slug: true,
        isActive: true,
        cardEvents: {
          select: {
            type: true,
            visitorId: true,
          },
        },
      },
      orderBy: {
        displayName: "asc",
      },
    });

      const vendedoresConEstadisticas = vendedores.map((vendedor) => {
        const visitas = vendedor.cardEvents.filter(
          (evento) =>
            evento.type === "VISIT" || evento.type === "QR_VISIT"
        );

        const visitasQR = vendedor.cardEvents.filter(
          (evento) => evento.type === "QR_VISIT"
        );

        const compartidos = vendedor.cardEvents.filter(
          (evento) => evento.type === "SHARE"
        );

        const visitantesUnicos = new Set(
          visitas
            .map((evento) => evento.visitorId)
            .filter((id): id is string => Boolean(id))
        ).size;

        return {
          ...vendedor,
          estadisticas: {
            visitas: visitas.length,
            visitasQR: visitasQR.length,
            compartidos: compartidos.length,
            visitantesUnicos,
          },
        };
      });



  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-blue-800">
            PANEL DE ADMINISTRACIÓN
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            ¡Bienvenido, {user.name}!
          </h1>

          <p className="mt-3 text-slate-600">
            Administra las tarjetas digitales de tu equipo.
          </p>

          <p className="mt-1 text-sm text-slate-500">{user.email}</p>

          <Link
            href="/vendedores"
            className="mt-5 inline-block rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            + Registrar vendedor
          </Link>
        </header>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Vendedores registrados</h2>
              <p className="mt-1 text-sm text-slate-500">
                Consulta las tarjetas de tu equipo.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
              {vendedores.length} vendedores
            </span>
          </div>

          {vendedores.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-5 text-slate-600">
              Todavía no hay vendedores registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-3 font-medium">Vendedor</th>
                  <th className="px-3 py-3 font-medium">Puesto</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 font-medium">Visitas</th>
                  <th className="px-3 py-3 font-medium">Por QR</th>
                  <th className="px-3 py-3 font-medium">Compartidos</th>
                  <th className="px-3 py-3 font-medium">Visitantes únicos</th>
                  <th className="px-3 py-3 font-medium">Tarjeta</th>
                  <th className="px-3 py-3 font-medium">Acciones</th>
                </tr>
                </thead>

                <tbody>
                  {vendedoresConEstadisticas.map((vendedor) => (
                    <tr
                      key={vendedor.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          {vendedor.photoUrl ? (
                            <img
                              src={vendedor.photoUrl}
                              alt=""
                              className="h-11 w-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-600">
                              {vendedor.displayName
                                .split(" ")
                                .map((parte) => parte[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                          )}

                          <span className="font-semibold">
                            {vendedor.displayName}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        {vendedor.jobTitle || "Sin puesto"}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={
                            vendedor.isActive
                              ? "rounded-full bg-green-100 px-3 py-1 text-green-800"
                              : "rounded-full bg-red-100 px-3 py-1 text-red-800"
                          }
                        >
                          {vendedor.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-semibold tabular-nums text-slate-900">
                        {vendedor.estadisticas.visitas}
                      </td>

                      <td className="px-4 py-4 tabular-nums text-slate-700">
                        {vendedor.estadisticas.visitasQR}
                      </td>

                      <td className="px-4 py-4 tabular-nums text-slate-700">
                        {vendedor.estadisticas.compartidos}
                      </td>

                      <td className="px-4 py-4 tabular-nums text-slate-700">
                        {vendedor.estadisticas.visitantesUnicos}
                      </td>

                      <td className="px-3 py-4">
                        <Link
                          href={`/tarjeta/${vendedor.slug}`}
                          target="_blank"
                          className="font-semibold text-blue-800 hover:underline"
                        >
                          Ver tarjeta ↗
                        </Link>
                      </td>

                      <td className="px-4 py-4">
                        <AccionesVendedor
                          id={vendedor.id}
                          nombre={vendedor.displayName}
                          isActive={vendedor.isActive}
                        />
                     </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <p className="mt-4 text-xs text-slate-500">
          Las estadísticas se actualizan al recargar el panel. Los visitantes
          únicos se estiman mediante un identificador guardado en el navegador;
          si una persona cambia de dispositivo o borra sus datos, puede
          contabilizarse de nuevo.
        </p>
      </div>
    </main>
  );
}