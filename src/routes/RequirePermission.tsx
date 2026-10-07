
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { PermissionKey } from "../constants/permissions";

interface Props {
  perm: PermissionKey;
}

const RequirePermission = ({ perm }: Props) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(perm)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <Outlet />;
};

export default RequirePermission;