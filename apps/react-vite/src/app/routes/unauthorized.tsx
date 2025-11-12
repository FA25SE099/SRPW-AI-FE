import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { useUser } from '@/lib/auth';
import { ROLES } from '@/lib/authorization';

const UnauthorizedRoute = () => {
  const navigate = useNavigate();
  const user = useUser();

  const handleGoToDashboard = () => {
    // Redirect to their appropriate dashboard
    switch (user.data?.role) {
      case ROLES.Admin:
        navigate(paths.app.admin.dashboard.getHref());
        break;
      case ROLES.AgronomyExpert:
        navigate(paths.app.expert.dashboard.getHref());
        break;
      case ROLES.Supervisor:
        navigate(paths.app.supervisor.dashboard.getHref());
        break;
      case ROLES.ClusterManager:
        navigate(paths.app.cluster.dashboard.getHref());
        break;
      default:
        navigate(paths.app.dashboard.getHref());
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4 text-center">
        <ShieldAlert className="h-24 w-24 text-destructive" />
        <h1 className="text-4xl font-bold">403 - Unauthorized</h1>
        <p className="text-xl text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <p className="text-sm text-muted-foreground">
          Your role: <span className="font-semibold">{user.data?.role}</span>
        </p>
        <div className="flex gap-4 pt-4">
          <Button onClick={handleGoToDashboard}>
            Go to My Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedRoute;

