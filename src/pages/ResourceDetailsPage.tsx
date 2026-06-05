import { Fragment } from 'react'
import styled, { css } from 'styled-components'
import { Card } from '../design-system'
import {
  isBasicInfoComplete,
  isProjectDetailsComplete,
  sameStringSet,
} from '../domain/resource.rules'
import { useResourceOutletContext } from '../context/resourceOutlet'
import { useEditBuffer } from '../context/EditBufferContext'
import { Callout, Heading, Stack } from '../components/ui'

const show = (value: string) => (value.trim() ? value : '—')
const showList = (values: string[]) => (values.length ? values.join(', ') : '—')

interface FieldRow {
  label: string
  saved: string
  staged: string
  changed: boolean
}

const textRow = (label: string, saved: string, staged: string): FieldRow => ({
  label,
  saved,
  staged,
  changed: saved !== staged,
})

const listRow = (label: string, saved: string[], staged: string[]): FieldRow => ({
  label,
  saved: showList(saved),
  staged: showList(staged),
  changed: !sameStringSet(saved, staged),
})

/**
 * One module's fields. When `comparing` (the module has staged edits) it shows
 * Saved vs Unsaved side by side and highlights what changed; otherwise a single value.
 */
function ModuleDetails({
  title,
  complete,
  fields,
  comparing,
}: {
  title: string
  complete: boolean
  fields: FieldRow[]
  comparing: boolean
}) {
  return (
    <Card>
      <Heading>
        {title} <Note>{complete ? '· Complete' : '· Incomplete'}</Note>
      </Heading>
      {comparing ? (
        <Comparison>
          <span />
          <ColHead>Saved</ColHead>
          <ColHead>Unsaved</ColHead>
          {fields.map((field) => (
            <Fragment key={field.label}>
              <RowLabel>{field.label}</RowLabel>
              <Cell>{show(field.saved)}</Cell>
              <StagedCell changed={field.changed}>
                {show(field.staged)}
                {field.changed ? <Tag>changed</Tag> : null}
              </StagedCell>
            </Fragment>
          ))}
        </Comparison>
      ) : (
        <Definition>
          {fields.map((field) => (
            <Fragment key={field.label}>
              <dt>{field.label}</dt>
              <dd>{show(field.saved)}</dd>
            </Fragment>
          ))}
        </Definition>
      )}
    </Card>
  )
}

/** Read-only summary; shows a saved-vs-unsaved comparison when a module has staged edits. */
export function ResourceDetailsPage() {
  const { resource } = useResourceOutletContext()
  const buffer = useEditBuffer()
  const { basicInfo, projectDetails } = resource

  const basicFields = [
    textRow('Resource name', basicInfo.resourceName, buffer.basicInfo.resourceName),
    textRow('Owner', basicInfo.owner, buffer.basicInfo.owner),
    textRow('Email', basicInfo.email, buffer.basicInfo.email),
    textRow('Description', basicInfo.description, buffer.basicInfo.description),
    textRow('Priority', basicInfo.priority, buffer.basicInfo.priority),
  ]

  const projectFields = [
    textRow(
      'Project name',
      projectDetails.projectName,
      buffer.projectDetails.projectName,
    ),
    textRow('Budget', projectDetails.budget, buffer.projectDetails.budget),
    textRow('Category', projectDetails.category, buffer.projectDetails.category),
    listRow('Team members', projectDetails.options, buffer.projectDetails.options),
  ]

  return (
    <Stack gap="lg">
      <Card>
        <Heading>Summary</Heading>
        {buffer.isDirty ? (
          <Callout role="status">
            Your unsaved changes are compared with the saved values below. Submit from the
            banner above to apply them.
          </Callout>
        ) : null}
        <Definition>
          <dt>Resource ID</dt>
          <dd>{resource.resourceId}</dd>
          <dt>Name</dt>
          <dd>{show(resource.name)}</dd>
        </Definition>
      </Card>

      <ModuleDetails
        title="Basic Info"
        complete={isBasicInfoComplete(basicInfo)}
        fields={basicFields}
        comparing={buffer.isBasicInfoStaged}
      />
      <ModuleDetails
        title="Project Details"
        complete={isProjectDetailsComplete(projectDetails)}
        fields={projectFields}
        comparing={buffer.isProjectDetailsStaged}
      />
    </Stack>
  )
}

const Note = styled.span`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 0.85rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Definition = styled.dl`
  display: grid;
  grid-template-columns: minmax(120px, 200px) 1fr;
  gap: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin: 0;

  dt {
    color: ${({ theme }) => theme.colors.inkMuted};
    font-size: 0.9rem;
  }

  dd {
    margin: 0;
    color: ${({ theme }) => theme.colors.ink};
    overflow-wrap: anywhere;
  }
`

const Comparison = styled.div`
  display: grid;
  grid-template-columns: minmax(110px, 150px) 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  align-items: start;
`

const ColHead = styled.span`
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const RowLabel = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.9rem;
`

const Cell = styled.span`
  color: ${({ theme }) => theme.colors.ink};
  overflow-wrap: anywhere;
`

const StagedCell = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'changed',
})<{ changed: boolean }>`
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors.inkMuted};
  ${({ changed, theme }) =>
    changed &&
    css`
      color: ${theme.colors.inkStrong};
      font-weight: 600;
      background: ${theme.colors.accentSoft};
      border-radius: ${theme.radii.sm};
      padding: 2px 8px;
    `}
`

const Tag = styled.span`
  margin-left: ${({ theme }) => theme.spacing.sm};
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.warning};
`
