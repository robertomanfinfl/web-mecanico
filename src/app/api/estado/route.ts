export function GET() {
  return Response.json({ application: "web-mecanico" }, { headers: { "Cache-Control": "no-store" } });
}
