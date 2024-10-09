import React from "react";
import { useParams } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import PrivateLayout from "../components/layouts/PrivateLayout";
import Session from "../components/Session/Session";
import { SocketProvider } from "../context/SocketContext";

const SessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <SocketProvider sessionId={id}>
      <PrivateLayout>
        <ProtectedRoute component={Session} sessionId={id} />
      </PrivateLayout>
    </SocketProvider>
  );
};

export default SessionPage;
