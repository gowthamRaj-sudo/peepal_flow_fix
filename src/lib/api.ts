import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";
import {
  ApiError,
  isApiError,
  publicErrorMessage,
  forbidden,
} from "@/lib/errors";
import { checkRateLimit, type RateLimitRule } from "@/lib/rate-limit";
import { getSessionFromRequest, type SessionUser } from "@/lib/auth";
import type { UserRole } from "@prisma/client";

export interface ApiContext {
  req: NextRequest;
  requestId: string;
  ip: string;
  user: SessionUser | null;
}

interface HandlerOptions {
  rateLimit?: RateLimitRule & { enabled?: boolean };
  roles?: UserRole[];
  requireAuth?: boolean;
  csrf?: boolean;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function assertSameOrigin(req: NextRequest) {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("host");
  try {
    const originHost = new URL(origin).host;
    if (host && originHost !== host) throw forbidden("Cross-origin request blocked");
  } catch (e) {
    if (isApiError(e)) throw e;
    throw forbidden("Invalid origin");
  }
}

export function withApi<C = unknown>(
  handler: (ctx: ApiContext, routeCtx: C) => Promise<NextResponse>,
  options: HandlerOptions = {},
) {
  return async (req: NextRequest, routeCtx: C): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    const ip = clientIp(req);
    const startedAt = Date.now();
    try {
      if (options.csrf !== false) assertSameOrigin(req);

      if (options.rateLimit?.enabled !== false) {
        const rule = options.rateLimit ?? { windowMs: 60_000, max: 300 };
        const key = `${new URL(req.url).pathname}:${ip}`;
        checkRateLimit(key, rule);
      }

      let user: SessionUser | null = null;
      if (options.requireAuth || options.roles) {
        user = await getSessionFromRequest(req);
        if (!user) {
          throw new ApiError(401, "Please sign in to continue", "UNAUTHORIZED");
        }
        if (options.roles && !options.roles.includes(user.role)) {
          throw forbidden();
        }
      }

      const res = await handler({ req, requestId, ip, user }, routeCtx as C);
      res.headers.set("x-request-id", requestId);
      logger.info("api.request", {
        requestId,
        method: req.method,
        path: new URL(req.url).pathname,
        status: res.status,
        ms: Date.now() - startedAt,
        userId: user?.id,
      });
      return res;
    } catch (e) {
      if (e instanceof ZodError) {
        const res = NextResponse.json(
          {
            error: "Please check the information you entered and try again.",
            details: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
          },
          { status: 400 },
        );
        res.headers.set("x-request-id", requestId);
        return res;
      }
      if (isApiError(e)) {
        const res = NextResponse.json(
          { error: e.message, code: e.code },
          { status: e.status },
        );
        res.headers.set("x-request-id", requestId);
        if (e.status >= 500) {
          logger.error("api.error", { requestId, err: e, path: req.nextUrl.pathname });
        }
        return res;
      }
      logger.error("api.unhandled", {
        requestId,
        path: req.nextUrl.pathname,
        method: req.method,
        err: e,
      });
      const res = NextResponse.json(
        { error: publicErrorMessage(e), code: "INTERNAL" },
        { status: 500 },
      );
      res.headers.set("x-request-id", requestId);
      return res;
    }
  };
}
