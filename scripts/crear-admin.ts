
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const nombreEmpresa = process.env.COMPANY_NAME;
  const nombreAdmin = process.env.ADMIN_NAME;
  const correoAdmin = process.env.ADMIN_EMAIL;
  const passwordAdmin = process.env.ADMIN_PASSWORD;

  if (
    !databaseUrl ||
    !nombreEmpresa ||
    !nombreAdmin ||
    !correoAdmin ||
    !passwordAdmin
  ) {
    throw new Error(
      "Configura DATABASE_URL, COMPANY_NAME, ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD en .env"
    );
  }

  if (passwordAdmin.length < 12) {
    throw new Error("La contraseña debe tener al menos 12 caracteres.");
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    let empresa = await prisma.company.findFirst({
      where: { name: nombreEmpresa },
    });

    if (!empresa) {
      empresa = await prisma.company.create({
        data: { name: nombreEmpresa },
      });
    }

    const passwordHash = await bcrypt.hash(passwordAdmin, 12);

    const admin = await prisma.user.upsert({
      where: { email: correoAdmin },
      update: {
        name: nombreAdmin,
        passwordHash,
        role: "ADMIN",
        isActive: true,
        companyId: empresa.id,
      },
      create: {
        name: nombreAdmin,
        email: correoAdmin,
        passwordHash,
        role: "ADMIN",
        companyId: empresa.id,
      },
    });

    console.log("Administrador configurado correctamente.");
    console.log("Correo:", admin.email);
    console.log("Empresa:", empresa.name);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("No se pudo crear el administrador:", error);
  process.exitCode = 1;
});
