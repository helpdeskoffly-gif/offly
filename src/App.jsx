import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { Layout } from "./components/Layout";
import { HomeOptimized } from "./HomeOptimized";
import { Auth } from "./components/Auth";
import Dashboard from "./components/Dashboard";
import AuthTest from "./components/AuthTest";
import { Loading } from "./components/Loading";
import SupabaseErrorBoundary from "./components/SupabaseErrorBoundary";
import TermsAndConditions from "./components/TermsAndConditions";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <SupabaseErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Routes with Navbar (using Layout) */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomeOptimized />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            {/* Routes without Navbar (rendered directly) */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth-test" element={<AuthTest />} />
            <Route path="/terms" element={<TermsAndConditions />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </SupabaseErrorBoundary>
  );
}

export default App;
