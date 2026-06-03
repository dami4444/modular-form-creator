import { Badge } from '../design-system'
import type { ResourceStatus } from '../domain/resource.types'

const LABEL: Record<ResourceStatus, string> = {
  draft: 'Draft',
  completed: 'Completed',
}

/** Resource status rendered as a design-system Badge (draft = info, completed = success). */
export function StatusBadge({ status }: { status: ResourceStatus }) {
  return (
    <Badge variant={status === 'completed' ? 'success' : 'info'}>{LABEL[status]}</Badge>
  )
}
