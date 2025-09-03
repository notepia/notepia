import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../../stores/workspace';
import { LoaderCircle } from 'lucide-react';

const RequireAuth = () => {
  const { workspaces, fetchWorkspaces } = useWorkspaceStore()
  const [isChecking, setIsChecking] = useState(true);
  const [hasWorkspaces, setHasWorkspaces] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate()

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await axios.get('/api/v1/me', { withCredentials: true });
        const isAuthenticated = response.data.id != "" && !response.data.Disabled;

        if (!isAuthenticated) {
          navigate("/signin")
          return;
        }

        await fetchWorkspaces();

        setIsChecking(false)
      }
      catch {
        navigate("/signin")
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    setHasWorkspaces(workspaces.length > 0);
  }, [workspaces]);

  if (isChecking) {
    return <div className='w-screen h-dvh flex justify-center items-center'>
       <LoaderCircle className='animate-spin'/>
    </div>;
  }

  if (!hasWorkspaces) {
    return <Navigate to="/workspace-setup" state={{ from: location }} replace />;
  }

  return <Outlet />;
}


export default RequireAuth;