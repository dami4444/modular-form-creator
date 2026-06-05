import styled from 'styled-components'
import type { Theme } from '../../design-system/theme/theme'

type Gap = keyof Theme['spacing']

/** Vertical flex layout with a themed gap (default `md`). */
export const Stack = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'gap',
})<{ gap?: Gap }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme, gap = 'md' }) => theme.spacing[gap]};
`
