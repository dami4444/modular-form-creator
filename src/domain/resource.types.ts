/**
 * Frontend mirror of the backend resource contract.
 * Source of truth: backend/src/modules/resources/resource.dto.ts and resource.model.ts.
 * These types must not drift from the backend — do not change shapes here independently.
 */

export type ResourceStatus = 'draft' | 'completed'

export interface BasicInfo {
  resourceName: string
  owner: string
  email: string
  description: string
  priority: string
}

export interface ProjectDetails {
  projectName: string
  budget: string
  category: string
  options: string[]
}

/** A resource as returned by the backend (Mongo document serialized to JSON). */
export interface Resource {
  _id: string
  resourceId: number
  name: string
  status: ResourceStatus
  basicInfo: BasicInfo
  projectDetails: ProjectDetails
  createdAt: string
  updatedAt: string
}

/** Body for PUT /api/resources/{id} (full replace of business data). */
export interface ResourcePayload {
  name: string
  basicInfo: BasicInfo
  projectDetails: ProjectDetails
}

export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ListResourcesResponse {
  items: Resource[]
  pagination: Pagination
}

export interface ListResourcesParams {
  page?: number
  pageSize?: number
  status?: ResourceStatus
  name?: string
  sortOrder?: 'asc' | 'desc'
}
