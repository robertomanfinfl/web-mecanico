import { AuthForm } from "@/components/auth-form";

export default async function Restablecer({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <section className="wrap section form-page"><h1>Cambiar contraseña</h1>
    <AuthForm mode="reset" token={typeof token === "string" ? token : undefined} />
  </section>;
}
