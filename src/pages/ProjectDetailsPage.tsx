import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card } from '../design-system'
import { ProjectDetailsForm } from '../forms/ProjectDetailsForm'
import type { ProjectDetailsFormValues } from '../domain/resource.schema'
import { isBasicInfoComplete } from '../domain/resource.rules'
import { getErrorMessage } from '../api/client'
import { useUpdateProjectDetails } from '../queries/resourceQueries'
import { useResourceOutletContext } from '../features/resources/resourceOutlet'
import { useEditBuffer } from '../features/resources/EditBufferContext'
import { resourcePaths } from '../routes'
import { Heading, Lead } from './pageText'

/**
 * Project Details module page.
 * - Draft: locked until Basic Info is complete (mirrors backend); submit PATCHes /project-details.
 * - Completed: submit stages edits into the in-memory buffer.
 */
export function ProjectDetailsPage() {
  const { resourceId = '' } = useParams()
  const navigate = useNavigate()
  const { resource } = useResourceOutletContext()
  const buffer = useEditBuffer()
  const update = useUpdateProjectDetails(resourceId)

  const isCompleted = resource.status === 'completed'
  const isLocked = !isCompleted && !isBasicInfoComplete(resource.basicInfo)

  if (isLocked) {
    return (
      <Card>
        <Heading>Project Details</Heading>
        <Lead>This module unlocks once Basic Info is complete.</Lead>
        <div>
          <Button onClick={() => navigate(resourcePaths.basicInfo(resourceId))}>
            Go to Basic Info
          </Button>
        </div>
      </Card>
    )
  }

  const defaultValues: ProjectDetailsFormValues = isCompleted
    ? buffer.projectDetails
    : resource.projectDetails

  const handleSubmit = (values: ProjectDetailsFormValues) => {
    if (isCompleted) {
      // Stay on the tab; the form re-syncs to the staged values and the layout banner appears.
      buffer.stageProjectDetails(values)
      return
    }
    update.mutate(values, {
      onSuccess: () => navigate(resourcePaths.overview(resourceId)),
    })
  }

  return (
    <Card>
      <Heading>Project Details</Heading>
      <Lead>
        {isCompleted
          ? 'Changes are staged locally and applied only when you submit from the overview.'
          : 'Complete every field to enable provisioning.'}
      </Lead>
      <ProjectDetailsForm
        defaultValues={defaultValues}
        submitLabel={isCompleted ? 'Stage changes' : 'Save Project Details'}
        submitting={update.isPending}
        errorMessage={update.isError ? getErrorMessage(update.error) : undefined}
        onSubmit={handleSubmit}
      />
    </Card>
  )
}
