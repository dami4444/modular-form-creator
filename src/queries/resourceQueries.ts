/** TanStack Query hooks + query keys for the resource API. */
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createResource,
  deleteResource,
  getResource,
  listResources,
  provisionResource,
  replaceResource,
  updateBasicInfo,
  updateProjectDetails,
} from '../api/resources'
import type {
  BasicInfo,
  ListResourcesParams,
  ProjectDetails,
  Resource,
  ResourcePayload,
} from '../domain/resource.types'

export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (params: ListResourcesParams) => [...resourceKeys.lists(), params] as const,
  details: () => [...resourceKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...resourceKeys.details(), String(id)] as const,
}

export const useResources = (params: ListResourcesParams) =>
  useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: () => listResources(params),
    placeholderData: keepPreviousData,
  })

export const useResource = (id: string | undefined) =>
  useQuery({
    queryKey: resourceKeys.detail(id ?? ''),
    queryFn: () => getResource(id as string),
    enabled: Boolean(id),
  })

export const useCreateResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (resourceName: string) => createResource(resourceName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
  })
}

export const useDeleteResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => deleteResource(id),
    onSuccess: (deleted) => {
      queryClient.removeQueries({ queryKey: resourceKeys.detail(deleted.resourceId) })
      void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
  })
}

/** Shared cache update for mutations that return the updated resource. */
const syncResourceCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  resource: Resource,
) => {
  queryClient.setQueryData(resourceKeys.detail(resource.resourceId), resource)
  void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
}

export const useUpdateBasicInfo = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BasicInfo) => updateBasicInfo(id, data),
    onSuccess: (resource) => syncResourceCache(queryClient, resource),
  })
}

export const useUpdateProjectDetails = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectDetails) => updateProjectDetails(id, data),
    onSuccess: (resource) => syncResourceCache(queryClient, resource),
  })
}

export const useProvisionResource = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => provisionResource(id),
    onSuccess: (resource) => syncResourceCache(queryClient, resource),
  })
}

export const useReplaceResource = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ResourcePayload) => replaceResource(id, payload),
    onSuccess: (resource) => syncResourceCache(queryClient, resource),
  })
}
