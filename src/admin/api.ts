export type DonationStatus = 'pending' | 'reviewed' | 'rejected'

export interface Donation {
  id: string
  fullName: string
  address: string
  amountPaid: number
  screenshotUrl: string
  status: DonationStatus
  createdAt: string
  updatedAt: string
}

export interface DonationSummary {
  totalCount: number
  totalAmount: number
  pendingCount: number
}

export interface ListDonationsResponse {
  items: Donation[]
  page: number
  pageSize: number
  total: number
  summary: DonationSummary
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

interface ApiErrorBody {
  error?: { message?: string }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const body: ApiErrorBody | null = await response.json().catch(() => null)
    throw new ApiError(
      body?.error?.message ?? 'Something went wrong. Please try again.',
      response.status,
    )
  }

  return response.json()
}

export function login(email: string, password: string) {
  return request<{ email: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function logout() {
  return request<{ ok: true }>('/api/admin/logout', { method: 'POST' })
}

export function me() {
  return request<{ email: string }>('/api/admin/me')
}

export function listDonations(params: {
  page: number
  pageSize: number
  status?: DonationStatus
}): Promise<ListDonationsResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    ...(params.status ? { status: params.status } : {}),
  })
  return request<ListDonationsResponse>(`/api/donations?${query.toString()}`)
}

export function getDonation(id: string) {
  return request<Donation>(`/api/donations/${id}`)
}

export function updateDonationStatus(id: string, status: DonationStatus) {
  return request<Donation>(`/api/donations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
