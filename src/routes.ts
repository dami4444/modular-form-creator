/** Centralized route paths for navigation and links (keep in sync with the routes in App.tsx). */
export const resourcePaths = {
  list: '/resources',
  overview: (id: string | number) => `/resources/${id}`,
  basicInfo: (id: string | number) => `/resources/${id}/basic-info`,
  projectDetails: (id: string | number) => `/resources/${id}/project-details`,
  details: (id: string | number) => `/resources/${id}/details`,
} as const
