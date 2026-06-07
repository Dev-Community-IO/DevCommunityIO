export interface PageMembersMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export function normalizePageMembersMeta(meta: unknown, fallbackTotal: number): PageMembersMeta {
  const raw = meta as Partial<PageMembersMeta> | undefined;
  const total = Number(raw?.total ?? fallbackTotal);
  const page = Number(raw?.page ?? 1);
  const limit = Number(raw?.limit ?? 20);
  const hasMore =
    typeof raw?.hasMore === 'boolean' ? raw.hasMore : page * limit < total;

  return { page, limit, total, hasMore };
}

export function appendUniqueMembers<T extends { id?: string }>(existing: T[], incoming: T[]): T[] {
  const seen = new Set(existing.map((member) => member.id).filter(Boolean));
  const next = [...existing];

  for (const member of incoming) {
    if (!member?.id || seen.has(member.id)) continue;
    seen.add(member.id);
    next.push(member);
  }

  return next;
}
