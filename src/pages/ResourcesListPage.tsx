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
import { Heading, Inline, Stack, Text } from '../ui'

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
    <Stack $gap="lg">
      <Inline $justify="space-between" $align="flex-end" $gap="md">
        <Stack $gap="xs">
          <Heading as="h1" $size="page">
            Resources
          </Heading>
          <Text $tone="muted">Create, track, and complete resources.</Text>
        </Stack>
        <Button onClick={() => setCreateOpen(true)}>+ New resource</Button>
      </Inline>

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
        <List $gap="sm" $stale={isFetching}>
          {items.map((resource) => {
            const isConfirming = pendingDeleteId === resource.resourceId
            return (
              <Card variant="outline" key={resource._id}>
                <Inline $justify="space-between" $gap="md">
                  <RowMain
                    type="button"
                    onClick={() => navigate(resourcePaths.overview(resource.resourceId))}
                  >
                    <Text $tone="strong" $weight="semibold">
                      {resource.name}
                    </Text>
                    <Inline $gap="sm">
                      <Text as="span" $tone="muted" $size="sm">
                        #{resource.resourceId}
                      </Text>
                      <StatusBadge status={resource.status} />
                    </Inline>
                  </RowMain>
                  <Inline $gap="sm">
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
                  </Inline>
                </Inline>
              </Card>
            )
          })}
        </List>
      )}

      {remove.isError ? (
        <Notice role="alert">{getErrorMessage(remove.error)}</Notice>
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <Inline $justify="center" $gap="md">
          <Button
            variant="secondary"
            size="small"
            disabled={pagination.page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            ← Prev
          </Button>
          <Text as="span" $tone="muted" $size="sm">
            Page {pagination.page} of {pagination.totalPages}
          </Text>
          <Button
            variant="secondary"
            size="small"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next →
          </Button>
        </Inline>
      ) : null}

      <Drawer title="Create resource" isOpen={isCreateOpen} onClose={closeCreate}>
        <CreateResourceForm
          submitting={create.isPending}
          errorMessage={create.isError ? getErrorMessage(create.error) : undefined}
          onSubmit={handleCreate}
        />
      </Drawer>
    </Stack>
  )
}

// Surface comes from Card; only the centered muted text is custom.
function Notice({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Card variant="outline" {...props}>
      <Text $tone="muted" $align="center">
        {children}
      </Text>
    </Card>
  )
}

// Responsive filter grid — no design-system layout primitive for this.
const Filters = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

// Extends the Stack primitive with a dimmed state during background refetch.
const List = styled(Stack)<{ $stale: boolean }>`
  opacity: ${({ $stale }) => ($stale ? 0.6 : 1)};
  transition: opacity 120ms ease;
`

// A real <button> styled as a clickable row (keyboard/focus accessible).
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
