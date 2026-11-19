import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";
import { database } from "./db";

async function sendEmail(to: string, subject: string, text: string) {
  const transport = process.env.SMTP_URL;
  const from = process.env.SMTP_FROM;
  if (!transport || !from) throw new Error("Configura SMTP_URL y SMTP_FROM.");
  await nodemailer.createTransport(transport).sendMail({ from, to, subject, text });
}

function configureAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!secret || secret.length < 32 || !baseURL) throw new Error("Configura BETTER_AUTH_SECRET y BETTER_AUTH_URL.");

  return betterAuth({
    secret,
    baseURL,
    database: prismaAdapter(database(), { provider: "postgresql", transaction: true }),
    disabledPaths: ["/update-user"],
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const name = user.name.trim();
            if (!name || name.length > 100) throw new APIError("BAD_REQUEST", { message: "Nombre inválido." });
            return { data: { ...user, name } };
          },
        },
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail(user.email, "Verifica tu correo", "Abre este enlace para verificar tu cuenta.\n\n" + url);
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 1800,
      sendResetPassword: async ({ user, url }) => {
        await sendEmail(user.email, "Recupera tu contraseña", "Abre este enlace para cambiar tu contraseña. Caduca en 30 minutos.\n\n" + url);
      },
    },
    rateLimit: { enabled: true, storage: "database" },
    plugins: [nextCookies()],
  });
}

let instance: ReturnType<typeof configureAuth> | undefined;
export function authentication() {
  return instance ??= configureAuth();
}

export async function currentUser() {
  const session = await authentication().api.getSession({ headers: await headers() });
  if (!session) return null;
  return database().user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/ingresar");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "administrador") redirect("/cuenta?error=permisos");
  return user;
}
