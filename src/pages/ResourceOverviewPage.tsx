import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card } from '../design-system'
import { ModuleProgressList } from '../components/ModuleProgressList'
import { canProvision } from '../domain/resource.rules'
import { getErrorMessage } from '../api/client'
import { useProvisionResource } from '../queries/resourceQueries'
import { useResourceOutletContext } from '../features/resources/resourceOutlet'
import { resourcePaths } from '../routes'
import { Heading, Inline, Stack, Text } from '../components/ui'

/** Resource overview: module progress, edit entry points, and the provisioning action. */
export function ResourceOverviewPage() {
  const { resourceId = '' } = useParams()
  const navigate = useNavigate()
  const { resource } = useResourceOutletContext()
  const provision = useProvisionResource(resourceId)

  const isDraft = resource.status === 'draft'
  const provisionReady = canProvision(resource)

  return (
    <Stack gap="lg">
      <Card>
        <Heading>Modules</Heading>
        <ModuleProgressList resource={resource} />
        <Inline wrap>
          <Button
            variant="secondary"
            onClick={() => navigate(resourcePaths.basicInfo(resourceId))}
          >
            Edit Basic Info
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(resourcePaths.projectDetails(resourceId))}
          >
            Edit Project Details
          </Button>
        </Inline>
      </Card>

      <Card>
        <Heading>{isDraft ? 'Provisioning' : 'Status'}</Heading>
        {isDraft ? (
          <>
            <Text tone="muted">
              Provisioning moves this resource from draft to completed. It is allowed only
              when both modules are complete.
            </Text>
            <Inline wrap>
              <Button
                onClick={() => provision.mutate()}
                disabled={!provisionReady || provision.isPending}
              >
                {provision.isPending ? 'Provisioning…' : 'Provision resource'}
              </Button>
            </Inline>
            {!provisionReady ? (
              <Text tone="muted" size="sm">
                Complete both modules to enable provisioning.
              </Text>
            ) : null}
            {provision.isError ? (
              <Text tone="error" role="alert">
                {getErrorMessage(provision.error)}
              </Text>
            ) : null}
          </>
        ) : (
          <Text tone="muted">
            This resource is completed. Edit a module to stage changes, then submit them
            from the banner above. Re-provisioning is not allowed.
          </Text>
        )}
      </Card>

      <Inline wrap>
        <Button
          variant="ghost"
          onClick={() => navigate(resourcePaths.details(resourceId))}
        >
          View details →
        </Button>
      </Inline>
    </Stack>
  )
}
