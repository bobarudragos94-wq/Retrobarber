import { getAppointmentDetail } from "@/lib/queries";
import { toUTCDate } from "@/lib/time";

export const dynamic = "force-dynamic";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function esc(v: string) {
  return v.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

/** Fișier .ics pentru „adaugă în calendar”. */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const detail = await getAppointmentDetail(code);
  if (!detail) return new Response("Not found", { status: 404 });

  const { appt, location, barber, service } = detail;
  const start = toUTCDate(appt.date, appt.start_min);
  const end = toUTCDate(appt.date, appt.end_min);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Retro Barbershop//RO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${appt.public_code}@retrobarbershop.ro`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(`${service.name} — Retro ${location.short_name}`)}`,
    `DESCRIPTION:${esc(`Frizer: ${barber.name}\nCod rezervare: ${appt.public_code}\nTelefon salon: ${location.phone}`)}`,
    `LOCATION:${esc(`${location.name}, ${location.address}, București`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Programare la Retro Barbershop peste 2 ore",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="retro-${appt.public_code}.ics"`,
    },
  });
}
