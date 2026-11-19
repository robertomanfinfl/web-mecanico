import Link from "next/link";
import Image from "next/image";
import { mediaUrl, publicContent } from "@/lib/public-content";

export async function ServiceList({ cotizar = false }: { cotizar?: boolean }) {
  const { services, media } = await publicContent();
  if (!services.length) return <p>El taller está actualizando su catálogo.</p>;
  const currency = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });
  return (
    <ul className="service-list">
      {services.map((servicio) => {
        const photo = cotizar && media.find((image) => image.id === "service-" + servicio.id);
        return (
        <li key={servicio.id}>
          <div>
            {photo && <Image className="work-image" src={mediaUrl(photo.id)} alt={photo.alt} width={200} height={120} unoptimized />}
            <h3>{servicio.name}</h3><p>{servicio.description}</p>
            {cotizar && servicio.price !== null && <p>{currency.format(servicio.price)}</p>}
          </div>
          {cotizar && (
            <Link className="button outline" href={{ pathname: "/cotizacion", query: { servicio: servicio.id } }}
              aria-label={`Cotizar ${servicio.name}`}>Cotizar</Link>
          )}
        </li>
      ); })}
    </ul>
  );
}
