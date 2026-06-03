import { useOutletContext } from 'react-router-dom'
import type { Resource } from '../../domain/resource.types'

export interface ResourceOutletContext {
  resource: Resource
}

/** Access the resource loaded once by ResourceLayout from any child route. */
export const useResourceOutletContext = () => useOutletContext<ResourceOutletContext>()
