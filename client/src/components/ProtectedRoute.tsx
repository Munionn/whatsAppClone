import React from "react";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import { authStore } from "../store/authStore";

const ProtectedRoute = observer(({ children }: { children: React.ReactNode }) => {
  if (!authStore.isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
});

export default ProtectedRoute;