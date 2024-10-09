import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import {
  Drawer,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Divider,
  Typography,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Participant from "../../types/participant.interface";

interface SessionManagerProps {
  open: boolean;
  onClose: () => void;
}

interface Session {
  id: number;
  sessionId: string;
  name: string;
  isLocked: boolean;
  participants: Participant[];
}

export interface SocketData {
  message: string;
  username: string;
  sessionId: string;
}

const SessionManager: React.FC<SessionManagerProps> = ({ open, onClose }) => {
  const [createdSessions, setCreatedSessions] = useState<Session[]>([]);
  const [joinedSessions, setJoinedSessions] = useState<Session[]>([]);
  const [sessionName, setSessionName] = useState<string>(""); // New state for session name

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axiosInstance.get<{
          created: Session[];
          joined: Session[];
        }>("/sessions/user");
        setCreatedSessions(response.data.created);
        setJoinedSessions(response.data.joined);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, [open]);

  const createSession = async () => {
    try {
      const response = await axiosInstance.post<Session>("/sessions", {
        name: sessionName,
      });
      setCreatedSessions((prevSessions) => [...prevSessions, response.data]);
      setSessionName("");
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const navigateToSession = (sessionId: string) => {
    navigate(`/session/${sessionId}`);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 300,
          padding: 3,
          backgroundColor: "#f5f5f5",
          height: "100%",
        }}
      >
        {/* Main Header Styling */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            marginBottom: 3,
            paddingBottom: 2,
            borderBottom: "2px solid #ddd",
            textAlign: "center",
            color: "#333",
          }}
        >
          Session Management
        </Typography>

        {/* Input for Session Name */}
        <TextField
          label="Session Name"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Button
          variant="contained"
          onClick={createSession}
          style={{ marginBottom: 10 }}
          disabled={!sessionName}
        >
          Create Session
        </Button>

        {/* Section Titles */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            marginTop: 2,
            paddingBottom: 1,
            borderBottom: "1px solid #ccc",
          }}
        >
          Your Sessions
        </Typography>

        <Divider sx={{ marginBottom: 1 }} />

        <List>
          {createdSessions.length > 0 ? (
            createdSessions.map((session) => (
              <div key={session.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => navigateToSession(session.sessionId)}
                  >
                    <ListItemText primary={`Session Name: ${session.name}`} />
                  </ListItemButton>
                </ListItem>
              </div>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="You have not created any sessions." />
            </ListItem>
          )}
        </List>

        {/* Section Titles */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            marginTop: 2,
            paddingBottom: 1,
            borderBottom: "1px solid #ccc",
          }}
        >
          Joined Sessions
        </Typography>

        <Divider sx={{ marginBottom: 1 }} />

        <List>
          {joinedSessions.length > 0 ? (
            joinedSessions.map((session) => (
              <div key={session.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => navigateToSession(session.sessionId)}
                  >
                    <ListItemText primary={`Session Name: ${session.name}`} />
                  </ListItemButton>
                </ListItem>
              </div>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="You have not joined any sessions." />
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default SessionManager;
