import { Badge, Card } from '../design-system'
import type { Resource } from '../domain/resource.types'
import { isBasicInfoComplete, isProjectDetailsComplete } from '../domain/resource.rules'
import { Inline, Stack, Text } from './ui'

type ModuleState =
  | { kind: 'complete' }
  | { kind: 'incomplete' }
  | { kind: 'locked'; reason: string }

const renderBadge = (state: ModuleState) => {
  if (state.kind === 'complete') return <Badge variant="success">Complete</Badge>
  if (state.kind === 'locked') return <Badge variant="neutral">Locked</Badge>
  return <Badge variant="warning">Incomplete</Badge>
}

/** Shows the completion state of both modules, mirroring the backend gating rules. */
export function ModuleProgressList({ resource }: { resource: Resource }) {
  const basicState: ModuleState = isBasicInfoComplete(resource.basicInfo)
    ? { kind: 'complete' }
    : { kind: 'incomplete' }

  let projectState: ModuleState
  if (resource.status === 'draft' && !isBasicInfoComplete(resource.basicInfo)) {
    projectState = {
      kind: 'locked',
      reason: 'Unlocks after Basic Info is complete',
    }
  } else if (isProjectDetailsComplete(resource.projectDetails)) {
    projectState = { kind: 'complete' }
  } else {
    projectState = { kind: 'incomplete' }
  }

  return (
    <Stack gap="sm">
      <Card variant="elevated">
        <Inline justify="space-between" gap="md">
          <div>
            <Text tone="strong" weight="semibold">
              Basic Info
            </Text>
            <Text tone="muted" size="sm">
              Resource name, owner, contact, priority
            </Text>
          </div>
          {renderBadge(basicState)}
        </Inline>
      </Card>
      <Card variant="elevated">
        <Inline justify="space-between" gap="md">
          <div>
            <Text tone="strong" weight="semibold">
              Project Details
            </Text>
            <Text tone="muted" size="sm">
              {projectState.kind === 'locked'
                ? projectState.reason
                : 'Project name, budget, category, team'}
            </Text>
          </div>
          {renderBadge(projectState)}
        </Inline>
      </Card>
    </Stack>
  )
}
