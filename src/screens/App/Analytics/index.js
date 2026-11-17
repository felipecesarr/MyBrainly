import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Circle } from 'react-native-progress';
import { LineChart, BarChart } from 'react-native-chart-kit';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { useGamification } from '../../../contexts/GamificationContext';
import { ProfileContext } from '../../../contexts/ProfilesContext';
import LevelIndicator from '../../../components/LevelIndicator';
import { styles } from './styles';
import { db, auth } from '../../../db/config/index';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';

const windowWidth = Dimensions.get('window').width;

export default function Analytics() {
  const navigation = useNavigation();
  const { userLevel, updateUserLevel } = useGamification();
  const { selectedProfile } = useContext(ProfileContext);
  
  // Estado para dados carregados do Firestore
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para atualização manual
  const [refreshing, setRefreshing] = useState(false);
  
  // Estado para o período selecionado
  const [timePeriod, setTimePeriod] = useState('week'); // 'week', 'month', 'year'
  
  // Dados para os gráficos
  const [chartData, setChartData] = useState({
    labels: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
  });
  
  // Estado para métricas calculadas
  const [metrics, setMetrics] = useState({
    cardsStudied: 0,
    timeSpent: 0,
    streak: 0,
    dailyAverage: 0,
    retentionRate: 0,
    totalCards: 0,
    highRetentionCards: 0,
    progress: 0,
    cardsNeededForNextLevel: 0
  });

  // Função para buscar dados diretamente do Firestore
  const fetchAnalyticsData = async () => {
    if (!selectedProfile?.id || !auth.currentUser) {
      void 0;
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    void 0;
    
    try {
      // Buscar dados do usuário
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        void 0;
        setIsLoading(false);
        return;
      }
      
      const userData = userSnapshot.data();
      
      // Buscar dados do perfil selecionado
      const profileRef = doc(db, 'profiles', selectedProfile.id);
      const profileSnapshot = await getDoc(profileRef);
      
      if (!profileSnapshot.exists()) {
        void 0;
        setIsLoading(false);
        return;
      }
      
      const profileData = profileSnapshot.data();
      void 0;

      // Buscar todos os decks do perfil
      const decksQuery = query(
        collection(db, 'decks'),
        where('profileId', '==', selectedProfile.id),
        where('userId', '==', auth.currentUser.uid)
      );
      
      const decksSnapshot = await getDocs(decksQuery);
      void 0;
      
      // Processar dados dos decks
      let totalCards = 0;
      let studiedCards = 0;
      let cardsWithHighRetention = 0;
      let dailyActivity = {};
      
      // Para cada deck, buscar seus flashcards
      decksSnapshot.forEach(deckDoc => {
        const deckData = deckDoc.data();
        const deckStats = deckData.stats || {};
        
        // Acumular estatísticas
        totalCards += deckStats.totalCards || 0;
        studiedCards += deckStats.studiedCards || 0;
        cardsWithHighRetention += deckStats.cardsWithHighRetention || 0;
        
        // Agregar atividade diária
        if (deckData.dailyActivity) {
          Object.entries(deckData.dailyActivity).forEach(([date, value]) => {
            const count = typeof value === 'object' ? value.count || 0 : value;
            if (!dailyActivity[date]) {
              dailyActivity[date] = 0;
            }
            dailyActivity[date] += count;
          });
        }
      });
      
      // Calcular retenção geral
      const overallRetention = studiedCards > 0 
        ? Math.round((cardsWithHighRetention / studiedCards) * 100) 
        : 0;
      
      // Tempo total de estudo em minutos
      const totalStudyTime = profileData.totalStudyTime || userLevel?.studyTime || 0;
      
      // Montar objeto de dados completo
      const data = {
        totalCards,
        studiedCards,
        cardsWithHighRetention,
        overallRetention,
        dailyActivity,
        streak: userLevel?.streak || 0,
        totalStudyTime
      };
      
      void 0;
      setAnalyticsData(data);
      
      // Calcular métricas e gerar gráficos
      generateChartData(data);
      calculateMetrics(data);
    } catch (error) {
      void 0;
      Alert.alert(
        "Erro", 
        "Não foi possível carregar os dados. Por favor, tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar dados quando o perfil mudar ou o componente montar
  useEffect(() => {
    if (selectedProfile?.id) {
      updateUserLevel(); // Força atualizar o valor correto
      fetchAnalyticsData();
    }
  }, [selectedProfile?.id]);

  // Escutar quando a tela ganha foco para atualizar dados
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      void 0;
      if (selectedProfile?.id) {
        fetchAnalyticsData();
      }
    });
    
    return unsubscribe;
  }, [navigation, selectedProfile?.id]);

  // Função para atualizar dados manualmente
  const refreshData = () => {
    if (selectedProfile?.id) {
      setRefreshing(true);
      fetchAnalyticsData().finally(() => {
        setRefreshing(false);
      });
    } else {
      Alert.alert("Erro", "Selecione um perfil para atualizar os dados.");
    }
  };

  // Função para gerar dados do gráfico baseado no período
  const generateChartData = (data) => {
    if (!data || !data.dailyActivity) {
      void 0;
      // Manter gráfico com zeros
      setChartData({
        labels: timePeriod === 'week' ? ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] :
                timePeriod === 'month' ? ["Sem 1", "Sem 2", "Sem 3", "Sem 4"] :
                ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        datasets: [{ data: timePeriod === 'week' ? [0, 0, 0, 0, 0, 0, 0] : 
                          timePeriod === 'month' ? [0, 0, 0, 0] : 
                          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }]
      });
      return;
    }
    
    void 0;
    
    let labels = [];
    let chartValues = [];
    const currentDate = new Date();
    
    switch(timePeriod) {
      case 'week': {
        // Últimos 7 dias
        labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const dayData = Array(7).fill(0);
        
        try {
          Object.entries(data.dailyActivity).forEach(([dateStr, activity]) => {
            const count = typeof activity === 'object' ? activity.count || 0 : activity;
            const activityDate = new Date(dateStr);
            const dayDiff = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));
            if (dayDiff < 7) {
              const dayIndex = 6 - dayDiff;
              if (dayIndex >= 0 && dayIndex < 7) {
                dayData[dayIndex] = count;
              }
            }
          });
        } catch (error) {
          void 0;
        }
        
        chartValues = dayData;
        break;
      }
      case 'month': {
        // Últimas 4 semanas
        labels = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];
        const weekData = Array(4).fill(0);
        
        try {
          Object.entries(data.dailyActivity).forEach(([dateStr, activity]) => {
            const count = typeof activity === 'object' ? activity.count || 0 : activity;
            const activityDate = new Date(dateStr);
            const dayDiff = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));
            if (dayDiff < 28) {
              const weekIndex = Math.floor(dayDiff / 7);
              if (weekIndex < 4) {
                weekData[3 - weekIndex] += count;
              }
            }
          });
        } catch (error) {
          void 0;
        }
        
        chartValues = weekData;
        break;
      }
      case 'year': {
        // Últimos 12 meses
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        labels = [...monthNames];
        const monthData = Array(12).fill(0);
        
        try {
          Object.entries(data.dailyActivity).forEach(([dateStr, activity]) => {
            const count = typeof activity === 'object' ? activity.count || 0 : activity;
            const activityDate = new Date(dateStr);
            // Cálculo de diferença de meses
            if (activityDate.getFullYear() >= currentDate.getFullYear() - 1) {
              const monthDiff = (currentDate.getMonth() - activityDate.getMonth() + 12) % 12;
              if (monthDiff < 12) {
                monthData[11 - monthDiff] += count;
              }
            }
          });
        } catch (error) {
          void 0;
        }
        
        chartValues = monthData;
        break;
      }
    }

    void 0;
    setChartData({
      labels,
      datasets: [{ data: chartValues }]
    });
  };

  // Função para calcular métricas
  const calculateMetrics = (data) => {
    if (!data) {
      void 0;
      return;
    }
    
    void 0;
    
    // Extrair valores dos dados
    const totalCards = data.totalCards || 0;
    const cardsStudied = data.studiedCards || 0;
    const highRetentionCards = userLevel?.totalCardsWithHighRetention || 0;
    const retentionRate = data.overallRetention || 0;
    const streak = data.streak || 0;
    
    // Calcular média diária
    const dailyActivity = data.dailyActivity || {};
    const daysActive = Object.keys(dailyActivity).length || 1;
    const dailyAverage = Math.round(cardsStudied / daysActive);
    
    // Calcular progresso para o próximo nível
    let progress = 0;
    let cardsNeededForNextLevel = 0;

    if (userLevel) {
      void 0;
      const { level } = userLevel;
      
      if (level < 8) { // Se não estiver no nível máximo
        // Thresholds para cada nível (começando do nível 1)
        const levelThresholds = [0, 100, 500, 1000, 2500, 5000, 10000, 15000];
        const currentThreshold = levelThresholds[level - 1] || 0;
        const nextThreshold = levelThresholds[level] || levelThresholds[level - 1] * 2;
        
        void 0;
        void 0;
        void 0;
        void 0;
        
        // Calcula cards necessários para o próximo nível
        cardsNeededForNextLevel = Math.max(0, nextThreshold - highRetentionCards);
        
        // Calcula progresso entre thresholds
        const range = nextThreshold - currentThreshold;
        const current = highRetentionCards - currentThreshold;
        progress = range > 0 ? Math.round((current / range) * 100) : 0;
        
        void 0;
        void 0;
      } else {
        progress = 100; // Nível máximo
        cardsNeededForNextLevel = 0;
      }
    } else {
      void 0;
      // Usar progresso 0 quando não há dados de nível
      progress = 0;
      cardsNeededForNextLevel = 0;
    }

    // Calcular tempo de estudo (em horas)
    const timeSpentMinutes = data.totalStudyTime || 0;
    const timeSpent = timeSpentMinutes > 0 ? Math.round(timeSpentMinutes / 60) : 0;
    
    // Atualizar o estado de métricas
    const calculatedMetrics = {
      cardsStudied,
      timeSpent,
      streak,
      dailyAverage,
      retentionRate,
      totalCards,
      highRetentionCards,
      progress: Math.min(Math.max(progress, 0), 100), // Limita entre 0 e 100
      cardsNeededForNextLevel
    };
    
    void 0;
    setMetrics(calculatedMetrics);
  };

  // Recalcular dados quando o período mudar
  useEffect(() => {
    if (analyticsData) {
      generateChartData(analyticsData);
    }
  }, [timePeriod]);

  // Renderiza um card métrico
  const renderMetricCard = (icon, title, value, subtitle, color = '#CB48DF', progress = null) => {
    return (
      <Animatable.View animation="fadeIn" style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Ionicons name={icon} size={20} color={color} />
          <Text style={styles.metricTitle}>{title}</Text>
        </View>
        
        <View style={styles.metricContent}>
          {progress !== null ? (
            <View style={styles.progressContainer}>
              <Circle
                size={60}
                progress={progress / 100}
                thickness={6}
                color={color}
                unfilledColor="#F0F0F0"
                borderWidth={0}
                strokeCap="round"
                showsText={true}
                formatText={() => `${Math.round(progress)}%`}
                textStyle={{ fontSize: 16, color: '#333', fontWeight: '600' }}
              />
              <Text style={styles.metricSubtitle}>{subtitle}</Text>
            </View>
          ) : (
            <View style={styles.valueContainer}>
              <Text style={[styles.metricValue, { color }]}>{value}</Text>
              <Text style={styles.metricSubtitle}>{subtitle}</Text>
            </View>
          )}
        </View>
      </Animatable.View>
    );
  };

  // Renderiza um insight
  const renderInsight = (icon, text, color = '#CB48DF') => {
    return (
      <Animatable.View animation="fadeIn" delay={300} style={styles.insightCard}>
        <View style={[styles.insightIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </Animatable.View>
    );
  };

  // Gera insights personalizados com base nos dados
  const generateInsights = () => {
    const insights = [];
    
    // Insight sobre streak
    if (metrics.streak > 7) {
      insights.push({
        icon: 'flame-outline',
        text: `Impressionante! Você está estudando há ${metrics.streak} dias seguidos. Mantenha este ritmo!`,
        color: '#FF9500'
      });
    } else if (metrics.streak > 0) {
      insights.push({
        icon: 'flame-outline',
        text: `Você tem uma sequência de ${metrics.streak} dias. Tente chegar a 7 dias seguidos para um impulso de memória!`,
        color: '#FF9500'
      });
    } else {
      insights.push({
        icon: 'flame-outline',
        text: 'Estude hoje para começar uma nova sequência! Estudos regulares melhoram significativamente a retenção.',
        color: '#FF9500'
      });
    }
    
    // Insight sobre retenção
    if (metrics.retentionRate >= 80) {
      insights.push({
        icon: 'bulb-sharp',
        text: `Sua taxa de retenção de ${metrics.retentionRate}% é excelente! Você está dominando o conteúdo muito bem.`,
        color: '#34C759'
      });
    } else if (metrics.retentionRate >= 50) {
      insights.push({
        icon: 'bulb-sharp',
        text: `Sua taxa de retenção é de ${metrics.retentionRate}%. Boa, mas tente revisar cards com mais frequência para chegar a 80%.`,
        color: '#007AFF'
      });
    } else if (metrics.cardsStudied > 0) {
      insights.push({
        icon: 'bulb-sharp',
        text: `Sua taxa de retenção está em ${metrics.retentionRate}%. Tente usar técnicas de revisão espaçada para melhorar.`,
        color: '#FF3B30'
      });
    }
    
    // Insight sobre progresso para o próximo nível
    if (metrics.progress > 75) {
      insights.push({
        icon: 'trophy-outline',
        text: `Você está a apenas ${100 - metrics.progress}% de distância do próximo nível! Continue estudando.`,
        color: '#CB48DF'
      });
    }
    
    // Insight baseado no tempo de estudo
    if (metrics.timeSpent > 0) {
      insights.push({
        icon: 'time-outline',
        text: `Você já dedicou ${metrics.timeSpent} horas ao seu aprendizado. Consistência é a chave para o sucesso!`,
        color: '#34C759'
      });
    } else {
      insights.push({
        icon: 'time-outline',
        text: `Comece a estudar hoje e acompanhe seu tempo de estudo. Mesmo poucos minutos por dia fazem diferença!`,
        color: '#34C759'
      });
    }
    
    return insights.slice(0, 3); // Limitar a 3 insights
  };

  // Determinar o próximo nível
  const getNextLevelInfo = () => {
    if (!userLevel) return { level: 1, title: "Iniciante" };
    
    if (userLevel.level >= 8) return { level: 8, title: "Nativo" };
    
    const nextLevel = userLevel.level + 1;
    const titles = [
      "Iniciante", "Aprendiz", "Básico", "Intermediário", 
      "Avançado", "Fluente", "Proficiente", "Nativo"
    ];
    
    return {
      level: nextLevel,
      title: titles[nextLevel - 1]
    };
  };
  
  const nextLevel = getNextLevelInfo();

  // Estado de carregamento
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#CB48DF" />
        <Text style={styles.loadingText}>Carregando suas estatísticas...</Text>
      </SafeAreaView>
    );
  }

  // Renderização do gráfico de atividade
  const renderActivityView = () => {
    try {
      return (
        <LineChart
          data={chartData}
          width={320}
          height={220}
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(203, 72, 223, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#CB48DF"
            },
            propsForLabels: {
              fontSize: 12,
            }
          }}
          bezier
          style={styles.chart}
        />
      );
    } catch (error) {
      void 0;
      // Visualização alternativa caso o gráfico falhe
      return (
        <View style={styles.activityContainer}>
          {chartData.datasets[0].data.map((value, index) => {
            const maxValue = Math.max(...chartData.datasets[0].data, 1);
            const barHeight = (value / maxValue) * 120 || 5;
            return (
              <View key={`day-${index}`} style={styles.activityColumn}>
                <View style={styles.activityBarContainer}>
                  <View 
                    style={[
                      styles.activityBar, 
                      { height: barHeight },
                      value === 0 && styles.activityBarEmpty
                    ]} 
                  />
                </View>
                <Text style={styles.activityLabel}>{chartData.labels[index]}</Text>
                <Text style={styles.activityValue}>{value}</Text>
              </View>
            );
          })}
        </View>
      );
    }
  };

  // Renderização do gráfico de barras
  const renderBarChart = () => {
    try {
      return (
        <BarChart
          data={{
            labels: ["Alta Retenção", "Estudando", "Não Vistos"],
            datasets: [
              {
                data: [
                  Math.max(metrics.highRetentionCards, 1),
                  Math.max(metrics.cardsStudied - metrics.highRetentionCards, 1),
                  Math.max(metrics.totalCards - metrics.cardsStudied, 1)
                ]
              }
            ]
          }}
          width={320}
          height={180}
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 0,
            color: (opacity = 1) => {
              return `rgba(203, 72, 223, ${opacity})`;
            },
            labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
            style: {
              borderRadius: 16
            },
            barPercentage: 0.7,
            propsForLabels: {
              fontSize: 12,
            }
          }}
          style={styles.chart}
          showValuesOnTopOfBars={true}
          fromZero={true}
        />
      );
    } catch (error) {
      void 0;
      // Visualização alternativa para o gráfico de barras
      const categories = [
        { 
          label: "Alta Retenção", 
          value: metrics.highRetentionCards,
          color: "#34C759"
        },
        { 
          label: "Estudando", 
          value: metrics.cardsStudied - metrics.highRetentionCards,
          color: "#007AFF"
        },
        { 
          label: "Não Vistos", 
          value: metrics.totalCards - metrics.cardsStudied,
          color: "#FF9500"
        }
      ];
      
      const total = Math.max(metrics.totalCards, 1);
      
      return (
        <View style={styles.flashcardStatusContainer}>
          {categories.map((category, index) => (
            <View key={`status-${index}`} style={styles.flashcardStatusItem}>
              <View style={styles.statusLabelContainer}>
                <View style={[styles.statusDot, { backgroundColor: category.color }]} />
                <Text style={styles.statusLabel}>{category.label}</Text>
              </View>
              <View style={styles.statusBarContainer}>
                <View style={styles.statusBarBackground}>
                  <View 
                    style={[
                      styles.statusBarFill, 
                      { 
                        width: `${(category.value / total) * 100}%`,
                        backgroundColor: category.color
                      }
                    ]}
                  />
                </View>
                <Text style={styles.statusValue}>{category.value}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity onPress={refreshData} style={styles.refreshButton}>
          {refreshing ? 
            <ActivityIndicator size="small" color="#CB48DF" /> :
            <Ionicons name="refresh-outline" size={22} color="#333" />
          }
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Seletor de perfil & nível */}
        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Seu Progresso</Text>
          {/* <LevelIndicator selectedProfile={selectedProfile} /> */}
        </View>

        {/* Cartão de resumo */}
        <Animatable.View animation="fadeIn" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons name="card-bulleted-outline" size={20} color="#333" />
            <Text style={styles.summaryTitle}>Resumo Geral</Text>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{metrics.totalCards}</Text>
              <Text style={styles.summaryLabel}>Total de Cards</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{metrics.cardsStudied}</Text>
              <Text style={styles.summaryLabel}>Cards Estudados</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{metrics.highRetentionCards}</Text>
              <Text style={styles.summaryLabel}>Alta Retenção</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Seletor de período */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, timePeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setTimePeriod('week')}
          >
            <Text style={[styles.periodText, timePeriod === 'week' && styles.periodTextActive]}>Semana</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.periodButton, timePeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setTimePeriod('month')}
          >
            <Text style={[styles.periodText, timePeriod === 'month' && styles.periodTextActive]}>Mês</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.periodButton, timePeriod === 'year' && styles.periodButtonActive]}
            onPress={() => setTimePeriod('year')}
          >
            <Text style={[styles.periodText, timePeriod === 'year' && styles.periodTextActive]}>Ano</Text>
          </TouchableOpacity>
        </View>

        {/* Gráfico de atividade */}
        <Animatable.View animation="fadeIn" style={styles.chartCard}>
          <Text style={styles.chartTitle}>Atividade de Estudo</Text>
          {renderActivityView()}
        </Animatable.View>

        {/* Cards com métricas principais */}
        <Text style={styles.sectionTitle}>Suas Métricas</Text>
        
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'flame-outline', 
            'Streak', 
            metrics.streak.toString(), 
            'dias seguidos', 
            '#FF9500'
          )}
          
          {renderMetricCard(
            'time-outline', 
            'Tempo de Estudo', 
            `${metrics.timeSpent}h`, 
            'tempo total', 
            '#34C759'
          )}
          
          {renderMetricCard(
            'trending-up-outline', 
            'Média Diária', 
            metrics.dailyAverage.toString(), 
            'cards/dia', 
            '#007AFF'
          )}
          
          {renderMetricCard(
            'bulb-sharp', 
            'Retenção', 
            null, 
            'taxa média', 
            '#CB48DF', 
            metrics.retentionRate
          )}
        </View>

        {/* Progresso detalhado */}
        <Text style={styles.sectionTitle}>Detalhes de Progresso</Text>
        
        <Animatable.View animation="fadeIn" delay={200} style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Status dos Flashcards</Text>
            <Text style={styles.totalCards}>{metrics.totalCards} cards</Text>
          </View>
          
          {renderBarChart()}
        </Animatable.View>

        {/* Insights e dicas */}
        <Text style={styles.sectionTitle}>Insights Personalizados</Text>
        
        {generateInsights().map((insight, index) => (
          <React.Fragment key={`insight-${index}`}>
            {renderInsight(insight.icon, insight.text, insight.color)}
          </React.Fragment>
        ))}

        {/* Próximas metas */}
        <Animatable.View animation="fadeIn" delay={400} style={styles.goalsCard}>
          <Text style={styles.goalsTitle}>Próxima Meta</Text>
          
          <View style={styles.goalProgress}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalLevel}>{`Nível ${nextLevel.level}: ${nextLevel.title}`}</Text>
              <Text style={styles.goalDescription}>
                {userLevel && userLevel.level < 8 ? (
                  <>
                    Você precisa de mais <Text style={styles.goalHighlight}>{metrics.cardsNeededForNextLevel}</Text> flashcards 
                    com alta retenção para atingir o próximo nível!
                  </>
                ) : (
                  <Text style={styles.goalHighlight}>Parabéns! Você atingiu o nível máximo.</Text>
                )}
              </Text>
            </View>
            
            <View style={styles.goalBarContainer}>
              <View style={styles.goalBar}>
                <View 
                  style={[
                    styles.goalBarFill, 
                    { 
                      width: `${metrics.progress}%`,
                      backgroundColor: metrics.progress > 0 ? '#CB48DF' : 'transparent' 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.goalPercent}>{metrics.progress}%</Text>
            </View>
          </View>
        </Animatable.View>
        
        {/* Espaço na parte inferior */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}