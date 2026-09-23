import { describe, expect, it } from 'vitest'
import {
  createInitialFormState,
  formReducer,
  validateConfirmationForm,
} from './confirmationFormReducer'
import type { ConfirmationFormValues, UploadState } from './types'

const validValues: ConfirmationFormValues = {
  fullName: 'Asha Rao',
  address: '12 MG Road, Bengaluru',
  amountPaid: '500',
}

const uploadedState: UploadState = {
  status: 'uploaded',
  file: new File(['x'], 'proof.png', { type: 'image/png' }),
  fileName: 'proof.png',
  previewUrl: 'blob:mock',
}

describe('validateConfirmationForm', () => {
  it('accepts a fully valid submission', () => {
    expect(validateConfirmationForm(validValues, uploadedState)).toEqual({})
  })

  it('flags an empty full name', () => {
    const errors = validateConfirmationForm(
      { ...validValues, fullName: '  ' },
      uploadedState,
    )
    expect(errors.fullName).toBe('Please enter your name.')
  })

  it('flags an empty address', () => {
    const errors = validateConfirmationForm(
      { ...validValues, address: '' },
      uploadedState,
    )
    expect(errors.address).toBe('Please enter your address.')
  })

  it('flags an amount below the minimum', () => {
    const errors = validateConfirmationForm(
      { ...validValues, amountPaid: '299' },
      uploadedState,
    )
    expect(errors.amountPaid).toMatch(/between ₹300 and ₹3000/)
  })

  it('flags an amount above the maximum', () => {
    const errors = validateConfirmationForm(
      { ...validValues, amountPaid: '3001' },
      uploadedState,
    )
    expect(errors.amountPaid).toMatch(/between ₹300 and ₹3000/)
  })

  it('flags a non-numeric amount', () => {
    const errors = validateConfirmationForm(
      { ...validValues, amountPaid: 'abc' },
      uploadedState,
    )
    expect(errors.amountPaid).toBeDefined()
  })

  it.each<[UploadState, string]>([
    [{ status: 'empty' }, 'Please upload your payment screenshot.'],
    [
      { status: 'uploading', fileName: 'proof.png' },
      'Please wait for the screenshot to finish uploading.',
    ],
    [
      { status: 'invalid', message: 'bad file' },
      'Please upload a valid payment screenshot.',
    ],
    [
      { status: 'error', message: 'network error' },
      'Please upload a valid payment screenshot.',
    ],
  ])('flags screenshot state %o', (uploadState, expectedMessage) => {
    const errors = validateConfirmationForm(validValues, uploadState)
    expect(errors.screenshot).toBe(expectedMessage)
  })
})

describe('formReducer', () => {
  it('starts with the given initial amount pre-filled and no errors', () => {
    const state = createInitialFormState(500)
    expect(state).toEqual({
      values: { fullName: '', address: '', amountPaid: '500' },
      errors: {},
      submission: 'idle',
    })
  })

  it('FIELD_CHANGED updates only that field and clears only that field error', () => {
    const initial = {
      ...createInitialFormState(500),
      errors: {
        fullName: 'Please enter your name.',
        address: 'Please enter your address.',
      },
    }
    const next = formReducer(initial, {
      type: 'FIELD_CHANGED',
      field: 'fullName',
      value: 'Asha',
    })
    expect(next.values.fullName).toBe('Asha')
    expect(next.errors.fullName).toBeUndefined()
    expect(next.errors.address).toBe('Please enter your address.')
  })

  it('VALIDATION_FAILED sets errors and returns submission to idle', () => {
    const submitting = formReducer(createInitialFormState(500), {
      type: 'SUBMIT_STARTED',
    })
    const next = formReducer(submitting, {
      type: 'VALIDATION_FAILED',
      errors: { fullName: 'Please enter your name.' },
    })
    expect(next.submission).toBe('idle')
    expect(next.errors.fullName).toBe('Please enter your name.')
  })

  it('SUBMIT_STARTED clears prior errors and enters submitting', () => {
    const withError = formReducer(createInitialFormState(500), {
      type: 'SUBMIT_FAILED',
      message: 'nope',
    })
    const next = formReducer(withError, { type: 'SUBMIT_STARTED' })
    expect(next.submission).toBe('submitting')
    expect(next.errors).toEqual({})
    expect(next.submissionMessage).toBeUndefined()
  })

  it('SUBMIT_FAILED sets the error state but preserves field values', () => {
    const filled = formReducer(createInitialFormState(500), {
      type: 'FIELD_CHANGED',
      field: 'fullName',
      value: 'Asha',
    })
    const submitting = formReducer(filled, { type: 'SUBMIT_STARTED' })
    const failed = formReducer(submitting, {
      type: 'SUBMIT_FAILED',
      message: 'Network error.',
    })
    expect(failed.submission).toBe('error')
    expect(failed.submissionMessage).toBe('Network error.')
    expect(failed.values.fullName).toBe('Asha')
  })
})
