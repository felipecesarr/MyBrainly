import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AuthRoute from './src/routes/auth';
import AuthProvider from './src/contexts/AuthContext';
import ProfileProvider from './src/contexts/ProfilesContext';
import { RevenueCatProvider } from './src/contexts/RevenueCatContext';
import { navigationRef } from './src/routes/auth/navigationRef';
import { Linking } from 'react-native';
import { GamificationProvider } from './src/contexts/GamificationContext';
import { RunMigrations } from './src/utils/migrations/migrationsGame';
import { auth, db } from './src/db/config';
import { requestNotificationPermissions, scheduleDefaultReminders } from './src/utils/notifications';

const linking = {
  prefixes: ['brainly://'],
  config: {},
};

export default function App() {
  const [isMigrating, setIsMigrating] = useState(false);
  
  useEffect(() => {
    const checkMigration = async () => {
      // Verificar se o usuário está logado antes de tentar migrar
      const user = auth.currentUser;
      
      if (user) {
        setIsMigrating(true);
        try {
          // Use RunMigrations com R maiúsculo, conforme importado
          await RunMigrations();
        } catch (error) {
          void 0;
          // Continua mesmo com erro, para não bloquear o app
        } finally {
          setIsMigrating(false);
        }
      }
    };
    
    checkMigration();
  }, []);

  // Adicione este novo useEffect
  useEffect(() => {
    // Configurar notificações quando o app iniciar
    setupNotifications();
    
    // Opcional: Log para confirmar que tentou configurar
    void 0;
  }, []);

  const setupNotifications = async () => {
    const permissionGranted = await requestNotificationPermissions();
    if (permissionGranted) {
      await scheduleDefaultReminders();
      void 0;
    } else {
      void 0;
    }
  };

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <StatusBar style="dark" backgroundColor="transparent" />
      <RevenueCatProvider>
        <AuthProvider>
          <ProfileProvider>
            <GamificationProvider>
              {isMigrating && (
                <View style={styles.migrationOverlay}>
                  <ActivityIndicator size="large" color="#CB48DF" />
                  <Text style={styles.migrationText}>
                    Atualizando seu perfil...
                  </Text>
                </View>
              )}
              <AuthRoute />
            </GamificationProvider>
          </ProfileProvider>
        </AuthProvider>
      </RevenueCatProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  migrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  migrationText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  }
});