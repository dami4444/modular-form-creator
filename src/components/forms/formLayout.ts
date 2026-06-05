import styled from 'styled-components'

/** Vertical form layout shared by the module and create forms. */
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`
