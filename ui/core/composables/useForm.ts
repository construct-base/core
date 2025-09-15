import { ref, reactive, computed, watch } from 'vue'

export interface FormField<T = any> {
  value: T
  error: string | null
  touched: boolean
  rules: ValidationRule<T>[]
}

export interface ValidationRule<T> {
  validate: (value: T) => boolean | string
  message?: string
}

export interface FormState {
  [key: string]: FormField
}

export function useForm<T extends Record<string, any>>(initialData: T) {
  // Form state
  const formData = reactive<T>({ ...initialData })
  const fields = reactive<FormState>({})
  const isSubmitting = ref(false)
  const submitError = ref<string | null>(null)

  // Initialize fields
  Object.keys(initialData).forEach(key => {
    fields[key] = {
      value: initialData[key],
      error: null,
      touched: false,
      rules: []
    }
  })

  // Watch for changes and update field values
  Object.keys(formData).forEach(key => {
    watch(
      () => formData[key],
      (newValue) => {
        if (fields[key]) {
          fields[key].value = newValue
          if (fields[key].touched) {
            validateField(key)
          }
        }
      }
    )
  })

  // Validation
  const validateField = (fieldName: string): boolean => {
    const field = fields[fieldName]
    if (!field) return true

    field.error = null

    for (const rule of field.rules) {
      const result = rule.validate(field.value)
      if (typeof result === 'string') {
        field.error = result
        return false
      } else if (result === false) {
        field.error = rule.message || `${fieldName} is invalid`
        return false
      }
    }

    return true
  }

  const validateAll = (): boolean => {
    let isValid = true

    Object.keys(fields).forEach(fieldName => {
      fields[fieldName].touched = true
      if (!validateField(fieldName)) {
        isValid = false
      }
    })

    return isValid
  }

  // Field management
  const setFieldRule = (fieldName: string, rules: ValidationRule<any>[]): void => {
    if (fields[fieldName]) {
      fields[fieldName].rules = rules
    }
  }

  const setFieldError = (fieldName: string, error: string | null): void => {
    if (fields[fieldName]) {
      fields[fieldName].error = error
    }
  }

  const touchField = (fieldName: string): void => {
    if (fields[fieldName]) {
      fields[fieldName].touched = true
      validateField(fieldName)
    }
  }

  const resetField = (fieldName: string): void => {
    if (fields[fieldName]) {
      fields[fieldName].value = initialData[fieldName]
      fields[fieldName].error = null
      fields[fieldName].touched = false
      formData[fieldName] = initialData[fieldName]
    }
  }

  const reset = (): void => {
    Object.keys(fields).forEach(resetField)
    submitError.value = null
    isSubmitting.value = false
  }

  // Computed
  const isValid = computed(() => {
    return Object.values(fields).every(field => !field.error)
  })

  const hasErrors = computed(() => {
    return Object.values(fields).some(field => field.error)
  })

  const touchedFields = computed(() => {
    return Object.values(fields).some(field => field.touched)
  })

  // Form submission
  const submit = async (
    submitFn: (data: T) => Promise<any>,
    onSuccess?: (result: any) => void,
    onError?: (error: any) => void
  ): Promise<boolean> => {
    isSubmitting.value = true
    submitError.value = null

    if (!validateAll()) {
      isSubmitting.value = false
      return false
    }

    try {
      const result = await submitFn(formData)

      if (onSuccess) {
        onSuccess(result)
      }

      return true
    } catch (error: any) {
      submitError.value = error.message || 'Submission failed'

      if (onError) {
        onError(error)
      }

      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    // Data
    formData,
    fields: readonly(fields),

    // State
    isSubmitting: readonly(isSubmitting),
    submitError: readonly(submitError),

    // Computed
    isValid,
    hasErrors,
    touchedFields,

    // Actions
    validateField,
    validateAll,
    setFieldRule,
    setFieldError,
    touchField,
    resetField,
    reset,
    submit
  }
}

// Common validation rules
export const validationRules = {
  required: <T>(message = 'This field is required'): ValidationRule<T> => ({
    validate: (value: T) => {
      if (value === null || value === undefined) return false
      if (typeof value === 'string') return value.trim().length > 0
      if (Array.isArray(value)) return value.length > 0
      return true
    },
    message
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    validate: (value: string) => {
      if (!value) return true // Allow empty, use required rule separately
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => {
      if (!value) return true // Allow empty, use required rule separately
      return value.length >= min
    },
    message: message || `Must be at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => {
      if (!value) return true
      return value.length <= max
    },
    message: message || `Must be no more than ${max} characters`
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: (value: string) => {
      if (!value) return true
      return regex.test(value)
    },
    message
  }),

  numeric: (message = 'Must be a number'): ValidationRule<string | number> => ({
    validate: (value: string | number) => {
      if (value === '' || value === null || value === undefined) return true
      return !isNaN(Number(value))
    },
    message
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => {
      if (value === null || value === undefined) return true
      return value >= min
    },
    message: message || `Must be at least ${min}`
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => {
      if (value === null || value === undefined) return true
      return value <= max
    },
    message: message || `Must be no more than ${max}`
  }),

  custom: <T>(
    validateFn: (value: T) => boolean | string,
    message = 'Invalid value'
  ): ValidationRule<T> => ({
    validate: validateFn,
    message
  })
}