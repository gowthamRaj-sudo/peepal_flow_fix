import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { leadNoteSchema } from "@/lib/validation";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

const noteSchema = z.object({ body: z.string().trim().min(1).max(2000) });

export const POST = withApi<RouteCtx>(
  async ({ req, user, ip }, ctx) => {
    const { id } = await ctx.params;
    const { body } = noteSchema.parse(await req.json().catch(() => null));

    const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const note = await prisma.leadNote.create({
      data: { leadId: id, authorId: user!.id, body },
    });

    await audit({
      actorId: user!.id,
      action: "lead.note_added",
      entityType: "LEAD",
      entityId: id,
      ip,
    });

    return NextResponse.json({ id: note.id }, { status: 201 });
  },
  { roles: ["ADMIN", "STAFF"] },
);
