"use client";

import {
  CssBaseline,
  GlobalStyles,
} from "@mui/material";
import {
  ThemeProvider,
  createTheme,
  useColorScheme,
} from "@mui/material/styles";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#0f172a",
        },
        secondary: {
          main: "#7c3aed",
        },
        success: {
          main: "#15803d",
        },
        warning: {
          main: "#ca8a04",
        },
        error: {
          main: "#dc2626",
        },
        background: {
          default: "#f8fafc",
          paper: "#ffffff",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#e2e8f0",
        },
        secondary: {
          main: "#c4b5fd",
        },
        success: {
          main: "#4ade80",
        },
        warning: {
          main: "#facc15",
        },
        error: {
          main: "#f87171",
        },
        background: {
          default: "#0f172a",
          paper: "#111827",
        },
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily:
      'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 800,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
  },
  components: {
    MuiCheckbox: {
      styleOverrides: {
        root: ({ theme: resolvedTheme }) => ({
          color:
            resolvedTheme.palette.mode === "dark"
              ? resolvedTheme.palette.grey[300]
              : resolvedTheme.palette.text.secondary,
          "&.Mui-checked": {
            color:
              resolvedTheme.palette.mode === "dark"
                ? "#93c5fd"
                : resolvedTheme.palette.primary.main,
          },
        }),
      },
    },
  },
});

export default function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      theme={theme}
      defaultMode="system"
      modeStorageKey="theme"
      disableTransitionOnChange
    >
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            minHeight: "100vh",
          },
          a: {
            color: "inherit",
            textDecoration: "none",
          },
        }}
      />
      {children}
    </ThemeProvider>
  );
}

export function useThemeMode() {
  const { mode, setMode } = useColorScheme();
  const resolvedMode = mode ?? "light";

  return {
    mode: resolvedMode,
    toggleMode: () => {
      setMode(resolvedMode === "dark" ? "light" : "dark");
    },
  };
}
