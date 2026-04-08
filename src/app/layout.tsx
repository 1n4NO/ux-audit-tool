import AppThemeProvider from "./components/AppThemeProvider";
import AuthStatus from "./components/AuthStatus";
import ThemeToggle from "./components/ThemeToggle";
import "./globals.css";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getCurrentUserContext } from "@/lib/user-profile";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authEnabled = hasSupabaseEnv();
  let initialUserEmail: string | null = null;
  let initialDisplayName: string | null = null;

  if (authEnabled) {
    const { user, profile } = await getCurrentUserContext();
    initialUserEmail = user?.email ?? null;
    initialDisplayName = profile?.displayName ?? null;
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitColorSchemeScript
          attribute="data"
          defaultMode="system"
          modeStorageKey="theme"
        />
      </head>
      <body>
        <AppThemeProvider>
          <AppBar
            position="sticky"
            color="inherit"
            elevation={0}
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              backdropFilter: "blur(10px)",
            }}
          >
            <Container maxWidth="lg">
              <Toolbar disableGutters sx={{ justifyContent: "space-between", gap: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800 }}
                >
                  <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
                    UX Audit Engine
                  </Link>
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
                    <Box sx={{ typography: "body2" }}>Home</Box>
                  </Link>
                  <Link href="/#features" style={{ color: "inherit", textDecoration: "none" }}>
                    <Box sx={{ typography: "body2" }}>Features</Box>
                  </Link>
                  <AuthStatus
                    authEnabled={authEnabled}
                    initialUserEmail={initialUserEmail}
                    initialDisplayName={initialDisplayName}
                  />
                  <ThemeToggle />
                </Box>
              </Toolbar>
            </Container>
          </AppBar>

          <Container component="main" maxWidth="lg" sx={{ py: 5 }}>
            {children}
          </Container>
        </AppThemeProvider>
      </body>
    </html>
  );
}
