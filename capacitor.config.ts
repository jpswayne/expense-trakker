import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.4dd390322d8c475492f3aeb1c7817a45',
  appName: 'Control de Gastos',
  webDir: 'dist',
  server: {
    url: 'https://4dd39032-2d8c-4754-92f3-aeb1c7817a45.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      iosKeychainPrefix: 'expense-tracker',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: 'Authenticate'
      },
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: 'Authenticate',
        biometricSubTitle: 'Use your fingerprint to authenticate'
      }
    }
  }
};

export default config;