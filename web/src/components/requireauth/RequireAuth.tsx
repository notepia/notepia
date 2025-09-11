import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../../stores/workspace';
import { LoaderCircle } from 'lucide-react';
import { useCurrentUserStore } from '../../stores/current-user';

const RequireAuth = () => {
  const { workspaces, fetchWorkspaces } = useWorkspaceStore()
  const [hasWorkspaces, setHasWorkspaces] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true)
  const { fetchUser } = useCurrentUserStore();
  const location = useLocation();
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      const currentUser = await fetchUser();
      if (!currentUser) {
        navigate("/signin");
      }

      await fetchWorkspaces()

      setIsChecking(false)
    })();
  }, [])

  useEffect(() => {
    setHasWorkspaces(workspaces.length > 0);
  }, [workspaces]);

  if (isChecking) {
    return <div className='w-screen h-dvh flex justify-center items-center'>
      <LoaderCircle className='animate-spin' />
    </div>;
  }

  if (!hasWorkspaces) {
    return <Navigate to="/workspace-setup" state={{ from: location }} replace />;
  }

  return <Outlet />;
}


export default RequireAuth;