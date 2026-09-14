import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatDay } from "@/features/admin/status-meta";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = (await searchParams).q?.trim();

  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { address: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        area: { select: { name: true } },
        _count: { select: { leads: true, jobs: true, quotes: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">{total} records</p>
        </div>
        <form action="/admin/customers" method="get" className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name or phone…"
            aria-label="Search customers"
            className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Search
          </button>
        </form>
      </header>

      <Card>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th scope="col" className="px-5 py-3 font-medium">Name</th>
                <th scope="col" className="px-5 py-3 font-medium">Phone</th>
                <th scope="col" className="px-5 py-3 font-medium">Area</th>
                <th scope="col" className="px-5 py-3 font-medium">History</th>
                <th scope="col" className="px-5 py-3 font-medium">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/customers/${c.id}`} className="font-semibold text-brand-700 hover:text-brand-800">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.phone}</td>
                  <td className="px-5 py-3 text-slate-600">{c.area?.name ?? c.pincode ?? "—"}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">
                    {c._count.leads} enquiries · {c._count.jobs} jobs · {c._count.quotes} quotes
                    {c._count.leads > 1 && (
                      <span className="ml-2 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-700">
                        REPEAT
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDay(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul role="list" className="divide-y divide-slate-100 md:hidden">
          {customers.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/customers/${c.id}`} className="block px-4 py-3.5 hover:bg-slate-50">
                <p className="font-semibold text-slate-800">{c.name}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {c.phone} · {c.area?.name ?? "—"}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {c._count.leads} enquiries · {c._count.jobs} jobs
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {customers.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-slate-400">No customers found.</p>
        )}
      </Card>
    </div>
  );
}
