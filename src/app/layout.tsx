import AppThemeProvider from "./components/AppThemeProvider";
import ThemeToggle from "./components/ThemeToggle";
import "./globals.css";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head />
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
