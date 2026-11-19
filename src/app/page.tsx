import Image from "next/image";
import Link from "next/link";
import { ServiceList } from "@/components/service-list";
import { mediaUrl, publicContent } from "@/lib/public-content";

export default async function Inicio() {
  const { workshop, media, provisional } = await publicContent();
  const whatsapp = workshop.whatsapp;
  const hero = media.find((image) => image.id === "hero");
  const gallery = media.filter((image) => image.id.startsWith("gallery-"));
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            {provisional && <p className="eyebrow">Nombre provisional</p>}
            <h1 className="multiline">{workshop.headline}</h1>
            <p className="intro">{workshop.introduction}</p>
            <div className="actions">
              <Link className="button primary" href="/cotizacion">Solicitar cotización</Link>
              <Link className="button outline" href="/reservas">Solicitar hora</Link>
              {whatsapp && /^56[0-9]{9}$/.test(whatsapp)
                ? <a className="button outline" href={`https://wa.me/${whatsapp}`}>WhatsApp</a>
                : <span className="whatsapp-status">WhatsApp · por confirmar</span>}
            </div>
          </div>
          <figure>
            <Image src={hero ? mediaUrl(hero.id) : "/images/taller-provisional.jpg"}
              alt={hero?.alt ?? "Un mecánico trabajando junto a un vehículo"} width={654} height={473}
              sizes="(max-width: 760px) 100vw, 55vw" unoptimized={!!hero} preload />
            {!hero && <figcaption>Imagen provisional</figcaption>}
          </figure>
        </div>
      </section>
      <section className="wrap section split">
        <div><h2>Servicios principales</h2><p className="muted">Catálogo provisional</p></div>
        <div><ServiceList /><Link className="text-link" href="/servicios">Ver todos los servicios →</Link></div>
      </section>
      <section className="benefits">
        <div className="wrap section split">
          <div><h2>{workshop.benefitsTitle}</h2>{provisional && <p className="muted">Propuesta de atención</p>}</div>
          <p className="multiline">{workshop.benefits}</p>
        </div>
      </section>
      {gallery.length > 0 && <section className="wrap section">
        <h2>Trabajos realizados</h2>
        <div className="work-gallery">{gallery.map((image) => <figure key={image.id}>
          <Image className="work-image" src={mediaUrl(image.id)} alt={image.alt} width={360} height={240} unoptimized />
          <p>{image.alt}</p>
        </figure>)}</div>
      </section>}
    </>
  );
}
