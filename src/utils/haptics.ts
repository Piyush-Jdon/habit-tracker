export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10)
        break
      case 'medium':
        navigator.vibrate(25)
        break
      case 'success':
        navigator.vibrate([15, 60, 20])
        break
      case 'warning':
        navigator.vibrate([40, 40, 40])
        break
    }
  } catch {
    // Fail silently on unsupported devices/browsers
  }
}