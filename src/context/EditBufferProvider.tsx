import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { BasicInfo, ProjectDetails, Resource } from '../domain/resource.types'
import { sameStringSet } from '../domain/resource.rules'
import { EditBufferContext } from './EditBufferContext'
import type { EditBufferValue } from './EditBufferContext'

const sameBasicInfo = (a: BasicInfo, b: BasicInfo) =>
  a.resourceName === b.resourceName &&
  a.owner === b.owner &&
  a.email === b.email &&
  a.description === b.description &&
  a.priority === b.priority

const sameProjectDetails = (a: ProjectDetails, b: ProjectDetails) =>
  a.projectName === b.projectName &&
  a.budget === b.budget &&
  a.category === b.category &&
  sameStringSet(a.options, b.options)

interface EditBufferProviderProps {
  resource: Resource
  children: ReactNode
}

/**
 * Hosts the completed-resource edit buffer. Mount with `key={resourceId}` so navigating between
 * resources resets the buffer, while background refetches of the same resource keep it intact.
 */
export function EditBufferProvider({ resource, children }: EditBufferProviderProps) {
  const [basicInfoBuffer, setBasicInfoBuffer] = useState<BasicInfo | null>(null)
  const [projectDetailsBuffer, setProjectDetailsBuffer] = useState<ProjectDetails | null>(
    null,
  )

  const basicInfo = basicInfoBuffer ?? resource.basicInfo
  const projectDetails = projectDetailsBuffer ?? resource.projectDetails

  const isBasicInfoStaged =
    basicInfoBuffer !== null && !sameBasicInfo(basicInfoBuffer, resource.basicInfo)
  const isProjectDetailsStaged =
    projectDetailsBuffer !== null &&
    !sameProjectDetails(projectDetailsBuffer, resource.projectDetails)

  const stageBasicInfo = useCallback(
    (values: BasicInfo) => setBasicInfoBuffer(values),
    [],
  )
  const stageProjectDetails = useCallback(
    (values: ProjectDetails) => setProjectDetailsBuffer(values),
    [],
  )
  const discard = useCallback(() => {
    setBasicInfoBuffer(null)
    setProjectDetailsBuffer(null)
  }, [])

  const buildPayload = useCallback(
    () => ({
      name: resource.name,
      basicInfo,
      projectDetails,
    }),
    [resource.name, basicInfo, projectDetails],
  )

  const value = useMemo<EditBufferValue>(
    () => ({
      basicInfo,
      projectDetails,
      isBasicInfoStaged,
      isProjectDetailsStaged,
      isDirty: isBasicInfoStaged || isProjectDetailsStaged,
      stageBasicInfo,
      stageProjectDetails,
      discard,
      buildPayload,
    }),
    [
      basicInfo,
      projectDetails,
      isBasicInfoStaged,
      isProjectDetailsStaged,
      stageBasicInfo,
      stageProjectDetails,
      discard,
      buildPayload,
    ],
  )

  return <EditBufferContext.Provider value={value}>{children}</EditBufferContext.Provider>
}
