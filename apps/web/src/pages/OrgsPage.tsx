import { useState, useEffect } from "react";
import {
  Paper, Typography, List, ListItem, ListItemText,
  IconButton, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Box, CircularProgress, Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import {
  useGetOrgsQuery,
  useCreateOrgMutation,
  useUpdateOrgMutation,
  useDeleteOrgMutation,
  useGetMeQuery,
} from "../api/apiSlice";

export default function OrgsPage() {
  const { data: orgs, isLoading, error } = useGetOrgsQuery();
  const { data: me } = useGetMeQuery();
  const [createOrg] = useCreateOrgMutation();
  const [updateOrg] = useUpdateOrgMutation();
  const [deleteOrg] = useDeleteOrgMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState("");
  const [orgRoles, setOrgRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!orgs) return;
    const token = localStorage.getItem("accessToken");
    orgs.forEach(async (org) => {
      if (orgRoles[org.id]) return;
      const res = await fetch(`/api/me/role?orgId=${org.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.role) {
        setOrgRoles((prev) => ({ ...prev, [org.id]: data.role }));
      }
    });
  }, [orgs]);

  const isAdmin = (orgId: string) => orgRoles[orgId] === "ADMIN";

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createOrg({ name });
    setName("");
    setCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!editOrg || !name.trim()) return;
    await updateOrg({ id: editOrg.id, name });
    setName("");
    setEditOrg(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this organization?")) {
      await deleteOrg(id);
    }
  };

  const roleColor = (role: string) => {
    if (role === "ADMIN") return "error";
    if (role === "MANAGER") return "warning";
    return "default";
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Organizations</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setName(""); setCreateOpen(true); }}>
          New Org
        </Button>
      </Box>

      {isLoading && <CircularProgress />}
      {error && <Typography color="error">Failed to load organizations</Typography>}

      {orgs && (
        <List>
          {orgs.map((org) => (
            <ListItem
              key={org.id}
              divider
              secondaryAction={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {orgRoles[org.id] && (
                    <Chip
                      label={orgRoles[org.id]}
                      size="small"
                      color={roleColor(orgRoles[org.id]) as any}
                    />
                  )}
                  <IconButton onClick={() => { setEditOrg(org); setName(org.name); }}>
                    <EditIcon />
                  </IconButton>
                  {isAdmin(org.id) && (
                    <IconButton color="error" onClick={() => handleDelete(org.id)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              }
            >
              <ListItemText
                primary={org.name}
                secondary={`Created: ${new Date(org.createdAt).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle>New Organization</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Organization Name" value={name} onChange={(e) => setName(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editOrg} onClose={() => setEditOrg(null)}>
        <DialogTitle>Edit Organization</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Organization Name" value={name} onChange={(e) => setName(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOrg(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}