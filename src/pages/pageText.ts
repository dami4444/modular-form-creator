import styled from 'styled-components'

/** Shared page typography. */

export const Heading = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
  color: ${({ theme }) => theme.colors.inkStrong};
`

export const Lead = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`
