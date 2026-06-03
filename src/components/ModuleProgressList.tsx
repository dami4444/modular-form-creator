import styled from 'styled-components'
import { Badge, Card } from '../design-system'
import type { Resource } from '../domain/resource.types'
import { isBasicInfoComplete, isProjectDetailsComplete } from '../domain/resource.rules'

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
    <List>
      <Card variant="elevated">
        <Item>
          <div>
            <Name>Basic Info</Name>
            <Hint>Resource name, owner, contact, priority</Hint>
          </div>
          {renderBadge(basicState)}
        </Item>
      </Card>
      <Card variant="elevated">
        <Item>
          <div>
            <Name>Project Details</Name>
            <Hint>
              {projectState.kind === 'locked'
                ? projectState.reason
                : 'Project name, budget, category, team'}
            </Hint>
          </div>
          {renderBadge(projectState)}
        </Item>
      </Card>
    </List>
  )
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

// Layout only — the surface (border/background/radius/padding) comes from Card.
const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`

const Name = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const Hint = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.inkMuted};
`
