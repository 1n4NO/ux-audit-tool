"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function LoginPage() {
  const authEnabled = hasSupabaseEnv();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  return (
    <Box sx={{ display: "grid", gap: 3, maxWidth: 640, mx: "auto" }}>
      <Box>
        <Typography variant="h3" sx={{ mb: 1 }}>
          Sign in
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Start with passwordless email login. This creates the identity layer needed for
          saved reports, quotas, and future team workspaces.
        </Typography>
      </Box>

      {!authEnabled && (
        <Alert severity="warning" variant="outlined">
          Supabase auth is not configured yet. Add `NEXT_PUBLIC_SUPABASE_URL` and
          `NEXT_PUBLIC_SUPABASE_ANON_KEY` before using sign-in.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box
          component="form"
          onSubmit={async (event) => {
            event.preventDefault();

            if (!supabase) {
              setStatus({
                tone: "error",
                message: "Supabase auth is not configured yet.",
              });
              return;
            }

            setLoading(true);
            setStatus(null);

            const origin = window.location.origin;
            const { error } = await supabase.auth.signInWithOtp({
              email: email.trim(),
              options: {
                emailRedirectTo: `${origin}/auth/callback?next=/`,
              },
            });

            if (error) {
              setStatus({
                tone: "error",
                message: error.message,
              });
            } else {
              setStatus({
                tone: "success",
                message: "Check your email for the sign-in link.",
              });
            }

            setLoading(false);
          }}
          sx={{ display: "grid", gap: 2 }}
        >
          <TextField
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
            fullWidth
          />

          {status && <Alert severity={status.tone}>{status.message}</Alert>}

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<EmailRoundedIcon />}
              disabled={loading || !authEnabled || email.trim() === ""}
            >
              {loading ? "Sending link..." : "Send magic link"}
            </Button>
            <Button component={Link} href="/" variant="text" color="inherit">
              Back to Home
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
