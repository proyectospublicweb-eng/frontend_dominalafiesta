import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import InvitacionPublicaPage from "./pages/InvitacionPublicaPage";

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

          {/* Rutas públicas de Invitación Virtual y Confirmación RSVP */}
          <Route path="/rsvp/:id" element={<InvitacionPublicaPage />} />
          <Route path="/invitacion/:id" element={<InvitacionPublicaPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/events/:id" element={<HomePage />} />
            <Route path="/events/:id/:tab" element={<HomePage />} />
          </Route>

          {/* Ruta personalizada: /:nombreEvento/e:id (ej. /cumpledeluis/e7) */}
          <Route path="/:eventoSlug/:id" element={<InvitacionPublicaPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
