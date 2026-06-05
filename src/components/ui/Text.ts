import type { CSSProperties } from 'react'
import styled, { css } from 'styled-components'

type Tone = 'default' | 'muted' | 'strong' | 'error'
type Size = 'sm' | 'md'

const toneColor = {
  default: 'ink',
  muted: 'inkMuted',
  strong: 'inkStrong',
  error: 'warning',
} as const

const styleProps = new Set(['tone', 'size', 'weight', 'align'])

/**
 * Body text with tone, size, weight and alignment.
 * Renders a `<p>`; pass `as="span"` for inline usage.
 */
export const Text = styled.p.withConfig({
  shouldForwardProp: (prop) => !styleProps.has(prop),
})<{
  tone?: Tone
  size?: Size
  weight?: 'regular' | 'semibold'
  align?: CSSProperties['textAlign']
}>`
  margin: 0;
  color: ${({ theme, tone = 'default' }) => theme.colors[toneColor[tone]]};
  font-size: ${({ size = 'md' }) => (size === 'sm' ? '0.85rem' : '1rem')};
  ${({ weight }) =>
    weight === 'semibold' &&
    css`
      font-weight: 600;
    `}
  ${({ align }) =>
    align &&
    css`
      text-align: ${align};
    `}
`
