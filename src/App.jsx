import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";

import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={<LandingPage initialModal="login" />}
          />
          <Route
            path="/register"
            element={<LandingPage initialModal="register" />}
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
