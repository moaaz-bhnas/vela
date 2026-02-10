type HasCreatedAt = {
  created_at?: string | Date | null
}

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000

export function isProductNew(entity: HasCreatedAt): boolean {
  if (!entity?.created_at) {
    return false
  }

  const createdAt =
    entity.created_at instanceof Date
      ? entity.created_at
      : new Date(entity.created_at)

  if (Number.isNaN(createdAt.getTime())) {
    return false
  }

  const now = Date.now()

  return now - createdAt.getTime() <= THIRTY_DAYS_IN_MS
}

