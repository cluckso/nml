import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.me.adhd',
  appName: 'CallGrabbr Dashboard',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
