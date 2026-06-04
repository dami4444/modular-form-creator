import type { CSSProperties } from 'react'
import styled from 'styled-components'
import type { Theme } from '../design-system/theme/theme'

type Gap = keyof Theme['spacing']

/** Horizontal flex layout with a themed gap, optional wrap and alignment. */
export const Inline = styled.div<{
  $gap?: Gap
  $wrap?: boolean
  $align?: CSSProperties['alignItems']
  $justify?: CSSProperties['justifyContent']
}>`
  display: flex;
  flex-direction: row;
  flex-wrap: ${({ $wrap }) => ($wrap ? 'wrap' : 'nowrap')};
  align-items: ${({ $align = 'center' }) => $align};
  justify-content: ${({ $justify = 'flex-start' }) => $justify};
  gap: ${({ theme, $gap = 'sm' }) => theme.spacing[$gap]};
`
