import { Link, NavLink, Navigate, Outlet, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '../design-system'
import { StatusBadge } from '../components/StatusBadge'
import { useResource, useReplaceResource } from '../queries/resourceQueries'
import { ApiError } from '../api/client'
import { EditBufferProvider } from '../features/resources/EditBufferProvider'
import { useEditBuffer } from '../features/resources/EditBufferContext'
import type { ResourceOutletContext } from '../features/resources/resourceOutlet'
import type { Resource } from '../domain/resource.types'
import { resourcePaths } from '../routes'

/** Banner shown for completed resources that have staged (unsaved) edits in the buffer. */
function UnsavedChangesBanner({ resourceId }: { resourceId: string }) {
  const buffer = useEditBuffer()
  const replace = useReplaceResource(resourceId)

  if (!buffer.isDirty) return null

  const submit = () => {
    replace.mutate(buffer.buildPayload(), { onSuccess: () => buffer.discard() })
  }

  return (
    <Banner role="status">
      <BannerText>
        You have unsaved changes. They live only in this browser session and are lost if
        you refresh or close it, until you submit.
      </BannerText>
      <BannerActions>
        <Button
          variant="ghost"
          onClick={() => buffer.discard()}
          disabled={replace.isPending}
        >
          Discard
        </Button>
        <Button onClick={submit} disabled={replace.isPending}>
          {replace.isPending ? 'Submitting…' : 'Submit changes'}
        </Button>
      </BannerActions>
      {replace.isError ? (
        <BannerError role="alert">
          {replace.error instanceof ApiError
            ? replace.error.message
            : 'Failed to submit changes.'}
        </BannerError>
      ) : null}
    </Banner>
  )
}

function ResourceHeader({
  resource,
  resourceId,
}: {
  resource: Resource
  resourceId: string
}) {
  return (
    <Header>
      <TopRow>
        <div>
          <BackLink to={resourcePaths.list}>← All resources</BackLink>
          <Title>{resource.name}</Title>
        </div>
        <StatusBadge status={resource.status} />
      </TopRow>
      <Tabs>
        <Tab to={resourcePaths.overview(resourceId)} end>
          Overview
        </Tab>
        <Tab to={resourcePaths.basicInfo(resourceId)}>Basic Info</Tab>
        <Tab to={resourcePaths.projectDetails(resourceId)}>Project Details</Tab>
        <Tab to={resourcePaths.details(resourceId)}>Details</Tab>
      </Tabs>
    </Header>
  )
}

/**
 * Layout for /resources/:resourceId. Loads the resource once, shares it with child routes via the
 * Outlet context, and hosts the in-memory edit buffer (keyed by id so it resets per resource but
 * survives background refetches of the same resource).
 */
export function ResourceLayout() {
  const { resourceId } = useParams()
  const { data: resource, isLoading, isError, error } = useResource(resourceId)

  if (!resourceId) return <Navigate to={resourcePaths.list} replace />

  if (isLoading) {
    return <Notice>Loading resource…</Notice>
  }

  if (isError || !resource) {
    const message =
      error instanceof ApiError ? error.message : 'Resource could not be loaded.'
    return (
      <Notice>
        <p>{message}</p>
        <BackLink to={resourcePaths.list}>← Back to all resources</BackLink>
      </Notice>
    )
  }

  return (
    <div>
      <ResourceHeader resource={resource} resourceId={resourceId} />
      <EditBufferProvider key={resource.resourceId} resource={resource}>
        {resource.status === 'completed' ? (
          <UnsavedChangesBanner resourceId={resourceId} />
        ) : null}
        <Outlet context={{ resource } satisfies ResourceOutletContext} />
      </EditBufferProvider>
    </div>
  )
}

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 0.9rem;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.9rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const Tabs = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Tab = styled(NavLink)`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  color: ${({ theme }) => theme.colors.inkMuted};
  text-decoration: none;
  border-bottom: 2px solid transparent;
  font-size: 0.95rem;

  &.active {
    color: ${({ theme }) => theme.colors.primaryStrong};
    border-bottom-color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
`

const Notice = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Banner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.accentSoft};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.sm};
`

const BannerText = styled.span`
  color: ${({ theme }) => theme.colors.inkStrong};
  font-size: 0.9rem;
  flex: 1 1 240px;
`

const BannerActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`

const BannerError = styled.p`
  flex-basis: 100%;
  margin: 0;
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.9rem;
`
