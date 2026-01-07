import { Navigate } from "react-router-dom";
import { userAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, ready } = userAuth();
  if (!ready) return null; // or a spinner
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
