"use client";

import { createAuthClient } from "better-auth/react";
import { useState, type FormEvent } from "react";

const auth = createAuthClient();

export function AuthForm({ mode, token }: { mode: "login" | "register" | "forgot" | "reset"; token?: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const hasEmail = mode !== "reset";
  const hasPassword = mode !== "forgot";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "forgot") {
        const result = await auth.requestPasswordReset({ email, redirectTo: "/restablecer" });
        setMessage(result.error ? "No pudimos procesar la solicitud. Intenta más tarde." : "Si existe una cuenta con ese correo, recibirás un enlace.");
        return;
      }
      if (mode === "reset") {
        const { error } = await auth.resetPassword({ token, newPassword: password });
        if (error) {
          setMessage("El enlace venció o la contraseña no es válida.");
          return;
        }
        window.location.assign("/ingresar");
        return;
      }
      const { error } = mode === "register"
        ? await auth.signUp.email({ email, password, name: String(data.get("name") ?? "").trim(), callbackURL: "/ingresar" })
        : await auth.signIn.email({ email, password });
      if (error) {
        setMessage(error.status === 429 ? "Hubo demasiados intentos. Espera unos segundos y vuelve a intentar."
          : mode === "register" ? "No pudimos registrar la cuenta. Revisa los datos o intenta iniciar sesión."
          : error.code === "EMAIL_NOT_VERIFIED" ? "Verifica tu correo antes de ingresar. Revisa tu bandeja de entrada."
          : "No pudimos iniciar sesión. Revisa tus datos o intenta más tarde.");
        return;
      }
      if (mode === "register") {
        setMessage("Revisa tu correo para verificar la cuenta y luego inicia sesión.");
        return;
      }
      window.location.assign("/cuenta");
    } catch {
      setMessage("El servicio no está disponible en este momento.");
    } finally {
      setBusy(false);
    }
  }

  if (mode === "reset" && !token) return <p>El enlace es inválido. Solicita otro desde la página de ingreso.</p>;
  return (
    <form className="request-form" method="post" onSubmit={submit}>
      {mode === "register" && <label>Nombre<input name="name" maxLength={100} autoComplete="name" required /></label>}
      {hasEmail && <label>Correo<input name="email" type="email" maxLength={254} autoComplete="email" required /></label>}
      {hasPassword && <label>Contraseña<input name="password" type="password" maxLength={128} minLength={mode === "login" ? undefined : 12}
        autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>}
      {hasPassword && mode !== "login" && <p className="muted">Usa al menos 12 caracteres.</p>}
      <button className="button primary" disabled={busy}>{busy ? "Procesando…" : {
        login: "Iniciar sesión", register: "Crear cuenta", forgot: "Enviar enlace", reset: "Cambiar contraseña",
      }[mode]}</button>
      <p role="status">{message}</p>
    </form>
  );
}
