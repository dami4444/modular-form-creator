import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Card } from '../design-system'
import { ModuleProgressList } from '../components/ModuleProgressList'
import { canProvision } from '../domain/resource.rules'
import { getErrorMessage } from '../api/client'
import { useProvisionResource } from '../queries/resourceQueries'
import { useResourceOutletContext } from '../features/resources/resourceOutlet'
import { resourcePaths } from '../routes'
import { Heading, Lead } from './pageText'

/** Resource overview: module progress, edit entry points, and the provisioning action. */
export function ResourceOverviewPage() {
  const { resourceId = '' } = useParams()
  const navigate = useNavigate()
  const { resource } = useResourceOutletContext()
  const provision = useProvisionResource(resourceId)

  const isDraft = resource.status === 'draft'
  const provisionReady = canProvision(resource)

  return (
    <Stack>
      <Card>
        <Heading>Modules</Heading>
        <ModuleProgressList resource={resource} />
        <Row>
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
        </Row>
      </Card>

      <Card>
        <Heading>{isDraft ? 'Provisioning' : 'Status'}</Heading>
        {isDraft ? (
          <>
            <Lead>
              Provisioning moves this resource from draft to completed. It is allowed only
              when both modules are complete.
            </Lead>
            <Row>
              <Button
                onClick={() => provision.mutate()}
                disabled={!provisionReady || provision.isPending}
              >
                {provision.isPending ? 'Provisioning…' : 'Provision resource'}
              </Button>
            </Row>
            {!provisionReady ? (
              <Hint>Complete both modules to enable provisioning.</Hint>
            ) : null}
            {provision.isError ? (
              <ServerError role="alert">{getErrorMessage(provision.error)}</ServerError>
            ) : null}
          </>
        ) : (
          <Lead>
            This resource is completed. Edit a module to stage changes, then submit them
            from the banner above. Re-provisioning is not allowed.
          </Lead>
        )}
      </Card>

      <Row>
        <Button
          variant="ghost"
          onClick={() => navigate(resourcePaths.details(resourceId))}
        >
          View details →
        </Button>
      </Row>
    </Stack>
  )
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Hint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.85rem;
`

const ServerError = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.9rem;
`
