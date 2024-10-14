import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import {
  ContentCopy,
  Lock,
  LockOpen,
  VideoCall as VideoCallIcon,
  Menu,
  PlayArrow,
  Save,
  TextsmsRounded,
} from "@mui/icons-material";
import Participants from "./Participants";
import CodeEditor from "../Editor";
import { toast } from "react-toastify";
import { useSocket } from "../../context/SocketContext";
import SessionData from "../../types/session.interface";
import LoadingWithMessage from "./Loader";

interface SessionProps {
  sessionId: string;
}

const Session: React.FC<SessionProps> = ({ sessionId }) => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [videoCallOpen, setVideoCallOpen] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const currentUser = localStorage.getItem("username");
  const isCreator = currentUser === sessionData?.creator.username;
  const toggleVideoCall = () => {
    setVideoCallOpen(!videoCallOpen);
  };
  const {
    code,
    typingUser,
    selectedLanguage,
    updateLanguage,
    updateResult,
    result,
    toggleLockStatus,
    lockedStatus,
    setLockedStatus,
  } = useSocket();

  useEffect(() => {
    if (result) {
      toast.success("Code Executed", {
        position: "bottom-right",
      });
    }
  }, [result]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<SessionData>(
          `/sessions/${sessionId}`
        );
        setSessionData(response.data);
        setLockedStatus(response.data.isLocked);
      } catch (err) {
        setError("Failed to fetch session");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const handleSaveCode = async () => {
    try {
      await axiosInstance.post(`/code/save/${sessionId}`, {
        code: code,
        language: selectedLanguage,
      });
      toast.success("Code Saved", {
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Error saving code:", error);
    }
  };

  const handleRunCode = async () => {
    try {
      const response = await axiosInstance.post(`/code/run/${sessionId}`, {
        code: code,
        language: selectedLanguage,
      });
      updateResult(response.data.result);
    } catch (error) {
      console.error("Error running code:", error);
      updateResult("Error executing code.");
    }
  };

  const copyToClipboard = () => {
    const fullUrl = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        toast.success("Session link copied to clipboard!", {
          position: "bottom-right",
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy session link.", {
          position: "bottom-right",
        });
      });
  };

  if (loading) return <LoadingWithMessage />;

  if (error) return <Typography color="error">{error}</Typography>;

  if (!sessionData) {
    return (
      <Typography color="error">Session data is not available.</Typography>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, height: "90vh", p: 0 }}>
      <Grid container spacing={2} sx={{ height: "100%" }}>
        {/* Top Section (Menu and Session Info) */}
        <Grid
          item
          xs={12}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <Button
            variant="contained"
            startIcon={<Menu />}
            onClick={() => setDrawerOpen(true)}
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              borderRadius: "20px",
              px: 3,
            }}
          >
            Participants
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              backgroundColor: "background.paper",
              p: 2,
              borderRadius: "20px",
              boxShadow: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, paddingRight: "30px" }}
            >
              Session Name: <strong>{sessionData.name}</strong>
            </Typography>

            <Tooltip title="Copy Session Link" arrow>
              <IconButton
                onClick={() => copyToClipboard()}
                sx={{ marginLeft: "auto" }}
              >
                <ContentCopy sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Tooltip
            title={
              isCreator
                ? lockedStatus
                  ? "Unlock Session"
                  : "Lock Session"
                : ""
            }
            arrow
          >
            <Box
              sx={{
                p: 2,
                borderRadius: "20px",
                boxShadow: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: isCreator ? "pointer" : "default",
                width: "105px",
              }}
              onClick={() => isCreator && toggleLockStatus()}
            >
              <Typography
                variant="body1"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {/* Lock/Unlock Icon */}
                {lockedStatus ? (
                  <Lock sx={{ fontSize: 30, color: "error.main" }} />
                ) : (
                  <LockOpen sx={{ fontSize: 30, color: "success.main" }} />
                )}

                {lockedStatus ? "Locked" : "Unlocked"}
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title={"Start a Video Chat"} arrow>
            <Box
              sx={{
                p: 2,
                borderRadius: "20px",
                boxShadow: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
              }}
              onClick={toggleVideoCall}
            >
              <VideoCallIcon sx={{ fontSize: 40, color: "green" }} />
            </Box>
          </Tooltip>
        </Grid>

        {/* Main Coding Area */}
        <Grid item xs={12}>
          <Paper
            sx={{
              bgcolor: "#424242",
              p: 4,
              borderRadius: "20px",
              height: "60vh",
              display: "flex",
              boxShadow: 3,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Grid
              container
              spacing={2}
              sx={{
                width: videoCallOpen ? "80%" : "100%",
                transition: "width 0.3s ease",
              }}
            >
              <Grid item xs={4} sx={{ pr: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    fontWeight: 500,
                    padding: "24px",
                  }}
                >
                  Execution result:
                </Typography>
                <Box
                  sx={{
                    bgcolor: "background.paper",
                    p: 2,
                    boxShadow: 2,
                    height: "48vh",
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    {result !== null ? result : "No result yet."}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={8}>
                <Box sx={{ height: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "white",
                        fontWeight: 500,
                      }}
                    >
                      Collaborative Coding Area
                    </Typography>

                    {/* Typing User Display */}
                    {typingUser && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: "white",
                          gap: 1,
                        }}
                      >
                        <TextsmsRounded fontSize="small" />
                        <Typography variant="body2">
                          {typingUser} is typing...
                        </Typography>
                      </Box>
                    )}

                    <Box>
                      <Select
                        value={selectedLanguage}
                        onChange={(e) => updateLanguage(e.target.value)}
                        sx={{
                          cursor: "not-allowed",
                          marginRight: "30px",
                          color: "white",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "white",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "white",
                          },
                        }}
                        disabled={lockedStatus}
                      >
                        <MenuItem value="json">JSON</MenuItem>
                        <MenuItem value="html">HTML</MenuItem>
                        <MenuItem value="css">CSS</MenuItem>
                        <MenuItem value="typescript">TypeScript</MenuItem>
                        <MenuItem value="javascript">JavaScript</MenuItem>
                        <MenuItem value="python">Python</MenuItem>
                        <MenuItem value="java">Java</MenuItem>
                        <MenuItem value="c">C</MenuItem>
                        <MenuItem value="cpp">C++</MenuItem>
                        <MenuItem value="ruby">Ruby</MenuItem>
                        <MenuItem value="php">PHP</MenuItem>
                      </Select>

                      <Tooltip
                        title={
                          lockedStatus
                            ? "Session is locked. Cannot save code."
                            : "Save Code"
                        }
                        arrow
                      >
                        <span>
                          <IconButton
                            onClick={lockedStatus ? undefined : handleSaveCode}
                            sx={{
                              color: lockedStatus ? "gray" : "white",
                              cursor: lockedStatus ? "not-allowed" : "pointer",
                            }}
                          >
                            <Save />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Run Code" arrow>
                        <IconButton
                          onClick={lockedStatus ? undefined : handleRunCode}
                          sx={{
                            color: lockedStatus ? "gray" : "white",
                            cursor: lockedStatus ? "not-allowed" : "pointer",
                          }}
                        >
                          <PlayArrow />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Code Editor */}
                  <CodeEditor selectedLanguage={selectedLanguage} />
                </Box>
              </Grid>
            </Grid>

            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: videoCallOpen ? "20%" : 0,
                height: "100%",
                bgcolor: "background.default",
                transition: "width 0.3s ease",
                boxShadow: videoCallOpen
                  ? "-5px 0 5px rgba(0, 0, 0, 0.2)"
                  : "none",
              }}
            >
              {/* Slider content */}
              <Box
                sx={{
                  p: 2,
                  display: videoCallOpen ? "grid" : "none",
                  height: "100%",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6">Video Call Section</Typography>
                <VideoChat />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {/* Drawer for Participants */}
      <Participants
        participants={sessionData.participants}
        creator={sessionData.creator}
        drawerOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sessionId={sessionId}
      />
    </Container>
  );
};

export default Session;
