import type { Metadata } from "next";
import Link from "next/link";
import { ServiceList } from "@/components/service-list";
import { publicContent } from "@/lib/public-content";

export const metadata: Metadata = { title: "Servicios" };

export default async function Servicios() {
  const { provisional } = await publicContent();
  return (
    <section className="wrap section split">
      <div><h1>Servicios del taller</h1>{provisional && <p className="muted">Catálogo provisional</p>}</div>
      <div>
        <ServiceList cotizar />
        <Link className="button outline" href="/reservas">Solicitar una hora</Link>
      </div>
    </section>
  );
}
