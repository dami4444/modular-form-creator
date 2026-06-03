import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Select } from '../design-system'
import { PRIORITY_OPTIONS } from '../domain/resource.rules'
import { basicInfoSchema } from '../domain/resource.schema'
import type { BasicInfoFormValues } from '../domain/resource.schema'
import { Actions, Form, ServerError } from './formLayout'

interface BasicInfoFormProps {
  defaultValues: BasicInfoFormValues
  submitLabel: string
  submitting?: boolean
  errorMessage?: string
  onSubmit: (values: BasicInfoFormValues) => void
}

const PRIORITY_SELECT_OPTIONS = [
  { value: '', label: 'Select priority…' },
  ...PRIORITY_OPTIONS,
]

/**
 * Basic Info module form. The resource name is locked (cannot change after creation).
 * The caller decides what `onSubmit` does (draft PATCH vs. staging into the edit buffer).
 */
export function BasicInfoForm({
  defaultValues,
  submitLabel,
  submitting,
  errorMessage,
  onSubmit,
}: BasicInfoFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    // `values` (vs `defaultValues`) keeps the form in sync with the buffer/server source:
    // discarding staged edits reverts the fields, and staging resets the dirty state.
    values: defaultValues,
  })

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Controller
        control={control}
        name="resourceName"
        render={({ field }) => (
          <Input
            label="Resource name"
            state="locked"
            helperText="Locked after creation"
            value={field.value}
            readOnly
          />
        )}
      />
      <Controller
        control={control}
        name="owner"
        render={({ field, fieldState }) => (
          <Input
            label="Owner"
            placeholder="Jane Doe"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <Input
            label="Email"
            type="email"
            placeholder="jane@example.com"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <Input
            label="Description"
            multiline
            rows={4}
            placeholder="What is this resource for?"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="priority"
        render={({ field, fieldState }) => (
          <Select
            label="Priority"
            options={PRIORITY_SELECT_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      {errorMessage ? <ServerError role="alert">{errorMessage}</ServerError> : null}

      <Actions>
        <Button type="submit" disabled={submitting || !isDirty}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </Actions>
    </Form>
  )
}
