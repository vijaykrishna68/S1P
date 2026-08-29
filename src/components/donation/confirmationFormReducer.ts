import { DONATION_CONFIG } from './config'
import type {
  ConfirmationFormValues,
  FormErrors,
  SubmissionStatus,
  UploadState,
} from './types'

export interface FormState {
  values: ConfirmationFormValues
  errors: FormErrors
  submission: SubmissionStatus
  submissionMessage?: string
}

export type FormAction =
  | { type: 'FIELD_CHANGED'; field: keyof ConfirmationFormValues; value: string }
  | { type: 'VALIDATION_FAILED'; errors: FormErrors }
  | { type: 'SUBMIT_STARTED' }
  | { type: 'SUBMIT_FAILED'; message: string }

export function createInitialFormState(initialAmount: number): FormState {
  return {
    values: { fullName: '', address: '', amountPaid: String(initialAmount) },
    errors: {},
    submission: 'idle',
  }
}

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'FIELD_CHANGED':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        // Editing a field clears just that field's error rather than the whole
        // set, so fixing one mistake doesn't hide feedback about the others.
        errors: { ...state.errors, [action.field]: undefined },
      }
    case 'VALIDATION_FAILED':
      return { ...state, errors: action.errors, submission: 'idle' }
    case 'SUBMIT_STARTED':
      return {
        ...state,
        errors: {},
        submission: 'submitting',
        submissionMessage: undefined,
      }
    case 'SUBMIT_FAILED':
      return { ...state, submission: 'error', submissionMessage: action.message }
    default:
      return state
  }
}

/** Pure and independently testable — see CLAUDE.md's form-architecture note. */
export function validateConfirmationForm(
  values: ConfirmationFormValues,
  upload: UploadState,
): FormErrors {
  const errors: FormErrors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Please enter your name.'
  }

  if (!values.address.trim()) {
    errors.address = 'Please enter your address.'
  }

  const amount = Number(values.amountPaid)
  if (
    values.amountPaid.trim() === '' ||
    !Number.isFinite(amount) ||
    amount < DONATION_CONFIG.minAmount ||
    amount > DONATION_CONFIG.maxAmount
  ) {
    errors.amountPaid = `Please enter an amount between ₹${DONATION_CONFIG.minAmount} and ₹${DONATION_CONFIG.maxAmount}.`
  }

  if (upload.status === 'uploading') {
    errors.screenshot = 'Please wait for the screenshot to finish uploading.'
  } else if (upload.status === 'invalid' || upload.status === 'error') {
    errors.screenshot = 'Please upload a valid payment screenshot.'
  } else if (upload.status === 'empty') {
    errors.screenshot = 'Please upload your payment screenshot.'
  }

  return errors
}
