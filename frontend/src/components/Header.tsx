import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import SessionManager from "./Dashboard/SessionManager";
import CodeIcon from "@mui/icons-material/Code";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  privateLayout: boolean;
}

const Header: React.FC<HeaderProps> = ({ privateLayout }) => {
  const [openSessionManager, setOpenSessionManager] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleOpenSessionManager = () => {
    setOpenSessionManager(true);
  };

  const handleCloseSessionManager = () => {
    setOpenSessionManager(false);
  };

  const handleNavigateToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={handleNavigateToDashboard}
          >
            <CodeIcon sx={{ mr: 2 }} />
            <Typography variant="h6">
              Real-Time Collaborative Code Playground
            </Typography>
          </Box>
          {privateLayout && (
            <Box sx={{ ml: "auto" }}>
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
