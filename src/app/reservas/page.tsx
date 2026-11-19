import type { Metadata } from "next";
import { RequestForm } from "@/components/request-form";
import { currentUser } from "@/lib/auth";
import { publicContent } from "@/lib/public-content";
import { requestError } from "@/lib/requests";

export const metadata: Metadata = { title: "Solicitar hora" };

export default async function Reservas({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, { services }, user] = await Promise.all([
    searchParams, publicContent(), process.env.DATABASE_URL ? currentUser() : null,
  ]);
  return (
    <section className="wrap section form-page">
      <h1>Solicitar una hora</h1>
      <p className="intro">El taller puede confirmar tu solicitud o proponerte otro horario.</p>
      <RequestForm tipo="reserva" services={services} signedIn={!!user} errorMessage={requestError(error)} />
    </section>
  );
}
