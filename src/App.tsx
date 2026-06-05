import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { resourcePaths } from './routes'
import { ResourcesListPage } from './pages/ResourcesListPage'
import { ResourceLayout } from './pages/ResourceLayout'
import { ResourceOverviewPage } from './pages/ResourceOverviewPage'
import { ResourceDetailsPage } from './pages/ResourceDetailsPage'
import { BasicInfoPage } from './pages/BasicInfoPage'
import { ProjectDetailsPage } from './pages/ProjectDetailsPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to={resourcePaths.list} replace />} />
        <Route path="/resources" element={<ResourcesListPage />} />
        <Route path="/resources/:resourceId" element={<ResourceLayout />}>
          <Route index element={<ResourceOverviewPage />} />
          <Route path="basic-info" element={<BasicInfoPage />} />
          <Route path="project-details" element={<ProjectDetailsPage />} />
          <Route path="details" element={<ResourceDetailsPage />} />
        </Route>
        <Route path="*" element={<Navigate to={resourcePaths.list} replace />} />
      </Route>
    </Routes>
  )
}

export default App
