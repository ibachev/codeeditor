import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import Participant from "../types/participant.interface";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  incomingUsers: string[];
  code: string;
  updateCode: (newCode: string) => void;
  toggleLockStatus: () => void;
  typingUser: string | null;
  participantsWithCreator: Participant[];
  setParticipantsWithCreator: React.Dispatch<
    React.SetStateAction<Participant[]>
  >;
  setLockedStatus: React.Dispatch<React.SetStateAction<boolean>>;
  lockedStatus: boolean;
  isUserMuted: boolean;
  selectedLanguage: string;
  updateLanguage: (language: string) => void;
  result: string;
  updateResult: (newResult: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
  incomingUsers: [],
  code: "",
  updateCode: () => {},
  toggleLockStatus: () => {},
  typingUser: null,
  participantsWithCreator: [],
  setParticipantsWithCreator: () => {},
  setLockedStatus: () => {},
  lockedStatus: false,
  isUserMuted: false,
  selectedLanguage: "javascript",
  updateLanguage: () => {},
  result: "",
  updateResult: () => {},
});

export const useSocket = () => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: React.ReactNode;
  sessionId?: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  sessionId,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [incomingUsers, setIncomingUsers] = useState<string[]>([]);
  const [code, setCode] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("javascript");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [participantsWithCreator, setParticipantsWithCreator] = useState<
    Participant[]
  >([]);
  const [isUserMuted, setIsUserMuted] = useState<boolean>(false);
  const [lockedStatus, setLockedStatus] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      query: {
        token,
        sessionId,
      },
    });

    newSocket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("user-online", (data) => {
      setOnlineUsers((prev) => [...prev, data.username]);
      setIncomingUsers((prev) => [...prev, data.username]);
    });

    newSocket.on("user-offline", (data) => {
      setOnlineUsers((prev) =>
        prev.filter((username) => username !== data.username)
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [sessionId, token]);

  useEffect(() => {
    socket?.on("kick-status-changed", ({ username, kicked }) => {
      setParticipantsWithCreator((prev) =>
        prev.map((participant) =>
          participant.user.username === username
            ? { ...participant, kicked }
            : participant
        )
      );

      const currentUsername = localStorage.getItem("username");
      if (currentUsername === username) {
        navigate("/kicked");
      }
    });

    socket?.on("user-kicked", () => {
      navigate("/kicked");
    });

    return () => {
      socket?.off("kick-status-changed");
      socket?.off("user-kicked");
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("code-update", (newCode: string) => {
        setCode(newCode);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("update-user-typing", (username: string) => {
        setTypingUser(username);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      });
    }
  }, [socket]);

  useEffect(() => {
    const updateMuteStatus = () => {
      const participant = participantsWithCreator.find(
        (participant) => participant.user.username === username
      );
      setIsUserMuted(participant ? participant.muted : false);
    };
    updateMuteStatus();
  }, [participantsWithCreator, username]);

  useEffect(() => {
    if (socket) {
      socket.on("language-update", (newLanguage: string) => {
        setSelectedLanguage(newLanguage);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("lock-status-updated", (lockStatus: boolean) => {
        setLockedStatus(lockStatus);
      });
    }
  }, [socket]);

  const toggleLockStatus = () => {
    socket?.emit("toggle-lock-status");
  };

  const updateCode = (newCode: string) => {
    setCode(newCode);
    socket?.emit("code-update", newCode);
    socket?.emit("user-typing", username);
  };

  const updateLanguage = (language: string) => {
    socket?.emit("language-update", language);
  };

  const updateResult = (newResult: string) => {
    socket?.emit("result-update", newResult);
  };

  useEffect(() => {
    if (socket) {
      socket.on("result-update", (newResult: string) => {
        setResult(newResult);
      });
    }

    return () => {
      socket?.off("result-update");
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        incomingUsers,
        code,
        updateCode,
        typingUser,
        participantsWithCreator,
        setParticipantsWithCreator,
        setLockedStatus,
        isUserMuted,
        lockedStatus,
        selectedLanguage,
        updateLanguage,
        result,
        updateResult,
        toggleLockStatus,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
