import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CodeKind = "lead" | "job" | "quote";

const SEQUENCES: Record<CodeKind, string> = {
  lead: "lead_code_seq",
  job: "job_code_seq",
  quote: "quote_code_seq",
};

const PREFIXES: Record<CodeKind, string> = {
  lead: "FC",
  job: "JOB",
  quote: "QTE",
};

export async function nextCode(kind: CodeKind): Promise<string> {
  const rows = await prisma.$queryRaw<{ nextval: bigint }[]>(
    Prisma.sql`SELECT nextval(${SEQUENCES[kind]}::regclass) AS nextval`,
  );
  const n = Number(rows[0]?.nextval ?? 0);
  return `${PREFIXES[kind]}-${n}`;
}
