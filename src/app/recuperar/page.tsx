import { AuthForm } from "@/components/auth-form";

export default function Recuperar() {
  return <section className="wrap section form-page"><h1>Recuperar contraseña</h1>
    <p className="intro">Ingresa el correo asociado a tu cuenta.</p><AuthForm mode="forgot" />
  </section>;
}
