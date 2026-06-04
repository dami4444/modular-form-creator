import styled from 'styled-components'

/**
 * Accent callout surface for inline notices/alerts.
 * (The design system has no Alert component, and `Card` has no accent variant.)
 */
export const Callout = styled.div`
  margin: 0;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.accentSoft};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.inkStrong};
  font-size: 0.9rem;
`
