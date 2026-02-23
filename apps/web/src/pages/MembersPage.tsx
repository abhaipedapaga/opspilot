import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Paper, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Chip, CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  useGetMembersQuery,
  useAddMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} from "../api/apiSlice";

const ROLES = ["ADMIN", "MANAGER", "VIEWER"];

const roleColor = (role: string) => {
  if (role === "ADMIN") return "error";
  if (role === "MANAGER") return "warning";
  return "default";
};

export default function MembersPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();

  const { data: members, isLoading, error } = useGetMembersQuery(orgId!);
  const [addMember] = useAddMemberMutation();
  const [updateMemberRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [addError, setAddError] = useState("");

  const handleAdd = async () => {
    setAddError("");
    try {
      await addMember({ orgId: orgId!, email, role }).unwrap();
      setEmail("");
      setRole("VIEWER");
      setAddOpen(false);
    } catch (e: any) {
      setAddError(e?.data?.error || "Failed to add member");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateMemberRole({ orgId: orgId!, userId, role: newRole });
  };

  const handleRemove = async (userId: string) => {
    if (confirm("Remove this member?")) {
      await removeMember({ orgId: orgId!, userId });
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/orgs")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">Members</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          sx={{ ml: "auto" }}
          onClick={() => setAddOpen(true)}
        >
          Add Member
        </Button>
      </Box>

      <Paper>
        {isLoading && <CircularProgress sx={{ m: 3 }} />}
        {error && <Typography color="error" sx={{ p: 3 }}>Failed to load members</Typography>}

        {members && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.user.fullName || "—"}</TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user.id, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <MenuItem key={r} value={r}>
                            <Chip label={r} size="small" color={roleColor(r) as any} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleRemove(member.user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>Add Member</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, minWidth: 350 }}>
          <TextField
            autoFocus
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {addError && <Typography color="error">{addError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}