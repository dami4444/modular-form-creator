/** One function per backend resource endpoint (see backend/README.md). */
import type {
  BasicInfo,
  ListResourcesParams,
  ListResourcesResponse,
  ProjectDetails,
  Resource,
  ResourcePayload,
} from '../domain/resource.types'
import { api } from './client'

const buildListQuery = (params: ListResourcesParams): string => {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  if (params.status) search.set('status', params.status)
  if (params.name?.trim()) search.set('name', params.name.trim())
  if (params.sortOrder) search.set('sortOrder', params.sortOrder)
  const query = search.toString()
  return query ? `?${query}` : ''
}

export const listResources = (params: ListResourcesParams) =>
  api.get<ListResourcesResponse>(`/api/resources${buildListQuery(params)}`)

export const getResource = (id: string | number) =>
  api.get<Resource>(`/api/resources/${id}`)

export const createResource = (resourceName: string) =>
  api.post<Resource>('/api/resources', { resourceName })

export const updateBasicInfo = (id: string | number, data: BasicInfo) =>
  api.patch<Resource>(`/api/resources/${id}/basic-info`, data)

export const updateProjectDetails = (id: string | number, data: ProjectDetails) =>
  api.patch<Resource>(`/api/resources/${id}/project-details`, data)

export const provisionResource = (id: string | number) =>
  api.patch<Resource>(`/api/resources/${id}/provisioning`, {})

export const replaceResource = (id: string | number, data: ResourcePayload) =>
  api.put<Resource>(`/api/resources/${id}`, data)

export const deleteResource = (id: string | number) =>
  api.delete<Resource>(`/api/resources/${id}`)
