import styled from 'styled-components'

const headingSize = {
  section: '1.25rem',
  resource: '1.9rem',
  page: '2rem',
} as const

/**
 * Heading in the display font. Renders an `<h2>`;
 * pass `as="h1"` for page/resource titles.
 */
export const Heading = styled.h2<{ $size?: keyof typeof headingSize }>`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
  color: ${({ theme }) => theme.colors.inkStrong};
  font-size: ${({ $size = 'section' }) => headingSize[$size]};
`
