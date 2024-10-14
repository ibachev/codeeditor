import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Badge,
  Typography,
  Box,
  Drawer,
  Tooltip,
} from "@mui/material";
import {
  Person,
  DoNotDisturb,
  Cancel,
  CheckCircle,
  VolumeOff as MuteIcon,
  VolumeUp as UnmuteIcon,
} from "@mui/icons-material";
import { useSocket } from "../../context/SocketContext";
import axiosInstance from "../../services/axiosInstance";
import Participant from "../../types/participant.interface";
import User from "../../types/user.inteface";

interface ParticipantsProps {
  participants: Participant[];
  creator: User;
  drawerOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

const Participants: React.FC<ParticipantsProps> = ({
  creator,
  drawerOpen,
  onClose,
  sessionId,
}) => {
  const {
    onlineUsers,
    socket,
    participantsWithCreator,
    setParticipantsWithCreator,
  } = useSocket(); // Access online and incoming users from socket context

  const [participants, setParticipants] = useState<Participant[]>([]);
  const currentUser = localStorage.getItem("username");

  useEffect(() => {
    const fetchSessionParticipants = async () => {
      try {
        const response = await axiosInstance.get<Participant[]>(
          `/sessions/${sessionId}/participants`
        );
        setParticipants(response.data);
      } catch (err) {
        console.log(
          "Error while fetching participants for the session. Error: ",
          err
        );
      }
    };

    fetchSessionParticipants();
  }, [sessionId, onlineUsers]);

  useEffect(() => {
    // Prepare participants with creator added first
    const initialParticipants = [
      {
        id: creator.id,
        online: onlineUsers.includes(creator.username),
        kicked: false,
        muted: false,
        user: creator,
      },
      ...participants.map((participant) => ({
        ...participant,
        online: onlineUsers.includes(participant.user.username),
      })),
    ];

    setParticipantsWithCreator(initialParticipants);
  }, [creator, participants, onlineUsers]);

  useEffect(() => {
    // Update online status whenever onlineUsers changes
    setParticipantsWithCreator((prevParticipants) => {
      return prevParticipants.map((participant) => ({
        ...participant,
        online: onlineUsers.includes(participant.user.username),
      }));
    });
  }, [onlineUsers]);

  const handleToggleKickUser = (username: string) => {
    socket?.emit("toggleKickStatus", username);
  };

  const handleToggleMute = (username: string) => {
    setParticipantsWithCreator((prev) =>
      prev.map((participant) =>
        participant.user.username === username
          ? { ...participant, muted: !participant.muted }
          : participant
      )
    );

    socket?.emit("toggleMute", username);
  };

  useEffect(() => {
    // Listen for mute status changes from other clients
    socket?.on("mute-status-changed", ({ username, muted }) => {
      setParticipantsWithCreator((prev) =>
        prev.map((participant) =>
          participant.user.username === username
            ? { ...participant, muted }
            : participant
        )
      );
    });

    return () => {
      socket?.off("mute-status-changed");
    };
  }, [socket]);

  return (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={onClose}
      PaperProps={{
        sx: { background: "linear-gradient(to right, #3a7bd5, #00d2ff)" },
      }}
    >
      <Box
        sx={{
          width: 280,
          p: 2,
          height: "100%",
          color: "white",
          borderTopRightRadius: "20px",
          borderBottomRightRadius: "20px",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Participants
        </Typography>
        <List>
          {participantsWithCreator.map((participant) => (
            <ListItem key={participant.user.username}>
              <ListItemAvatar>
                <Badge
                  color="success"
                  variant="dot"
                  invisible={!participant.online}
                  sx={{
                    "& .MuiBadge-dot": {
                      width: "15px",
                      height: "15px",
                      borderRadius: "50%",
                      backgroundColor: "limegreen",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: participant.muted
                        ? "grey.500"
                        : "secondary.main",
                      color: "white",
                    }}
                  >
                    <Person />
                  </Avatar>
                </Badge>
              </ListItemAvatar>

              <ListItemText
                primary={participant.user.username}
                sx={{ color: participant.kicked ? "error.main" : "white" }}
              />

              {/* Show buttons only if the current user is the creator */}
              {currentUser === creator.username &&
                creator.username !== participant.user.username && (
                  <>
                    {/* Kick/Unkick Button */}
                    <Tooltip
                      title={participant.kicked ? "Unkick User" : "Kick User"}
                    >
                      <IconButton
                        edge="end"
                        aria-label={participant.kicked ? "unkick" : "kick"}
                        onClick={() =>
                          handleToggleKickUser(participant.user.username)
                        }
                        sx={{
                          color: participant.kicked ? "error.main" : "white",
                        }}
                      >
                        {participant.kicked ? <CheckCircle /> : <Cancel />}
                      </IconButton>
                    </Tooltip>

                    {/* Mute/Unmute Button */}
                    <Tooltip
                      title={participant.muted ? "Unmute User" : "Mute User"}
                    >
                      <IconButton
                        edge="end"
                        aria-label={participant.muted ? "unmute" : "mute"}
                        onClick={() =>
                          handleToggleMute(participant.user.username)
                        }
                        sx={{
                          color: participant.muted ? "error.main" : "white",
                        }}
                      >
                        {participant.muted ? <MuteIcon /> : <UnmuteIcon />}
                      </IconButton>
                    </Tooltip>
                  </>
                )}
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Participants;
