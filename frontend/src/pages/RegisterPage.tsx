import React from "react";
import Register from "../components/Auth/Register";
import PublicLayout from "../components/layouts/PublicLayout";

const RegisterPage: React.FC = () => {
  return (
    <PublicLayout>
      <Register />
    </PublicLayout>
  );
};

export default RegisterPage;
