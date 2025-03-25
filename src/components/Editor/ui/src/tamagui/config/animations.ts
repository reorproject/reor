import { createAnimations } from '@tamagui/animations-css'

const animations = createAnimations({
  fast: 'ease-in-out 150ms',
  medium: 'ease-in-out 300ms',
  slow: 'ease-in-out 450ms',
  slideInDownSlow: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 120,
    opacity: {
      overshootClamping: true,
    },
  },
  slideInDownMedium: {
    type: 'timing',
    duration: 300,
  },
  slideInDownFast: {
    type: 'timing',
    duration: 150,
  },
})

export default animations
