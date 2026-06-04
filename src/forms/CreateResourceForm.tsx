import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '../design-system'
import { createResourceSchema } from '../domain/resource.schema'
import type { CreateResourceFormValues } from '../domain/resource.schema'
import { Form } from './formLayout'
import { Text } from '../components/ui'

interface CreateResourceFormProps {
  submitting?: boolean
  errorMessage?: string
  onSubmit: (resourceName: string) => void
}

/** Single-field form to create a resource from its name. */
export function CreateResourceForm({
  submitting,
  errorMessage,
  onSubmit,
}: CreateResourceFormProps) {
  const { control, handleSubmit } = useForm<CreateResourceFormValues>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: { resourceName: '' },
  })

  return (
    <Form
      onSubmit={handleSubmit((values) => onSubmit(values.resourceName.trim()))}
      noValidate
    >
      <Controller
        control={control}
        name="resourceName"
        render={({ field, fieldState }) => (
          <Input
            label="Resource name"
            placeholder="My new resource"
            helperText="Letters, numbers, spaces, and hyphens. Cannot be changed later."
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoFocus
          />
        )}
      />

      {errorMessage ? (
        <Text tone="error" role="alert">
          {errorMessage}
        </Text>
      ) : null}

      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? 'Creating…' : 'Create resource'}
      </Button>
    </Form>
  )
}
