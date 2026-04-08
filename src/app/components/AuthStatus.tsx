"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import {
  Box,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type AuthStatusProps = {
  authEnabled: boolean;
  initialUserEmail: string | null;
};

export default function AuthStatus({
  authEnabled,
  initialUserEmail,
}: AuthStatusProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      router.refresh();
    });

    void supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (!authEnabled) {
    return (
      <Tooltip title="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth">
        <Box>
          <Button variant="outlined" color="inherit" disabled startIcon={<PersonRoundedIcon />}>
            Auth Setup Required
          </Button>
        </Box>
      </Tooltip>
    );
  }

  if (!userEmail) {
    return (
      <Button
        component={Link}
        href="/login"
        variant="outlined"
        color="inherit"
        startIcon={<LoginRoundedIcon />}
      >
        Sign In
      </Button>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Chip
        icon={<PersonRoundedIcon />}
        label={userEmail}
        variant="outlined"
        sx={{ maxWidth: 220 }}
      />
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<LogoutRoundedIcon />}
        disabled={signingOut}
        onClick={async () => {
          if (!supabase) {
            return;
          }

          setSigningOut(true);
          await supabase.auth.signOut();
          setUserEmail(null);
          router.refresh();
          setSigningOut(false);
        }}
      >
        Sign Out
      </Button>
    </Box>
  );
}
