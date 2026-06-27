export const tokens = {
  radius: {
    xs: "var(--radius-xs)",
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
  },
  space: {
    1: "var(--space-1)",
    2: "var(--space-2)",
    3: "var(--space-3)",
    4: "var(--space-4)",
    5: "var(--space-5)",
    6: "var(--space-6)",
    8: "var(--space-8)",
  },
  text: {
    xs: "var(--text-xs)",
    sm: "var(--text-sm)",
    md: "var(--text-md)",
    lg: "var(--text-lg)",
    xl: "var(--text-xl)",
    "2xl": "var(--text-2xl)",
  },
  color: {
    accent: {
      blue: "var(--color-accent-blue)",
      green: "var(--color-accent-green)",
      red: "var(--color-accent-red)",
      yellow: "var(--color-accent-yellow)",
      orange: "var(--color-accent-orange)",
      purple: "var(--color-accent-purple)",
    },
    mac: {
      label: "var(--color-mac-label)",
      secondaryLabel: "var(--color-mac-secondary-label)",
      windowBackground: "var(--color-mac-window-background)",
    },
    vibrancy: {
      base: "var(--color-vibrancy-base)",
      hover: "var(--color-vibrancy-hover)",
      active: "var(--color-vibrancy-active)",
      border: "var(--color-vibrancy-border)",
      overlay: "var(--color-vibrancy-overlay)",
    },
    focusRing: "var(--color-focus-ring)",
    toggleOff: "var(--color-toggle-off)",
  }
} as const;

export type Tokens = typeof tokens;
