import { useEffect, useState } from "react";
import { Container, Typography, Paper } from "@mui/material";

type HealthResponse = {
  status: string;
  service: string;
};

export default function App() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("/api/health")

      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        OpsPilot Dashboard
      </Typography>

      <Paper sx={{ p: 2 }}>
        {error && <Typography color="error">API Error: {error}</Typography>}
        {!error && !data && <Typography>Loading API...</Typography>}
        {data && (
          <>
            <Typography>Status: {data.status}</Typography>
            <Typography>Service: {data.service}</Typography>
          </>
        )}
      </Paper>
    </Container>
  );
}
