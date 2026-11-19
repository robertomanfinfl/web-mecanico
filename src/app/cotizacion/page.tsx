import type { Metadata } from "next";
import { RequestForm } from "@/components/request-form";
import { currentUser } from "@/lib/auth";
import { publicContent } from "@/lib/public-content";
import { requestError } from "@/lib/requests";

export const metadata: Metadata = { title: "Cotización" };

export default async function Cotizacion({ searchParams }: { searchParams: Promise<{ servicio?: string | string[]; error?: string }> }) {
  const [{ servicio, error }, { services }, user] = await Promise.all([
    searchParams, publicContent(), process.env.DATABASE_URL ? currentUser() : null,
  ]);
  return (
    <section className="wrap section form-page">
      <h1>Solicitar cotización</h1>
      <p className="intro">Cuéntanos qué necesita tu auto.</p>
      <RequestForm tipo="cotizacion" services={services} signedIn={!!user} errorMessage={requestError(error)}
        servicio={typeof servicio === "string" ? servicio : undefined} />
    </section>
  );
}
