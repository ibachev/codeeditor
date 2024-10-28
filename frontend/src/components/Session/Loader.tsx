import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
interface LoadingWithMessageProps {
  delay?: number;
  message?: string;
}
const LoadingWithMessage: React.FC<LoadingWithMessageProps> = ({
  delay = 10000, // default 10 seconds
  message = "Sorry for the wait, the servers might be down due to inactivity. Please bear with us; this could take 1-2 minutes.",
}) => {
  const [showMessage, setShowMessage] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <CircularProgress />
      {showMessage && (
        <Typography
          sx={{ mt: 2, color: "text.secondary", textAlign: "center" }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};
export default LoadingWithMessage;
