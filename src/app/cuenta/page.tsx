import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { database } from "@/lib/db";
import { statusLabel } from "@/lib/requests";
import { deleteAvatar, signOut, updateAvatar, updateProfile } from "./actions";

const errors: Record<string, string> = {
  nombre: "Ingresa un nombre de hasta 100 caracteres.",
  imagen: "Selecciona un archivo JPG, PNG o WebP válido de hasta 5 MB.",
  permisos: "Tu cuenta no tiene acceso al panel de administración.",
};

export default async function Cuenta({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const user = await requireUser();
  const db = database();
  const [avatar, requests, { error, ok }] = await Promise.all([
    db.media.findUnique({ where: { id: "avatar-" + user.id }, select: { id: true } }),
    db.customerRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    searchParams,
  ]);
  return (
    <section className="wrap section form-page">
      <h1>Mi perfil</h1>
      <div className="actions">
        <form action={signOut}><button className="button outline">Cerrar sesión</button></form>
      </div>
      {typeof error === "string" && Object.hasOwn(errors, error) && <p className="notice" role="alert">{errors[error]}</p>}
      {ok && <p className="notice" role="status">{ok === "solicitud" ? "Solicitud enviada." : "Cambios guardados."}</p>}
      <div className="work-panel">
        <h2>Perfil</h2>
        <form action={updateProfile} className="request-form">
          <label>Nombre<input name="name" defaultValue={user.name} required maxLength={100} /></label>
          <p>Correo de ingreso · {user.email}</p>
          <button className="button primary">Guardar perfil</button>
        </form>
      </div>
      <div className="work-panel">
        <h2>Foto de perfil</h2>
        {avatar && <Image className="avatar" src={"/api/imagenes/" + avatar.id} alt="Tu foto de perfil" unoptimized width={112} height={112} />}
        <form action={updateAvatar} className="request-form">
          <label>Archivo JPG, PNG o WebP de hasta 5 MB<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required /></label>
          <button className="button primary">{avatar ? "Cambiar foto" : "Subir foto"}</button>
        </form>
        {avatar && <form action={deleteAvatar}><button className="button outline">Eliminar foto</button></form>}
      </div>
      <div className="work-panel">
        <h2>Mis solicitudes</h2>
        {requests.length === 0 ? <p>Todavía no tienes solicitudes.</p> : <ul className="service-list">
          {requests.map((request) => <li key={request.id}>
            <div><strong>{request.serviceName}</strong><p>{request.kind === "QUOTE" ? "Cotización" : "Reserva"} · {statusLabel[request.status]}</p>
              {request.proposedAt && <p>Horario propuesto · {request.proposedAt.toLocaleString("es-CL", { timeZone: "America/Santiago" })}</p>}</div>
          </li>)}
        </ul>}
      </div>
    </section>
  );
}
