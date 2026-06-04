import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '../design-system'
import { BasicInfoForm } from '../forms/BasicInfoForm'
import type { BasicInfoFormValues } from '../domain/resource.schema'
import { getErrorMessage } from '../api/client'
import { useUpdateBasicInfo } from '../queries/resourceQueries'
import { useResourceOutletContext } from '../features/resources/resourceOutlet'
import { useEditBuffer } from '../features/resources/EditBufferContext'
import { resourcePaths } from '../routes'
import { Heading, Text } from '../components/ui'

/**
 * Basic Info module page.
 * - Draft: submit PATCHes /basic-info.
 * - Completed: submit stages edits into the in-memory buffer (persisted later via the layout's PUT).
 */
export function BasicInfoPage() {
  const { resourceId = '' } = useParams()
  const navigate = useNavigate()
  const { resource } = useResourceOutletContext()
  const buffer = useEditBuffer()
  const update = useUpdateBasicInfo(resourceId)

  const isCompleted = resource.status === 'completed'
  const defaultValues: BasicInfoFormValues = isCompleted
    ? buffer.basicInfo
    : resource.basicInfo

  const handleSubmit = (values: BasicInfoFormValues) => {
    if (isCompleted) {
      // Stay on the tab; the form re-syncs to the staged values and the layout banner appears.
      buffer.stageBasicInfo(values)
      return
    }
    update.mutate(values, {
      // Draft: a successful save means Basic Info is complete, so advance to the next
      // step — Project Details, which is now unlocked.
      onSuccess: () => navigate(resourcePaths.projectDetails(resourceId)),
    })
  }

  return (
    <Card>
      <Heading>Basic Info</Heading>
      <Text tone="muted">
        {isCompleted
          ? 'Changes are staged locally and applied only when you submit from the overview.'
          : 'Complete every field to unlock Project Details.'}
      </Text>
      <BasicInfoForm
        defaultValues={defaultValues}
        submitLabel={isCompleted ? 'Stage changes' : 'Save Basic Info'}
        submitting={update.isPending}
        errorMessage={update.isError ? getErrorMessage(update.error) : undefined}
        onSubmit={handleSubmit}
      />
    </Card>
  )
}
