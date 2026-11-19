import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { taller } from "@/lib/taller";
import { mediaUrl, publicContent } from "@/lib/public-content";
import { currentUser } from "@/lib/auth";
import '@fontsource/barlow-condensed/latin-800.css';
import '@fontsource-variable/source-sans-3';
import './globals.css';

export const metadata: Metadata = {
  title: { default: taller.nombre, template: "%s | " + taller.nombre },
  description: "Mantención, diagnóstico y reparación automotriz.",
  robots: { index: false, follow: false },
};

const links = [
  { href: "/servicios", label: "Servicios" },
  { href: "/cotizacion", label: "Cotizar" },
  { href: "/reservas", label: "Solicitar hora" },
  { href: "/#contacto", label: "Contacto" },
];

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: ReactNode }) {
  const [{ workshop, media, provisional }, user] = await Promise.all([
    publicContent(),
    process.env.DATABASE_URL ? currentUser() : null,
  ]);
  const logo = media.find((image) => image.id === "logo");
  return (
    <html lang="es-CL">
      <body>
        <a className="skip" href="#contenido">Ir al contenido</a>
        <header className="site-header">
          <div className="wrap header-inner">
            <Link href="/" className="brand">
              {logo ? <Image className="work-logo" src={mediaUrl(logo.id)} alt={logo.alt} width={160} height={48} unoptimized /> : workshop.name}
            </Link>
            <nav aria-label="Navegación principal">
              {links.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}
            </nav>
            <nav className="account-nav" aria-label="Cuenta">
              {user ? <>
                <Link className="button outline" href="/cuenta">Mi perfil</Link>
                {user.role === "administrador" && <Link className="button primary" href="/admin">Administración</Link>}
              </> : <>
                <Link className="button primary" href="/ingresar">Iniciar sesión</Link>
                <Link className="button outline" href="/registro">Registrarse</Link>
              </>}
            </nav>
          </div>
        </header>
        <main id="contenido">{children}</main>
        <footer id="contacto" className="site-footer">
          <div className="wrap footer-inner">
            <div><p className="brand">{workshop.name}</p>{provisional && <p>Nombre provisional</p>}</div>
            <div><h2>Ubicación y horarios</h2>
              <p className="multiline">{workshop.address ?? "Dirección por confirmar."}</p>
              <p className="multiline">{workshop.hours ?? "Horarios por confirmar."}</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

