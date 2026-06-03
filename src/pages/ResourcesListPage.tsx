import { useEffect, useState, type HTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Card, Drawer, IconButton, Input, Select } from '../design-system'
import { StatusBadge } from '../components/StatusBadge'
import { CreateResourceForm } from '../forms/CreateResourceForm'
import { getErrorMessage } from '../api/client'
import {
  useCreateResource,
  useDeleteResource,
  useResources,
} from '../queries/resourceQueries'
import type { ResourceStatus } from '../domain/resource.types'
import { resourcePaths } from '../routes'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
]

const SORT_OPTIONS = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
]

export function ResourcesListPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'' | ResourceStatus>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [nameInput, setNameInput] = useState('')
  const [nameQuery, setNameQuery] = useState('')

  const [isCreateOpen, setCreateOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  // Debounce the name search and reset to the first page when it changes.
  useEffect(() => {
    const timer = setTimeout(() => {
      setNameQuery(nameInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [nameInput])

  const { data, isLoading, isError, error, isFetching } = useResources({
    page,
    pageSize: PAGE_SIZE,
    status: status || undefined,
    name: nameQuery || undefined,
    sortOrder,
  })

  const create = useCreateResource()
  const remove = useDeleteResource()

  const items = data?.items ?? []
  const pagination = data?.pagination

  const handleCreate = (resourceName: string) => {
    create.mutate(resourceName, {
      onSuccess: (resource) => {
        setCreateOpen(false)
        create.reset()
        navigate(resourcePaths.overview(resource.resourceId))
      },
    })
  }

  const closeCreate = () => {
    setCreateOpen(false)
    create.reset()
  }

  return (
    <div>
      <PageHeader>
        <div>
          <Title>Resources</Title>
          <Subtitle>Create, track, and complete resources.</Subtitle>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ New resource</Button>
      </PageHeader>

      <Filters>
        <Input
          label="Search by name"
          placeholder="Type to filter…"
          value={nameInput}
          onChange={(event) => setNameInput(event.target.value)}
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as '' | ResourceStatus)
            setPage(1)
          }}
        />
        <Select
          label="Sort"
          options={SORT_OPTIONS}
          value={sortOrder}
          onChange={(event) => {
            setSortOrder(event.target.value as 'asc' | 'desc')
            setPage(1)
          }}
        />
      </Filters>

      {isError ? (
        <Notice role="alert">{getErrorMessage(error)}</Notice>
      ) : isLoading ? (
        <Notice>Loading resources…</Notice>
      ) : items.length === 0 ? (
        <Notice>No resources found. Create your first one.</Notice>
      ) : (
        <List $stale={isFetching}>
          {items.map((resource) => {
            const isConfirming = pendingDeleteId === resource.resourceId
            return (
              <Card variant="outline" key={resource._id}>
                <RowInner>
                  <RowMain
                    type="button"
                    onClick={() => navigate(resourcePaths.overview(resource.resourceId))}
                  >
                    <Name>{resource.name}</Name>
                    <Meta>
                      <span>#{resource.resourceId}</span>
                      <StatusBadge status={resource.status} />
                    </Meta>
                  </RowMain>
                  <RowActions>
                    {isConfirming ? (
                      <>
                        <Button
                          size="small"
                          variant="ghost"
                          onClick={() => setPendingDeleteId(null)}
                          disabled={remove.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          onClick={() =>
                            remove.mutate(resource.resourceId, {
                              onSuccess: () => setPendingDeleteId(null),
                            })
                          }
                          disabled={remove.isPending}
                        >
                          {remove.isPending ? 'Deleting…' : 'Confirm delete'}
                        </Button>
                      </>
                    ) : (
                      <IconButton
                        aria-label={`Delete ${resource.name}`}
                        variant="ghost"
                        onClick={() => setPendingDeleteId(resource.resourceId)}
                      >
                        🗑
                      </IconButton>
                    )}
                  </RowActions>
                </RowInner>
              </Card>
            )
          })}
        </List>
      )}

      {remove.isError ? (
        <Notice role="alert">{getErrorMessage(remove.error)}</Notice>
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <Pager>
          <Button
            variant="secondary"
            size="small"
            disabled={pagination.page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            ← Prev
          </Button>
          <PagerLabel>
            Page {pagination.page} of {pagination.totalPages}
          </PagerLabel>
          <Button
            variant="secondary"
            size="small"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next →
          </Button>
        </Pager>
      ) : null}

      <Drawer title="Create resource" isOpen={isCreateOpen} onClose={closeCreate}>
        <CreateResourceForm
          submitting={create.isPending}
          errorMessage={create.isError ? getErrorMessage(create.error) : undefined}
          onSubmit={handleCreate}
        />
      </Drawer>
    </div>
  )
}

const PageHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const Subtitle = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Filters = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

// Surface comes from Card; only the centered muted text is custom.
function Notice({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Card variant="outline" {...props}>
      <NoticeText>{children}</NoticeText>
    </Card>
  )
}

const NoticeText = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const List = styled.div<{ $stale: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  opacity: ${({ $stale }) => ($stale ? 0.6 : 1)};
  transition: opacity 120ms ease;
`

// Layout only — the surface comes from Card.
const RowInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`

const RowMain = styled.button`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: flex-start;
  flex: 1;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  font: inherit;
`

const Name = styled.span`
  font-weight: 600;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const Meta = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.85rem;
`

const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`

const PagerLabel = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.9rem;
`
