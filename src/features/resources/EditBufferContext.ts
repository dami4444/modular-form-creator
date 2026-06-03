import { createContext, useContext } from 'react'
import type {
  BasicInfo,
  ProjectDetails,
  ResourcePayload,
} from '../../domain/resource.types'

/**
 * In-memory, non-persistent edit buffer for a completed resource.
 * Edits to either module are staged here (never sent immediately) and persisted only via a single
 * full PUT on explicit submit. The buffer lives in React state, so a refresh discards it by design.
 */
export interface EditBufferValue {
  /** Effective Basic Info = staged buffer if present, else the server value. */
  basicInfo: BasicInfo
  /** Effective Project Details = staged buffer if present, else the server value. */
  projectDetails: ProjectDetails
  isBasicInfoStaged: boolean
  isProjectDetailsStaged: boolean
  /** True when any staged value actually differs from the server value. */
  isDirty: boolean
  stageBasicInfo: (values: BasicInfo) => void
  stageProjectDetails: (values: ProjectDetails) => void
  /** Drop all staged edits. */
  discard: () => void
  /** Build the full PUT payload from the effective (buffered) values. */
  buildPayload: () => ResourcePayload
}

export const EditBufferContext = createContext<EditBufferValue | null>(null)

export const useEditBuffer = (): EditBufferValue => {
  const value = useContext(EditBufferContext)
  if (!value) {
    throw new Error('useEditBuffer must be used within an EditBufferProvider')
  }
  return value
}
