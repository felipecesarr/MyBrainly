import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  Linking, 
  SafeAreaView,
  ScrollView, 
  StatusBar,
  Image,
  Platform
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useRevenueCat } from '../../../contexts/RevenueCatContext';

export default function MySubscription() {
  const navigation = useNavigation();
  const { user, packages, purchasePackage } = useRevenueCat();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [subscribedStatus, setSubscribedStatus] = useState(false);
  
  // Verificar se o usuário já tem assinatura ativa
  useEffect(() => {
    if (user && user.plus) {
      setSubscribedStatus(true);
    }

    // Pré-selecionar o pacote mensal (único disponível)
    if (packages && packages.length > 0) {
      const monthlyPackage = packages.find(pack => pack.packageType === "MONTHLY");
      if (monthlyPackage) {
        setSelectedPackage(monthlyPackage);
      }
    }
  }, [user, packages]);

  const openLink = async (url) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      alert("Não foi possível abrir o link. Por favor, tente novamente mais tarde.");
    }
  };

  const handlePurchase = async () => {
    if (selectedPackage) {
      try {
        void 0;
        await purchasePackage(selectedPackage);
        void 0;
        setModalVisible(false);
        setSubscribedStatus(true);
      } catch (error) {
        void 0;
        setModalVisible(false);
      }
    } else {
      alert("Ocorreu um problema ao selecionar o plano.");
    }
  };

  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(date).toLocaleDateString('pt-BR', options);
  };

  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  const renderSubscriptionDetails = () => {
    return (
      <Animatable.View 
        animation="fadeIn"
        style={styles.subscriptionCard}
      >
        <LinearGradient
          colors={['#F8EDFF', '#F5E7FF']}
          style={styles.cardGradient}
        />
        
        <View style={styles.cardHeader}>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {subscribedStatus ? 'Assinatura Ativa' : 'Plano Disponível'}
            </Text>
          </View>
          
          <MaterialIcons name="verified" size={18} color="#CB48DF" style={{marginLeft: 4}} />

        </View>
        
        <Text style={styles.planTitle}>MyBrainly Plus</Text>
        <Text style={styles.planPrice}>
          {selectedPackage?.product.priceString} <Text style={styles.planPeriod}>por mês</Text>
        </Text>
        
        {subscribedStatus && (
          <View style={styles.renewalContainer}>
            <Text style={styles.renewalLabel}>Próxima renovação:</Text>
            <Text style={styles.renewalDate}>{formatDate(nextBillingDate)}</Text>
          </View>
        )}
      </Animatable.View>
    );
  };

  const renderBenefits = () => {
    const benefits = [
      { icon: 'cards', title: 'Flashcards Ilimitados', description: 'Crie quantos flashcards desejar' },
      { icon: 'robot-happy', title: 'Decks com IA', description: 'Crie até 7 decks/mês com ajuda da IA' },
      { icon: 'chart-box', title: 'Análises Avançadas', description: 'Acompanhe seu progresso em detalhes' },
      { icon: 'sitemap', title: 'Explore', description: 'Compartilhe decks com a cominida MyBrainly' }
    ];

    return (
      <Animatable.View 
        animation="fadeIn" 
        delay={300} 
        style={styles.benefitsSection}
      >
        <Text style={styles.sectionTitle}>Benefícios do Plus</Text>
        
        {benefits.map((benefit, index) => (
          <Animatable.View 
            key={index}
            animation="fadeInUp"
            delay={400 + (index * 100)}
            style={styles.benefitItem}
          >
            <View style={styles.benefitIcon}>
              <MaterialCommunityIcons name={benefit.icon} size={22} color="#CB48DF" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
            </View>
          </Animatable.View>
        ))}
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha Assinatura</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSubscriptionDetails()}
        {renderBenefits()}
        
        <Animatable.View 
          animation="fadeIn" 
          delay={800} 
          style={styles.actionsSection}
        >
          {!subscribedStatus ? (
            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={() => setModalVisible(true)}
            >
              <LinearGradient
                colors={['#CB48DF', '#8A2BE2']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.subscribeButtonText}>Assinar Agora</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.managePlanButton}
                onPress={() => {
                  // Abrir link para gerenciar assinatura baseado na plataforma
                  const subscriptionURL = Platform.OS === 'ios' 
                    ? 'https://apps.apple.com/account/subscriptions'
                    : 'https://play.google.com/store/account/subscriptions';
                  
                  Linking.openURL(subscriptionURL);
                }}
              >
                <Text style={styles.managePlanButtonText}>Gerenciar Assinatura</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.supportButton}
                onPress={() => Linking.openURL('mailto:suporte@mybrainly.app?subject=Suporte%20com%20assinatura')}
              >
                <Text style={styles.supportButtonText}>Contatar Suporte</Text>
              </TouchableOpacity>
            </>
          )}
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeIn" 
          delay={1000} 
          style={styles.termsSection}
        >
          <Text style={styles.termsText}>
            Ao assinar, você concorda com nossos{' '}
            <Text 
              style={styles.termsLink} 
              onPress={() => openLink('https://tiny-platform-864674.framer.app/terms-of-use')}
            >
              Termos de Uso
            </Text> e{' '}
            <Text 
              style={styles.termsLink} 
              onPress={() => openLink('https://tiny-platform-864674.framer.app/privacy-policy')}
            >
              Política de Privacidade
            </Text>
          </Text>
        </Animatable.View>
      </ScrollView>

      {/* Modal de confirmação */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View 
            animation="slideInUp" 
            duration={300}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            
            <Image 
              source={require('../../../../assets/MyBrainlyDeck.png')} 
              style={styles.modalImage}
            />
            
            <Text style={styles.modalTitle}>
              Assine o MyBrainly Plus
              <MaterialIcons name="verified" size={18} color="#CB48DF" style={{marginLeft: 8}} />
            </Text>
            
            <Text style={styles.modalMessage}>
              Você está prestes a assinar o plano mensal. A assinatura é renovada automaticamente, mas pode ser cancelada a qualquer momento.
            </Text>
            
            <Text style={styles.priceSummary}>
              {selectedPackage?.product.priceString} por mês
            </Text>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handlePurchase}
            >
              <LinearGradient
                colors={['#CB48DF', '#8A2BE2']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.confirmButtonText}>Confirmar Assinatura</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 50 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  subscriptionCard: {
    margin: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  premiumIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#CB48DF',
    marginBottom: 12,
  },
  planPeriod: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#888',
  },
  renewalContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  renewalLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  renewalDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  benefitsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#777',
  },
  actionsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#CB48DF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  managePlanButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CB48DF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  managePlanButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CB48DF',
  },
  supportButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  termsSection: {
    marginHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#CB48DF',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 8,
  },
  modalHeader: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
    resizeMode: 'contain',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  priceSummary: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#CB48DF',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  }
});