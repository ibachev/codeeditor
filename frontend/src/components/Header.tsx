import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Dialog,
  Box,
} from "@mui/material";
import SessionManager from "./Dashboard/SessionManager";
import CodeIcon from "@mui/icons-material/Code";

interface HeaderProps {
  privateLayout: boolean;
}

const Header: React.FC<HeaderProps> = ({ privateLayout }) => {
  const [openSessionManager, setOpenSessionManager] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleOpenSessionManager = () => {
    setOpenSessionManager(true);
  };

  const handleCloseSessionManager = () => {
    setOpenSessionManager(false);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <CodeIcon sx={{ mr: 2 }} />
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Real-Time Collaborative Code Playground
          </Typography>
          {privateLayout && (
            <Box>
              <Button color="inherit" onClick={handleOpenSessionManager}>
                Manage Sessions
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {privateLayout && (
        <SessionManager
          open={openSessionManager}
          onClose={handleCloseSessionManager}
        />
      )}
    </>
  );
};

export default Header;
