export type DonationStep = 'amount' | 'payment' | 'confirmation' | 'success'

export interface ConfirmationFormValues {
  fullName: string
  address: string
  amountPaid: string
}

export type UploadState =
  | { status: 'empty' }
  | { status: 'uploading'; fileName: string }
  | { status: 'uploaded'; file: File; fileName: string; previewUrl: string }
  | { status: 'invalid'; message: string }
  | { status: 'error'; message: string }

export type SubmissionStatus = 'idle' | 'submitting' | 'error'

export type FormErrors = Partial<
  Record<'fullName' | 'address' | 'amountPaid' | 'screenshot', string>
>
