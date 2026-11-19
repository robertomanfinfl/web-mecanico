import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const required = ["DATABASE_URL", "BETTER_AUTH_URL", "BETTER_AUTH_SECRET", "SMTP_URL", "SMTP_FROM"];

function applicationUrl() {
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) throw new Error("Completa el archivo .env (puedes copiar .env.example). Faltan: " + missing.join(", "));
  if (process.env.BETTER_AUTH_SECRET.length < 32) throw new Error("BETTER_AUTH_SECRET debe tener al menos 32 caracteres.");
  const url = new URL(process.env.BETTER_AUTH_URL);
  if (url.protocol !== "http:" || !["localhost", "127.0.0.1"].includes(url.hostname) ||
      url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("Para iniciar en este equipo, usa BETTER_AUTH_URL=http://localhost:3000 en .env.");
  }
  return url;
}

function chromePath() {
  const roots = [process.env.ProgramFiles, process.env["ProgramFiles(x86)"], process.env.LOCALAPPDATA];
  return roots.filter(Boolean).map((root) => join(root, "Google", "Chrome", "Application", "chrome.exe")).find(existsSync);
}

function startNode(filename, args) {
  return spawn(process.execPath, [filename, ...args], { stdio: "inherit", windowsHide: true });
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code));
  });
}

async function appResponds(url) {
  try {
    const response = await fetch(new URL("/api/estado", url), { signal: AbortSignal.timeout(1500) });
    return response.ok && (await response.json()).application === "web-mecanico";
  } catch {
    return false;
  }
}

async function openChrome(url) {
  const path = chromePath();
  console.log("Aplicación del taller: " + url.href);
  if (!path) {
    console.log("Abre esa dirección en Chrome. No se encontró Chrome en las rutas de instalación habituales.");
    return;
  }
  const browser = spawn(path, [url.href], { detached: true, stdio: "ignore" });
  await new Promise((resolve, reject) => {
    browser.once("spawn", resolve);
    browser.once("error", reject);
  });
  browser.unref();
}

async function main() {
  const url = applicationUrl();
  if (await appResponds(url)) {
    await openChrome(url);
    return;
  }

  const prisma = join("node_modules", "prisma", "build", "index.js");
  const next = join("node_modules", "next", "dist", "bin", "next");
  if (![prisma, next, join("src", "generated", "prisma", "client.ts")].every(existsSync)) {
    throw new Error("Instala las dependencias una vez con pnpm install antes de abrir este archivo.");
  }
  const migrated = await waitForExit(startNode(prisma, ["migrate", "deploy"]));
  if (migrated !== 0) throw new Error("No se pudo preparar PostgreSQL. Revisa la conexión y el mensaje anterior.");

  const server = startNode(next, ["dev", "--hostname", "127.0.0.1", "--port", url.port || "80"]);
  const exited = waitForExit(server);
  const stop = () => server.kill();
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  try {
    await Promise.race([
      exited.then(() => { throw new Error("El servidor se cerró durante el arranque. Revisa el mensaje anterior."); }),
      (async () => {
        for (let attempt = 0; attempt < 90; attempt++) {
          if (await appResponds(url)) return;
          await delay(500, undefined, { ref: false });
        }
        throw new Error("La aplicación tardó demasiado en iniciar.");
      })(),
    ]);
    await openChrome(url);
    console.log("Mantén abierta esta ventana mientras uses el sitio. Presiona Ctrl+C para detenerlo.");
    const code = await exited;
    if (code && code !== 0) throw new Error("El servidor terminó con código " + code + ".");
  } finally {
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
    if (server.exitCode === null && server.signalCode === null) server.kill();
  }
}

try {
  await main();
} catch (error) {
  console.error("No se pudo abrir el taller. " + error.message);
  process.exitCode = 1;
}
