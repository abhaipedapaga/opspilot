import {
  Box, Grid, Paper, Typography, CircularProgress, List,
  ListItem, ListItemText, Divider, Avatar
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import GroupsIcon from "@mui/icons-material/Groups";
import { useGetStatsQuery } from "../api/apiSlice";
import { useGetMeQuery } from "../api/apiSlice";

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
};

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h4" fontWeight="bold">{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
      </Box>
    </Paper>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetStatsQuery();
  const { data: me } = useGetMeQuery();

  if (isLoading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome back, {me?.fullName || me?.email} 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's what's happening in OpsPilot today.
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Organizations"
            value={stats?.totalOrgs ?? 0}
            icon={<BusinessIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={<PeopleIcon />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Memberships"
            value={stats?.totalMembers ?? 0}
            icon={<GroupsIcon />}
            color="#f57c00"
          />
        </Grid>
      </Grid>

      {/* Recent Organizations */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Recent Organizations
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {stats?.recentOrgs.map((org) => (
            <ListItem key={org.id} divider>
              <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
                {org.name.charAt(0).toUpperCase()}
              </Avatar>
              <ListItemText
                primary={org.name}
                secondary={`Created: ${new Date(org.createdAt).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}