/**
 * Business rules mirrored from backend/src/modules/resources/resource.service.ts.
 * Keep these in lock-step with the backend so the UI gates exactly match server behavior.
 */
import type { BasicInfo, ProjectDetails, Resource } from './resource.types'

export const PRIORITY_VALUES = ['low', 'medium', 'high'] as const
export const CATEGORY_VALUES = ['internal', 'external', 'vendor'] as const
export const TEAM_MEMBER_VALUES = [
  'FE devs',
  'BE devs',
  'Designer',
  'Data Eng',
  'Product Owner',
] as const

export type Priority = (typeof PRIORITY_VALUES)[number]
export type Category = (typeof CATEGORY_VALUES)[number]

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

/** Labeled options for the priority Select (placeholder added by the form). */
export const PRIORITY_OPTIONS = PRIORITY_VALUES.map((value) => ({
  value,
  label: titleCase(value),
}))

/** Labeled options for the category Select (placeholder added by the form). */
export const CATEGORY_OPTIONS = CATEGORY_VALUES.map((value) => ({
  value,
  label: titleCase(value),
}))

/** Mirrors backend isBasicInfoComplete: all five fields must be truthy. */
export const isBasicInfoComplete = (basicInfo: BasicInfo): boolean =>
  Boolean(
    basicInfo.resourceName &&
    basicInfo.owner &&
    basicInfo.email &&
    basicInfo.description &&
    basicInfo.priority,
  )

/** Mirrors backend isProjectDetailsComplete: scalar fields truthy + at least one option. */
export const isProjectDetailsComplete = (projectDetails: ProjectDetails): boolean =>
  Boolean(
    projectDetails.projectName &&
    projectDetails.budget &&
    projectDetails.category &&
    projectDetails.options.length > 0,
  )

/**
 * Project Details module is editable (as a draft) only once Basic Info is complete.
 * Mirrors the backend guard on PATCH /project-details.
 */
export const isProjectDetailsUnlocked = (resource: Resource): boolean =>
  isBasicInfoComplete(resource.basicInfo)

/** Provisioning is allowed only for a draft whose two modules are both complete. */
export const canProvision = (resource: Resource): boolean =>
  resource.status === 'draft' &&
  isBasicInfoComplete(resource.basicInfo) &&
  isProjectDetailsComplete(resource.projectDetails)

/** Order-independent equality for a list of option strings (e.g. team members). */
export const sameStringSet = (a: string[], b: string[]): boolean =>
  a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|')
