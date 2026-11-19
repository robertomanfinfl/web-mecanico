"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { submitBooking, submitQuote } from "@/app/solicitudes/actions";

type Props = {
  tipo: "cotizacion" | "reserva";
  servicio?: string;
  services: { id: string; name: string }[];
  signedIn: boolean;
  errorMessage?: string;
};

const LIMITE_FOTOS = 4;
const LIMITE_BYTES = 5 * 1024 * 1024;
const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];

export function RequestForm({ tipo, servicio, services, signedIn, errorMessage }: Props) {
  const fotosId = useId();
  const [fotos, setFotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const reserva = tipo === "reserva";

  return (
    <form className="request-form" action={reserva ? submitBooking : submitQuote}>
      {!signedIn && <p className="notice"><Link className="text-link" href="/ingresar">Inicia sesión</Link> para enviar la solicitud y consultar su estado.</p>}
      {errorMessage && <p className="notice" role="alert">{errorMessage}</p>}
      <fieldset>
        <legend>Servicio y vehículo</legend>
        <div className="fields">
          <label className="full-field">Servicio
            <select name="servicio" defaultValue={services.some((item) => item.id === servicio) ? servicio : ""} required>
              <option value="">Selecciona un servicio</option>
              {services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label>Marca<input name="marca" maxLength={60} required /></label>
          <label>Modelo<input name="modelo" maxLength={60} required /></label>
          <label>Año<input name="anio" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} required /></label>
          <label>Patente<input name="patente" autoCapitalize="characters" spellCheck={false} maxLength={12} required /></label>
        </div>
      </fieldset>
      {reserva ? (
        <fieldset>
          <legend>Horario de preferencia</legend>
          <p>La fecha y hora quedan sujetas a confirmación del taller.</p>
          <div className="fields">
            <label>Fecha<input name="fecha" type="date" required /></label>
            <label>Hora<input name="hora" type="time" required /></label>
          </div>
        </fieldset>
      ) : (
        <fieldset>
          <legend>Detalles y fotografías</legend>
          <label>¿Qué necesitas revisar?<textarea name="detalle" rows={4} maxLength={2000} required /></label>
          <label>Fotografías (opcional)
            <input type="file" name="fotos" multiple accept={TIPOS_FOTO.join(",")}
              aria-describedby={fotosId} aria-invalid={!!error}
              onChange={({ currentTarget }) => {
                const seleccion = Array.from(currentTarget.files ?? []);
                const invalida = seleccion.some((foto) => !TIPOS_FOTO.includes(foto.type) || foto.size > LIMITE_BYTES);
                if (invalida || seleccion.length > LIMITE_FOTOS) {
                  currentTarget.value = "";
                  setFotos([]);
                  setError("Selecciona hasta 4 fotos JPG, PNG o WebP de máximo 5 MB cada una.");
                  return;
                }
                setError("");
                setFotos(seleccion.map((foto) => foto.name));
              }}
            />
          </label>
          <p id={fotosId} className="muted">Hasta 4 fotos JPG, PNG o WebP. Máximo 5 MB por foto.</p>
          {error && <p role="alert">{error}</p>}
          {fotos.length > 0 && <ul aria-label="Fotos seleccionadas">{fotos.map((foto, i) => <li key={i}>{foto}</li>)}</ul>}
        </fieldset>
      )}
      <fieldset>
        <legend>Datos de contacto</legend>
        <div className="fields">
          <label>Teléfono<input name="telefono" type="tel" autoComplete="tel" maxLength={24} required /></label>
        </div>
      </fieldset>
      <button className="button primary" type="submit" disabled={!signedIn || !services.length}>Enviar solicitud</button>
    </form>
  );
}
