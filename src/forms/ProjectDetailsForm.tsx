import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, CheckboxGroup, Input, Select } from '../design-system'
import { CATEGORY_OPTIONS, TEAM_MEMBER_VALUES } from '../domain/resource.rules'
import { projectDetailsSchema } from '../domain/resource.schema'
import type { ProjectDetailsFormValues } from '../domain/resource.schema'
import { Actions, Form, ServerError } from './formLayout'

interface ProjectDetailsFormProps {
  defaultValues: ProjectDetailsFormValues
  submitLabel: string
  submitting?: boolean
  errorMessage?: string
  onSubmit: (values: ProjectDetailsFormValues) => void
}

const CATEGORY_SELECT_OPTIONS = [
  { value: '', label: 'Select category…' },
  ...CATEGORY_OPTIONS,
]

const TEAM_MEMBER_OPTIONS = [...TEAM_MEMBER_VALUES]

/**
 * Project Details module form. The caller decides what `onSubmit` does
 * (draft PATCH vs. staging into the edit buffer).
 */
export function ProjectDetailsForm({
  defaultValues,
  submitLabel,
  submitting,
  errorMessage,
  onSubmit,
}: ProjectDetailsFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<ProjectDetailsFormValues>({
    resolver: zodResolver(projectDetailsSchema),
    // `values` (vs `defaultValues`) keeps the form in sync with the buffer/server source:
    // discarding staged edits reverts the fields, and staging resets the dirty state.
    values: defaultValues,
  })

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Controller
        control={control}
        name="projectName"
        render={({ field, fieldState }) => (
          <Input
            label="Project name"
            placeholder="Apollo"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="budget"
        render={({ field, fieldState }) => (
          <Input
            label="Budget"
            inputMode="numeric"
            placeholder="50000"
            helperText="Whole numbers only"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="category"
        render={({ field, fieldState }) => (
          <Select
            label="Category"
            options={CATEGORY_SELECT_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="options"
        render={({ field, fieldState }) => (
          <CheckboxGroup
            label="Team members"
            options={TEAM_MEMBER_OPTIONS}
            value={field.value}
            onChange={field.onChange}
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
