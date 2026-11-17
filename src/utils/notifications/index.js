import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configuração básica de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Solicitar permissões (chamar isto quando o usuário fizer primeiro login)
export async function requestNotificationPermissions() {
  if (!Device.isDevice) {
    void 0;
    // Retornamos true mesmo no emulador para facilitar testes
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Agendar os 3 tipos de lembrete em diferentes períodos do dia
export async function scheduleDefaultReminders() {
  try {
    // Cancela notificações existentes para evitar duplicatas
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // 1. Lembrete matinal para estudar (9:00)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Bom dia! Hora de praticar!',
        body: 'Comece o dia com alguns minutos de estudo para potencializar seu aprendizado.',
        data: { type: 'morning_reminder' },
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
    
    // 2. Lembrete da tarde para adicionar novas palavras (15:00)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 Momento de expandir vocabulário!',
        body: 'Adicione palavras novas que você encontrou hoje para expandir seu conhecimento.',
        data: { type: 'afternoon_reminder' },
      },
      trigger: {
        hour: 15,
        minute: 0,
        repeats: true,
      }
    });
    
    // 3. Lembrete noturno motivacional (20:00)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧠 Consistência é a chave!',
        body: 'Antes de terminar o dia, revise alguns flashcards e mantenha seu progresso.',
        data: { type: 'evening_reminder' },
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      }
    });

    void 0;
    return true;
  } catch (error) {
    void 0;
    return false;
  }
}

// Função útil para verificar notificações programadas (para debug)
export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}