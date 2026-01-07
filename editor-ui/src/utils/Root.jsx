import React from "react";
import { userAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Root = () => {
  const { user } = userAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Check if the user is authenticated and redirected successfully
      if (user.role === "Editor") {
        navigate("/editor/dashboard");
      } else if (user.role === "Viewer") {
        navigate("/viewer/dashboard");
      } else {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [user, navigate]);
  return null;
};

export default Root;
