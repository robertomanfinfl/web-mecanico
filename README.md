# Sitio del taller

Aplicación Next.js con portal de clientes y administración. El nombre, el catálogo inicial y la fotografía de portada son provisionales.

## Vista estática

Abre `vista-previa/index.html` con doble clic para revisar el diseño. El aviso «Demostración estática» identifica esta versión. Sus enlaces de cuenta abren la aplicación local cuando está iniciada en el puerto 3000.

## Ejecutar el sitio funcional

Usa Node.js 24, pnpm, PostgreSQL y una cuenta SMTP de correo transaccional. Copia `.env.example` a `.env` y completa estas variables.

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL para la aplicación. En una base administrada, usa los parámetros TLS del proveedor. |
| `DIRECT_DATABASE_URL` | Opcional. Conexión directa para migraciones y promoción de administradores si DATABASE_URL apunta a un pooler. |
| `BETTER_AUTH_SECRET` | Secreto aleatorio de al menos 32 caracteres. Genera uno con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. |
| `BETTER_AUTH_URL` | Origen exacto desde el que abrirás el sitio. Por ejemplo, `http://localhost:3000` en local o el dominio público con HTTPS. |
| `SMTP_URL` | URL del proveedor SMTP. Usa SMTPS o STARTTLS según el proveedor. Codifica caracteres especiales en el usuario y la contraseña de la URL. |
| `SMTP_FROM` | Remitente autorizado en tu proveedor de correo. |

```powershell
pnpm install
```

En Windows, después de configurar `.env` e instalar las dependencias una vez, abre **`iniciar-web.bat`** con doble clic desde la carpeta principal. Aplica las migraciones pendientes, arranca Next.js y abre Chrome en la dirección de `BETTER_AUTH_URL`. Mantén abierta la ventana del lanzador mientras usas el sitio. Si prefieres iniciarlo desde una terminal, ejecuta `pnpm db:migrate` y después `pnpm dev`.

Las migraciones crean el catálogo inicial. El número de WhatsApp y los demás datos del taller se editan desde el panel. La indexación está desactivada mientras el contenido siga en revisión.

## Cuenta y administración

1. Registra la cuenta en `http://localhost:3000/registro` y abre el enlace de verificación que llega por correo.
2. En el encabezado, selecciona **Iniciar sesión**. Al entrar aparece **Mi perfil**, donde puedes editar el nombre, subir, reemplazar o retirar la foto y ver tus solicitudes. La recuperación se solicita desde **Olvidé mi contraseña**.
3. Para conceder acceso de administrador a una cuenta verificada, ejecuta en el servidor autorizado `pnpm admin:promote correo@dominio.cl`. Después aparece **Administración** en el encabezado. El registro público crea cuentas cliente.
4. En **Imágenes**, elige el logo, la portada o una foto de un trabajo. En **Servicios**, abre el servicio para editar su imagen o precio. En **Datos del taller**, edita y guarda la información que se muestra en el sitio. Los cambios se publican al guardar.
5. Las cotizaciones y reservas se envían desde una cuenta con correo verificado. En **Solicitudes**, el taller ve los datos, las fotos adjuntas y el horario preferido, y puede aceptar, rechazar o proponer otro horario.

Las imágenes se decodifican y convierten a WebP en el servidor y se guardan en PostgreSQL. Se aceptan JPG, PNG y WebP de hasta 5 MB y 20 megapíxeles por archivo. La foto de perfil se sirve únicamente a su titular. El titular y el administrador pueden ver las fotos de una cotización. Incluye PostgreSQL y sus imágenes en los respaldos. Configura el proxy de producción para permitir hasta 22 MB por solicitud de formulario.

Para verificar la compilación, ejecuta `pnpm typecheck` y `pnpm build`.
