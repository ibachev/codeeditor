import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "../components/Dashboard/Dashboard";
import PrivateLayout from "../components/layouts/PrivateLayout";

const DashboardPage: React.FC = () => {
  return (
    <PrivateLayout>
      <ProtectedRoute component={Dashboard} />;
    </PrivateLayout>
  );
};

export default DashboardPage;
