import { useEffect, useState } from "react";
import { AppRoutes } from "./routes/AppRoutes";
import FullScreenLoader from "../src/components/FullScreenLoader"

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => setLoading(false);

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => window.removeEventListener("load", handleLoad);
  }, []);

  if (loading) return <FullScreenLoader />;

  return <AppRoutes />;
}

export default App;
