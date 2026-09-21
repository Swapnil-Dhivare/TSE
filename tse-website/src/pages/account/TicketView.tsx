import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import { listMyTickets } from "@/api/orders";
import { qk } from "@/lib/query-keys";
import { useAuth } from "@/auth/AuthProvider";
import { isPlatformConfigured } from "@/lib/env";

export default function TicketView() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: tickets } = useQuery({
    queryKey: qk.me.tickets(user?.id ?? "anon"),
    queryFn: listMyTickets,
    enabled: isPlatformConfigured && Boolean(user),
  });
  const ticket = tickets?.find((t) => t.id === ticketId);

  useEffect(() => {
    if (!ticket || !canvasRef.current) return;
    // QR must be dark-on-white with a quiet zone — brand-coloured QRs fail scanners.
    void QRCode.toCanvas(canvasRef.current, ticket.code, {
      width: 220, margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, [ticket]);

  if (!ticket) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <p className="text-muted-foreground">Ticket not found.</p>
        <Link to="/account" className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 font-semibold text-paper">
          My tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-14">
      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-lg">
        <div className="bg-void p-6 text-paper">
          <div className="font-mono text-xs uppercase tracking-wider text-brand">TSE · Event ticket</div>
          <div className="mt-2 font-display text-xl font-bold">{ticket.attendee_name}</div>
        </div>
        <div className="border-t border-dashed border-line" />
        <div className="flex flex-col items-center p-8">
          <div className="rounded-lg bg-white p-3">
            <canvas ref={canvasRef} />
          </div>
          <div className="mt-4 select-all font-mono text-sm font-semibold tracking-wider text-ink">
            {ticket.code}
          </div>
          <div className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
            {ticket.status === "checked_in" ? "Checked in" : "Valid"}
          </div>
        </div>
      </div>
      <Link to="/account" className="mt-6 block text-center text-sm text-muted-foreground hover:text-ink">
        ← All tickets
      </Link>
    </div>
  );
}
