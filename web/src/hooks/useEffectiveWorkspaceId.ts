import { useParams } from "react-router-dom";

/**
 * Custom hook to get the effective workspaceId from params or store.
 * Returns the workspaceId from params if present, otherwise from store.
 */
export function useEffectiveWorkspaceId() {
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  
  const effectiveId = workspaceId;
  if (!effectiveId) {
    throw new Error("No workspaceId found");
  }
  return effectiveId;
}
