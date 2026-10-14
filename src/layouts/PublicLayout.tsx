import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="public-form min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
};

export default PublicLayout;