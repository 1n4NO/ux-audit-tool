import { requireUser } from "@/lib/auth";
import {
  Avatar,
  Box,
  Chip,
  Paper,
  Typography,
} from "@mui/material";

export default async function AccountPage() {
  const { user, profile, workspace } = await requireUser("/login?next=/account");

  return (
    <Box sx={{ display: "grid", gap: 3, maxWidth: 760 }}>
      <Box>
        <Typography variant="h3" sx={{ mb: 1 }}>
          Account
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is the initial authenticated user surface. It gives the app a stable
          place for profile, billing, and future workspace settings.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar src={profile?.avatarUrl ?? undefined}>
            {(profile?.displayName ?? user.email ?? "U").charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {profile?.displayName ?? user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Chip label="Authenticated" color="success" variant="outlined" />
          <Chip label="Reports enabled" variant="outlined" />
          {workspace && (
            <Chip
              label={workspace.personal ? "Personal workspace" : "Team workspace"}
              variant="outlined"
            />
          )}
        </Box>

        <Box sx={{ display: "grid", gap: 1.25 }}>
          <Typography variant="body2">
            <strong>User ID:</strong> {user.id}
          </Typography>
          <Typography variant="body2">
            <strong>Profile created:</strong>{" "}
            {profile ? new Date(profile.createdAt).toLocaleString() : "Not available"}
          </Typography>
          <Typography variant="body2">
            <strong>Last sign-in:</strong>{" "}
            {profile?.lastSignedInAt
              ? new Date(profile.lastSignedInAt).toLocaleString()
              : "Not available"}
          </Typography>
          <Typography variant="body2">
            <strong>Workspace:</strong> {workspace?.name ?? "Not available"}
          </Typography>
          <Typography variant="body2">
            <strong>Workspace slug:</strong> {workspace?.slug ?? "Not available"}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
