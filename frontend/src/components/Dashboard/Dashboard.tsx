import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Container,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import ShareIcon from "@mui/icons-material/Share";
import PeopleIcon from "@mui/icons-material/People";
import LockIcon from "@mui/icons-material/Lock";
import LanguageIcon from "@mui/icons-material/Language";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import HighlightIcon from "@mui/icons-material/Highlight";
import VideocamIcon from "@mui/icons-material/Videocam";

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={4} alignItems="stretch">
          {/* Welcome Card */}
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{ p: 3, textAlign: "center", backgroundColor: "#f5f5f5" }}
            >
              <Typography
                variant="h3"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Welcome to The Gist
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontStyle: "italic", color: "#555" }}
              >
                A real-time collaborative code playground designed for seamless
                teamwork.
              </Typography>
            </Paper>
          </Grid>

          {/* Feature Cards */}
          {[
            {
              icon: <AddCircleIcon color="secondary" sx={{ fontSize: 50 }} />,
              title: "Create or Join Sessions",
              description:
                "Easily create a new session or join existing ones via links.",
            },
            {
              icon: <ShareIcon color="secondary" sx={{ fontSize: 50 }} />,
              title: "Share Session via Link",
              description:
                "Invite others by sharing a session link for real-time collaboration.",
            },
            {
              icon: <PeopleIcon color="success" sx={{ fontSize: 50 }} />,
              title: "Participant Statuses",
              description: "See who's online and their status in the session.",
            },
            {
              icon: <LockIcon color="error" sx={{ fontSize: 50 }} />,
              title: "Control Your Session",
              description:
                "As the creator, you can mute, kick participants, or lock the session.",
            },
            {
              icon: <LanguageIcon color="primary" sx={{ fontSize: 50 }} />,
              title: "Choose Programming Language",
              description:
                "Select from multiple programming languages to write your code.",
            },
            {
              icon: <HighlightIcon color="info" sx={{ fontSize: 50 }} />,
              title: "Syntax Highlighting",
              description:
                "Enjoy syntax highlighting for a variety of programming languages.",
            },
            {
              icon: <CodeIcon color="primary" sx={{ fontSize: 50 }} />,
              title: "Live Code Collaboration",
              description:
                "Work together in real-time, with instant feedback on code changes.",
            },
            {
              icon: <VideocamIcon color="primary" sx={{ fontSize: 50 }} />,
              title: "Video Group Call",
              description:
                "Join the group video call with other participants in the session.",
            },
            {
              icon: <PlayArrowIcon color="success" sx={{ fontSize: 50 }} />,
              title: "Run & Save Code",
              description:
                "Execute your code in real-time and get instant results back.",
            },
          ].map((card, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={index}
              sx={{ display: "flex" }}
            >
              <Card
                elevation={3}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
                  {card.icon}
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "medium", color: "#333" }}
                  >
                    {card.title}
                  </Typography>
                  <Typography variant="body2">{card.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
