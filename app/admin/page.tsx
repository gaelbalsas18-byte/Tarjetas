export const instant = false;
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verificarTokenSesion } from "@/lib/auth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tarjetas_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verificarTokenSesion(token);

  if (!session?.sub) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-blue-800">
            PANEL DE ADMINISTRACIÓN
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            ¡Bienvenido, {user.name}!
          </h1>

          <p className="mt-3 text-slate-600">
            Has iniciado sesión correctamente.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {user.email}
          </p>
        </header>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Vendedores
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Aquí gestionaremos las tarjetas digitales de tu equipo.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Empresa
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Aquí configuraremos el logotipo y los colores corporativos.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
