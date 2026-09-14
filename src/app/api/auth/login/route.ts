import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { withApi, type ApiContext } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { unauthorized } from "@/lib/errors";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

const bodySchema = z.object({
  phone: z.string().min(4).max(20),
  password: z.string().min(1).max(200),
});

async function handler({ req, ip }: ApiContext) {
  const { phone, password } = bodySchema.parse(await req.json().catch(() => null));

  const user = await prisma.user.findUnique({ where: { phone } });
  const valid = user?.isActive && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !valid) {
    await audit({
      action: "auth.login_failed",
      entityType: "USER",
      entityId: user?.id,
      ip,
      meta: { phone },
    });
    throw unauthorized("Incorrect phone number or password");
  }

  const token = await createSessionToken({ id: user.id, name: user.name, role: user.role });
  await audit({
    actorId: user.id,
    action: "auth.login",
    entityType: "USER",
    entityId: user.id,
    ip,
  });

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, role: user.role },
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}

export const POST = withApi(handler, {
  rateLimit: { windowMs: 15 * 60 * 1000, max: 10 },
});
