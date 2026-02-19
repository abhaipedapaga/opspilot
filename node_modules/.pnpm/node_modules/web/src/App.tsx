import { useEffect, useState } from "react";
import { Container, Typography, Paper, List, ListItem, ListItemText } from "@mui/material";

type Org = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export default function App() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("/api/orgs")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setOrgs(json))
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        OpsPilot Dashboard
      </Typography>

      <Paper sx={{ p: 2 }}>
        {error && <Typography color="error">API Error: {error}</Typography>}
        {!error && orgs.length === 0 && <Typography>Loading organizations...</Typography>}

        {orgs.length > 0 && (
          <List>
            {orgs.map((org) => (
              <ListItem key={org.id} divider>
                <ListItemText primary={org.name} secondary={`Org ID: ${org.id}`} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}
