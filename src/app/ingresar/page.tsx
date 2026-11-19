import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function Ingresar() {
  return <section className="wrap section form-page"><h1>Iniciar sesión</h1>
    <div className="intro"><Link className="text-link" href="/registro">Crear cuenta</Link>{" · "}
      <Link className="text-link" href="/recuperar">Olvidé mi contraseña</Link></div>
    <AuthForm mode="login" />
  </section>;
}
