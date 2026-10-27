import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";
import { verificarTokenSesion } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("tarjetas_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const session = await verificarTokenSesion(token);

    if (!session?.sub) {
      return NextResponse.json(
        { error: "Tu sesión no es válida." },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        role: true,
        isActive: true,
        companyId: true,
      },
    });

    if (!admin || !admin.isActive || admin.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permiso para consultar vendedores." },
        { status: 403 }
      );
    }

    const vendedores = await prisma.seller.findMany({
      where: {
        companyId: admin.companyId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        jobTitle: true,
        department: true,
        email: true,
        phone: true,
        whatsapp: true,
        photoUrl: true,
        slug: true,
        isActive: true,
      },
      orderBy: {
        displayName: "asc",
      },
    });

    return NextResponse.json({ vendedores });
  } catch (error) {
    console.error("Error al consultar vendedores:", error);

    return NextResponse.json(
      { error: "No se pudieron consultar los vendedores." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verificar la sesión
    const cookieStore = await cookies();
    const token = cookieStore.get("tarjetas_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const session = await verificarTokenSesion(token);

    if (!session?.sub) {
      return NextResponse.json(
        { error: "Tu sesión no es válida." },
        { status: 401 }
      );
    }

    // 2. Comprobar permisos del administrador
    const admin = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        role: true,
        isActive: true,
        companyId: true,
      },
    });

    if (!admin || !admin.isActive || admin.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permiso para registrar vendedores." },
        { status: 403 }
      );
    }

    // 3. Recibir el formulario, incluida la fotografía
    const formData = await request.formData();
    const obtenerTexto = (campo: string) => {
      const valor = formData.get(campo);
      return typeof valor === "string" ? valor.trim() : "";
    };

    const firstName = obtenerTexto("firstName");
    const lastName = obtenerTexto("lastName");
    const jobTitle = obtenerTexto("jobTitle");
    const department = obtenerTexto("department");
    const email = obtenerTexto("email").toLowerCase();
    const phone = obtenerTexto("phone");
    const whatsapp = obtenerTexto("whatsapp");
    const photo = formData.get("photo");

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "El nombre y el apellido son obligatorios." },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido." },
        { status: 400 }
      );
    }

    // 4. Validar la fotografía
    let photoUrl: string | null = null;

    if (photo instanceof File && photo.size > 0) {
      if (!photo.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Selecciona un archivo de imagen." },
          { status: 400 }
        );
      }

      if (photo.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "La fotografía no debe superar los 5 MB." },
          { status: 400 }
        );
      }

      const permitidos = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!permitidos.includes(photo.type)) {
        return NextResponse.json(
          { error: "Utiliza una imagen JPG, PNG o WEBP." },
          { status: 400 }
        );
      }

      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        return NextResponse.json(
          { error: "Faltan las credenciales de Cloudinary en .env." },
          { status: 500 }
        );
      }

      // 5. Subir la imagen a Cloudinary
      const bytes = await photo.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const dataUri = `data:${photo.type};base64,${base64}`;
      const subida = await cloudinary.uploader.upload(dataUri, {
        folder: "tarjetas/vendedores",
        resource_type: "image",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });

      photoUrl = subida.secure_url;
    }

    // 6. Generar un slug único
    const baseSlug =
      `${firstName}-${lastName}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "vendedor";

    let slug = baseSlug;
    let intento = 1;

    while (
      await prisma.seller.findUnique({
        where: { slug },
        select: { id: true },
      })
    ) {
      slug = `${baseSlug}-${intento}`;
      intento++;
    }

    // 7. Guardar los datos en Neon
    const vendedor = await prisma.seller.create({
      data: {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        jobTitle: jobTitle || null,
        department: department || null,
        email: email || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        photoUrl,
        slug,
        companyId: admin.companyId,
      },
      select: {
        id: true,
        displayName: true,
        slug: true,
        photoUrl: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        mensaje: "Vendedor registrado correctamente.",
        vendedor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar vendedor:", error);

    return NextResponse.json(
      { error: "No se pudo registrar al vendedor. Revisa la terminal." },
      { status: 500 }
    );
  }
}
