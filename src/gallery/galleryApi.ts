/**
 * Shared by the public gallery page and the admin gallery management view —
 * both need the exact same list shape, and the public `GET /api/gallery`
 * response already contains everything either context needs (there's no
 * separate admin-only listing endpoint; see api/gallery/index.ts).
 */
export interface GalleryImage {
  id: string
  imageUrl: string
  caption: string | null
  createdAt: string
}

export class GalleryApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

interface ApiErrorBody {
  error?: { message?: string }
}

export async function listGalleryImages(): Promise<GalleryImage[]> {
  const response = await fetch('/api/gallery')
  if (!response.ok) {
    const body: ApiErrorBody | null = await response.json().catch(() => null)
    throw new GalleryApiError(
      body?.error?.message ?? "We couldn't load the gallery. Please try again.",
      response.status,
    )
  }
  const data: { items: GalleryImage[] } = await response.json()
  return data.items
}
