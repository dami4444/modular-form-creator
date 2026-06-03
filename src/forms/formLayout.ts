import styled from 'styled-components'

/** Shared layout primitives for the module and create forms. */

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

export const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`

export const ServerError = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.9rem;
`
