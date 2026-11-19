import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function Registro() {
  return <section className="wrap section form-page"><h1>Crear cuenta</h1>
    <p className="intro">¿Ya tienes cuenta? <Link className="text-link" href="/ingresar">Inicia sesión</Link></p>
    <AuthForm mode="register" />
  </section>;
}
