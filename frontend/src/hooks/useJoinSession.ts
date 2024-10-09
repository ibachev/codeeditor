import { useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";

interface Session {
  id: string;
  name: string;
  creator: string;
  participants: string[];
}

const useJoinSession = (id?: string) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Session ID is required");
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.post(`/sessions/join/${id}`);
        setSession(response.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  return { session, loading, error };
};

export default useJoinSession;
