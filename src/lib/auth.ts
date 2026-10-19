
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("Falta configurar AUTH_SECRET en el archivo .env");
}

const secretKey = new TextEncoder().encode(secret);

export async function verificarPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function crearTokenSesion(
  user: { id: string; email: string; role: string }
): Promise<string> {
  return new SignJWT({
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey);
}

export async function verificarTokenSesion(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}
