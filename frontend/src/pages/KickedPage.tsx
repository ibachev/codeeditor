import React from "react";
import PrivateLayout from "../components/layouts/PrivateLayout";
import { Box, Container, Typography, Button } from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { useNavigate } from "react-router-dom";

const KickedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  return (
    <PrivateLayout>
      <Container>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="80vh"
        >
          <ReportProblemIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            You have been kicked from the session.
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Please contact the session creator for further details.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoBack}
            sx={{ mt: 3 }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    </PrivateLayout>
  );
};

export default KickedPage;
