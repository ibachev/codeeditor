import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { IconButton, Box } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { useVideoChat } from "../hooks/useVideoChat";

interface VideoChatProps {
  sessionId: string;
}

const VideoChat: React.FC<VideoChatProps> = ({ sessionId }) => {
  const { videoGridRef, myVideoRef, toggleVideo, toggleAudio } = useVideoChat(
    sessionId || "default-room"
  );

  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoMuted((prev) => !prev);
  };

  const handleToggleAudio = () => {
    toggleAudio();
    setIsAudioMuted((prev) => !prev);
  };

  return (
    <Box
      ref={videoGridRef}
      sx={{
        width: "220px",
        height: "500px",
        overflowY: "auto",
        paddingBottom: "20px",
      }}
    >
      <Box
        sx={{
          width: "100%",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <video
          ref={myVideoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "10px",
          }}
        ></video>

        {/* Mute/Unmute controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            position: "absolute",
            top: "160px",
            left: "20%",
            transform: "translateX(-50%)",
            zIndex: 99,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderRadius: "8px",
          }}
        >
          <IconButton onClick={handleToggleVideo} sx={{ color: "white" }}>
            {isVideoMuted ? <VideocamOffIcon /> : <VideocamIcon />}
          </IconButton>

          <IconButton onClick={handleToggleAudio} sx={{ color: "white" }}>
            {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoChat;
