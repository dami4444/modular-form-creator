import { Link, Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { resourcePaths } from '../routes'

/** Global app shell: header with the product title + a centered content container. */
export function AppLayout() {
  return (
    <Shell>
      <Header>
        <HomeLink to={resourcePaths.list}>Resource Manager</HomeLink>
        <Tagline>Modular Form Creator</Tagline>
      </Header>
      <Main>
        <Outlet />
      </Main>
    </Shell>
  )
}

const Shell = styled.div`
  min-height: 100svh;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.ink};
`

const Header = styled.header`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const HomeLink = styled(Link)`
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.35rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkStrong};
  text-decoration: none;
`

const Tagline = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.9rem;
`

const Main = styled.main`
  max-width: 960px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
`
