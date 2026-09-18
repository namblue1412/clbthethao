import { useRoute } from "./utils/useRoute";
import CLBTheThaoDuoc2026 from "./App";
import AdminPage from "./pages/AdminPage";

export default function AppRouter() {
  const { route, navigateTo } = useRoute();

  if (route === "/admin") {
    return <AdminPage onBackToHome={() => navigateTo("/")} />;
  }

  return <CLBTheThaoDuoc2026 />;
}
