import {
  Box, Paper, Typography, Avatar, Divider, CircularProgress
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useGetMeQuery } from "../api/apiSlice";

export default function ProfilePage() {
  const { data: user, isLoading, error } = useGetMeQuery();

  if (isLoading) return <CircularProgress sx={{ m: 4 }} />;
  if (error) return <Typography color="error" sx={{ m: 4 }}>Failed to load profile</Typography>;

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main" }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5">{user?.fullName || "No name set"}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">USER ID</Typography>
            <Typography variant="body2">{user?.id}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">EMAIL</Typography>
            <Typography variant="body2">{user?.email}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">FULL NAME</Typography>
            <Typography variant="body2">{user?.fullName || "—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">MEMBER SINCE</Typography>
            <Typography variant="body2">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}