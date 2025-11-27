// Chart colors that work with both light and dark themes
// Using HSL values that adapt to theme
export const getChartColors = (isDark: boolean) => {
  if (isDark) {
    return [
      'hsl(217, 91%, 60%)', // primary blue
      'hsl(142, 76%, 36%)', // green
      'hsl(38, 92%, 50%)',  // yellow/amber
      'hsl(0, 84%, 60%)',   // red
      'hsl(262, 83%, 58%)', // purple
      'hsl(199, 89%, 48%)', // cyan
      'hsl(280, 100%, 70%)', // pink
      'hsl(25, 95%, 53%)',  // orange
    ]
  }
  return [
    'hsl(221, 83%, 53%)', // primary blue
    'hsl(142, 71%, 45%)', // green
    'hsl(38, 92%, 50%)',  // yellow/amber
    'hsl(0, 84%, 60%)',   // red
    'hsl(262, 83%, 58%)', // purple
    'hsl(199, 89%, 48%)', // cyan
    'hsl(280, 100%, 70%)', // pink
    'hsl(25, 95%, 53%)',  // orange
  ]
}

// Get current theme
export const isDarkMode = () => {
  if (typeof window === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

// Chart styling configuration
export const chartConfig = {
  grid: {
    stroke: 'hsl(var(--border))',
    strokeWidth: 1,
  },
  axis: {
    stroke: 'hsl(var(--muted-foreground))',
    strokeWidth: 1,
    tick: {
      fill: 'hsl(var(--muted-foreground))',
    },
  },
  tooltip: {
    backgroundColor: 'hsl(var(--popover))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--popover-foreground))',
  },
}

