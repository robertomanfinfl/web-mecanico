import { database } from "./db";

export async function parseWorkshopTime(value: string) {
  if (!/^20[0-9]{2}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$/.test(value)) return null;
  const reference = new Date(value + ":00Z");
  if (!Number.isFinite(reference.getTime()) || reference.toISOString().slice(0, 16) !== value) return null;
  const [row] = await database().$queryRaw<{ moment: Date; valid: boolean }[]>`
    SELECT (v AT TIME ZONE 'America/Santiago') AS moment,
           ((v AT TIME ZONE 'America/Santiago') AT TIME ZONE 'America/Santiago') = v AS valid
    FROM (SELECT ${value}::timestamp AS v) AS input
  `;
  return row?.valid && row.moment.getTime() > Date.now() ? row.moment : null;
}
