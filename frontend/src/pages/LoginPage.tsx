import React from "react";
import Login from "../components/Auth/Login";
import PublicLayout from "../components/layouts/PublicLayout";

const LoginPage: React.FC = () => {
  return (
    <PublicLayout>
      <Login />
    </PublicLayout>
  );
};

export default LoginPage;
