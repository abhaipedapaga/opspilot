import { useState } from "react";
import { Container, Paper, Typography, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("admin@opspilot.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");

  const onLogin = async () => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

      if (!res.ok) {
        setError(data.error || `Login failed (HTTP ${res.status})`);
        return;
      }

      dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
      navigate("/dashboard");
    } catch (e: any) {
      setError(`Network error: ${e?.message || String(e)}`);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Login</Typography>

        <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <Typography color="error">{error}</Typography>}

        <Button type="button" variant="contained" fullWidth sx={{ mt: 2 }} onClick={onLogin}>
          Login
        </Button>
      </Paper>
    </Container>
  );
}