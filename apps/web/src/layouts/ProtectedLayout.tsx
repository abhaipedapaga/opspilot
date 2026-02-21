import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import {
  Box, Drawer, AppBar, Toolbar, Typography, List,
  ListItemButton, ListItemIcon, ListItemText, Button, Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation } from "react-router-dom";

const DRAWER_WIDTH = 220;

export default function ProtectedLayout() {
  const token = localStorage.getItem("accessToken");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { label: "Organizations", path: "/orgs", icon: <BusinessIcon /> },
    { label: "Profile", path: "/profile", icon: <PersonIcon /> },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* Top Bar */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold">OpsPilot</Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", mt: 8 },
        }}
      >
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, mt: 8, ml: `${DRAWER_WIDTH}px`, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}