// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScreenshotUpload } from './useScreenshotUpload'

function makeFile(name: string, type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type })
}

describe('useScreenshotUpload', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects a disallowed file type without ever entering "uploading"', () => {
    const { result } = renderHook(() => useScreenshotUpload())
    act(() => {
      result.current.selectFile(makeFile('proof.gif', 'image/gif', 1024))
    })
    expect(result.current.state).toEqual({
      status: 'invalid',
      message: 'Please upload a PNG, JPG, or WEBP image.',
    })
  })

  it('rejects a file over the 8MB limit', () => {
    const { result } = renderHook(() => useScreenshotUpload())
    act(() => {
      result.current.selectFile(makeFile('proof.png', 'image/png', 8 * 1024 * 1024 + 1))
    })
    expect(result.current.state).toEqual({
      status: 'invalid',
      message: 'Please upload an image under 8MB.',
    })
  })

  it('transitions empty -> uploading -> uploaded for a valid file', async () => {
    const { result } = renderHook(() => useScreenshotUpload())

    act(() => {
      result.current.selectFile(makeFile('proof.png', 'image/png', 1024))
    })
    expect(result.current.state.status).toBe('uploading')

    await waitFor(() => expect(result.current.state.status).toBe('uploaded'))
    expect(result.current.state).toMatchObject({
      status: 'uploaded',
      fileName: 'proof.png',
    })
  })

  it('revokes the previous preview URL when a file is replaced', async () => {
    const { result } = renderHook(() => useScreenshotUpload())

    act(() => {
      result.current.selectFile(makeFile('first.png', 'image/png', 1024))
    })
    await waitFor(() => expect(result.current.state.status).toBe('uploaded'))

    act(() => {
      result.current.selectFile(makeFile('second.png', 'image/png', 1024))
    })
    await waitFor(() => expect(result.current.state.status).toBe('uploaded'))

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('revokes the preview URL on removeFile', async () => {
    const { result } = renderHook(() => useScreenshotUpload())

    act(() => {
      result.current.selectFile(makeFile('proof.png', 'image/png', 1024))
    })
    await waitFor(() => expect(result.current.state.status).toBe('uploaded'))

    act(() => {
      result.current.removeFile()
    })

    expect(result.current.state).toEqual({ status: 'empty' })
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('revokes the preview URL on unmount if a file is still held', async () => {
    const { result, unmount } = renderHook(() => useScreenshotUpload())

    act(() => {
      result.current.selectFile(makeFile('proof.png', 'image/png', 1024))
    })
    await waitFor(() => expect(result.current.state.status).toBe('uploaded'))

    unmount()

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})
