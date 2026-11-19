import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { database } from "@/lib/db";
import { mediaUrl, publicContent } from "@/lib/public-content";
import { statusLabel } from "@/lib/requests";
import { deletePublicImage, deleteService, savePublicImage, saveService, saveWorkshop, updateRequest } from "./actions";

function ImageSlot({ slot, label, image }: {
  slot: string;
  label: string;
  image?: { id: string; alt: string };
}) {
  return <div className="work-panel">
    <h3>{label}</h3>
    {image && <Image className="work-image" src={mediaUrl(image.id)} alt={image.alt} width={240} height={150} unoptimized />}
    <form action={savePublicImage} className="request-form">
      <input type="hidden" name="slot" value={slot} />
      <label>Texto alternativo<input name="alt" maxLength={160} defaultValue={image?.alt} required /></label>
      <label>Imagen JPG, PNG o WebP<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required /></label>
      <button className="button outline">{image ? "Reemplazar imagen" : "Subir imagen"}</button>
    </form>
    {image && <RemoveImage id={image.id} />}
  </div>;
}

function RemoveImage({ id }: { id: string }) {
  return <form action={deletePublicImage}>
    <input type="hidden" name="id" value={id} /><button className="button outline">Eliminar imagen</button>
  </form>;
}

function ServiceEditor({ service }: { service?: { id: string; name: string; description: string; price: number | null } }) {
  return <form action={saveService} className="request-form">
    <input type="hidden" name="id" value={service?.id ?? ""} />
    <label>Nombre<input name="name" defaultValue={service?.name} maxLength={100} required /></label>
    <label>Descripción<textarea name="description" defaultValue={service?.description} maxLength={1200} required /></label>
    <label>Precio en CLP (opcional)<input name="price" inputMode="numeric" pattern="[0-9]{0,8}" defaultValue={service?.price ?? ""} /></label>
    <button className="button primary">{service ? "Guardar servicio" : "Agregar servicio"}</button>
  </form>;
}

function localDate(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium", timeStyle: "short", timeZone: "America/Santiago",
  }).format(date);
}

export default async function Admin({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await requireAdmin();
  const db = database();
  const [content, pending, clients, requests, { ok, error }] = await Promise.all([
    publicContent(),
    db.customerRequest.count({ where: { status: "PENDING" } }),
    db.user.count({ where: { role: "cliente" } }),
    db.customerRequest.findMany({
      orderBy: { createdAt: "desc" }, take: 50,
      include: { user: { select: { name: true, email: true } }, photos: { select: { id: true, alt: true } } },
    }),
    searchParams,
  ]);
  const { workshop, services, media } = content;
  const imageFor = (id: string) => media.find((image) => image.id === id);

  return <section className="wrap section">
    <h1>Administración</h1>
    <nav className="work-nav" aria-label="Administración">
      <a href="#solicitudes">Solicitudes</a><a href="#taller">Datos del taller</a>
      <a href="#servicios">Servicios</a><a href="#imagenes">Imágenes</a>
    </nav>
    {ok && <p className="notice" role="status">Cambios guardados.</p>}
    {error && <p className="notice" role="alert">{error === "imagen" ? "Selecciona una imagen JPG, PNG o WebP válida de hasta 5 MB." : "Revisa los datos antes de guardar."}</p>}
    <dl className="admin-stats">
      <div><dt>Solicitudes pendientes</dt><dd>{pending}</dd></div>
      <div><dt>Clientes registrados</dt><dd>{clients}</dd></div>
      <div><dt>Servicios publicados</dt><dd>{services.length}</dd></div>
    </dl>
    <section id="solicitudes" className="work-panel">
      <h2>Solicitudes</h2>
      <p className="muted">Hasta 50 solicitudes recientes.</p>
      {requests.length === 0 && <p>Todavía no hay solicitudes.</p>}
      {requests.map((request) => <details className="work-panel" key={request.id}>
        <summary>{request.kind === "QUOTE" ? "Cotización" : "Reserva"} · {request.serviceName} · {statusLabel[request.status]}</summary>
        <p>{request.user.name} · {request.user.email} · {request.phone}</p>
        <p>{request.make} {request.model} · {request.year} · {request.plate}</p>
        {request.details && <p className="multiline">{request.details}</p>}
        {request.preferredAt && <p>Hora preferida · {localDate(request.preferredAt)}</p>}
        {request.proposedAt && <p>Hora propuesta · {localDate(request.proposedAt)}</p>}
        <div className="actions">{request.photos.map((photo) => <a href={mediaUrl(photo.id)} key={photo.id}>
          <Image className="work-image" src={mediaUrl(photo.id)} alt={photo.alt} width={160} height={100} unoptimized />
        </a>)}</div>
        <form action={updateRequest} className="request-form">
          <input type="hidden" name="id" value={request.id} />
          <label>Decisión<select name="status" required defaultValue="">
            <option value="">Selecciona una decisión</option><option value="ACCEPTED">Aceptar</option>
            <option value="REJECTED">Rechazar</option>
            {request.kind === "BOOKING" && <option value="PROPOSED">Proponer otro horario</option>}
          </select></label>
          {request.kind === "BOOKING" && <label>Fecha y hora alternativa (hora de Chile)<input type="datetime-local" name="proposedAt" /></label>}
          <button className="button primary">Guardar decisión</button>
        </form>
      </details>)}
    </section>
    <section id="taller" className="work-panel">
      <h2>Datos del taller y textos</h2>
      <form action={saveWorkshop} className="request-form">
        <label>Nombre<input name="name" defaultValue={workshop.name} maxLength={100} required /></label>
        <label>Titular del inicio<textarea name="headline" defaultValue={workshop.headline} maxLength={140} required /></label>
        <label>Presentación<textarea name="introduction" defaultValue={workshop.introduction} maxLength={400} required /></label>
        <label>Título de beneficios<input name="benefitsTitle" defaultValue={workshop.benefitsTitle} maxLength={100} required /></label>
        <label>Beneficios<textarea name="benefits" defaultValue={workshop.benefits} maxLength={1600} required /></label>
        <label>Dirección<input name="address" defaultValue={workshop.address ?? ""} maxLength={300} /></label>
        <label>Horarios<textarea name="hours" defaultValue={workshop.hours ?? ""} maxLength={300} /></label>
        <label>WhatsApp · 56 seguido de nueve dígitos<input name="whatsapp" inputMode="tel" defaultValue={workshop.whatsapp ?? ""} pattern="56[0-9]{9}" /></label>
        <button className="button primary">Guardar información</button>
      </form>
    </section>
    <section id="servicios" className="work-panel">
      <h2>Servicios</h2>
      <details className="work-panel"><summary>Agregar servicio</summary><ServiceEditor /></details>
      {services.map((service) => <details className="work-panel" key={service.id}>
        <summary>{service.name}</summary>
        <ServiceEditor service={service} />
        <ImageSlot label="Imagen del servicio" slot={"service-" + service.id} image={imageFor("service-" + service.id)} />
        <form action={deleteService}>
          <input type="hidden" name="id" value={service.id} /><button className="button outline">Eliminar servicio</button>
        </form>
      </details>)}
    </section>
    <section id="imagenes" className="work-panel">
      <h2>Imágenes del sitio</h2>
      <ImageSlot slot="logo" label="Logo del taller" image={imageFor("logo")} />
      <ImageSlot slot="hero" label="Imagen principal" image={imageFor("hero")} />
      <ImageSlot slot="gallery" label="Agregar foto de un trabajo" />
      <div className="work-gallery">{media.filter((image) => image.id.startsWith("gallery-")).map((image) =>
        <figure key={image.id}>
          <Image className="work-image" src={mediaUrl(image.id)} alt={image.alt} width={240} height={150} unoptimized />
          <p>{image.alt}</p><RemoveImage id={image.id} />
        </figure>)}</div>
    </section>
  </section>;
}
