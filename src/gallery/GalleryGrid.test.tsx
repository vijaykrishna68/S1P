// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { GalleryGrid } from './GalleryGrid'
import { GalleryTile } from './GalleryTile'
import type { GalleryImage } from './galleryApi'

const listGalleryImages = vi.fn()
vi.mock('./galleryApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./galleryApi')>()),
  listGalleryImages: () => listGalleryImages(),
}))

const IMAGE: GalleryImage = {
  id: 'img-1',
  imageUrl: '/api/gallery/img-1/image',
  caption: 'School visit',
  createdAt: '2025-01-01T00:00:00.000Z',
}

describe('GalleryTile', () => {
  it('fades its image in once loaded', () => {
    render(<GalleryTile image={IMAGE} alt="School visit" onOpen={() => {}} />)
    const img = screen.getByRole('img', { name: 'School visit' })

    expect(img).toHaveClass('opacity-0')
    fireEvent.load(img)
    expect(img).toHaveClass('opacity-100')
  })

  it('transitions the hover zoom: scale is a separate CSS property in Tailwind v4', () => {
    render(<GalleryTile image={IMAGE} alt="School visit" onOpen={() => {}} />)
    const img = screen.getByRole('img', { name: 'School visit' })

    expect(img.className).toMatch(/transition-\[[^\]]*\bscale\b[^\]]*\]/)
    expect(img.className).toContain('motion-safe:group-hover:scale-[1.03]')
  })

  it('does not leave a broken image invisible', () => {
    render(<GalleryTile image={IMAGE} alt="School visit" onOpen={() => {}} />)
    const img = screen.getByRole('img', { name: 'School visit' })

    fireEvent.error(img)
    expect(img).toHaveClass('opacity-100')
  })

  it('is one button that reports which image was chosen', () => {
    const onOpen = vi.fn()
    render(<GalleryTile image={IMAGE} alt="School visit" onOpen={onOpen} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onOpen).toHaveBeenCalledWith(IMAGE)
  })
})

describe('GalleryGrid loading state', () => {
  beforeEach(() => {
    listGalleryImages.mockReset()
  })

  it('announces loading once and marks the pulsing skeleton as a pending indicator', () => {
    listGalleryImages.mockReturnValue(new Promise(() => {}))
    const { container } = render(<GalleryGrid />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Loading gallery')
    const blocks = container.querySelectorAll('.skeleton-pulse')
    expect(blocks).toHaveLength(8)
    blocks.forEach((block) => expect(block).toHaveClass('motion-pending'))
  })

  it('replaces the skeleton with the tiles once data arrives', async () => {
    listGalleryImages.mockResolvedValue([IMAGE])
    render(<GalleryGrid />)

    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'School visit' })).toBeInTheDocument(),
    )
    expect(screen.queryByRole('status')).toBeNull()
  })
})
