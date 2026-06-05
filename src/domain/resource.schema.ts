/**
 * Zod form schemas mirroring backend validation
 * (backend/src/modules/resources/resource.service.ts).
 *
 * Field value types are kept as plain string / string[] (enum membership enforced via .refine)
 * so the inferred form types line up with BasicInfo / ProjectDetails and the empty placeholder
 * default ('' / []) stays type-clean for React Hook Form.
 */
import { z } from 'zod'
import { CATEGORY_VALUES, PRIORITY_VALUES, TEAM_MEMBER_VALUES } from './resource.rules'

// Regexes copied verbatim from the backend service.
const NAME_REGEX = /^[A-Za-z0-9 -]+$/
const OWNER_REGEX = /^[A-Za-z ]+$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INTEGER_REGEX = /^\d+$/

const oneOf = (values: readonly string[]) => (value: string) => values.includes(value)

const resourceNameSchema = z
  .string()
  .min(1, 'Resource name is required')
  .max(255, 'Resource name must be at most 255 characters')
  .regex(NAME_REGEX, 'Only letters, numbers, spaces, and hyphens are allowed')

const projectNameSchema = z
  .string()
  .min(1, 'Project name is required')
  .max(255, 'Project name must be at most 255 characters')
  .regex(NAME_REGEX, 'Only letters, numbers, spaces, and hyphens are allowed')

const ownerSchema = z
  .string()
  .min(1, 'Owner is required')
  .max(255, 'Owner must be at most 255 characters')
  .regex(OWNER_REGEX, 'Owner can contain only letters and spaces')

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .regex(EMAIL_REGEX, 'Enter a valid email address')

const descriptionSchema = z
  .string()
  .min(1, 'Description is required')
  .max(1000, 'Description must be at most 1000 characters')

const prioritySchema = z.string().refine(oneOf(PRIORITY_VALUES), 'Select a priority')

const budgetSchema = z
  .string()
  .min(1, 'Budget is required')
  .regex(INTEGER_REGEX, 'Budget must be a whole number')

const categorySchema = z.string().refine(oneOf(CATEGORY_VALUES), 'Select a category')

const optionsSchema = z
  .array(z.string())
  .min(1, 'Select at least one team member')
  .refine(
    (values) => values.every(oneOf(TEAM_MEMBER_VALUES)),
    'Unsupported team member selected',
  )

export const basicInfoSchema = z.object({
  resourceName: resourceNameSchema,
  owner: ownerSchema,
  email: emailSchema,
  description: descriptionSchema,
  priority: prioritySchema,
})

export const projectDetailsSchema = z.object({
  projectName: projectNameSchema,
  budget: budgetSchema,
  category: categorySchema,
  options: optionsSchema,
})

export const createResourceSchema = z.object({
  resourceName: resourceNameSchema,
})

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>
export type ProjectDetailsFormValues = z.infer<typeof projectDetailsSchema>
export type CreateResourceFormValues = z.infer<typeof createResourceSchema>
