import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Easing, ScrollView, Platform, Dimensions, Animated, Linking } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRevenueCat } from '../../../contexts/RevenueCatContext';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Paywall({ onSubscriptionSuccess }) {
  const navigation = useNavigation();
  const { packages, purchasePackage } = useRevenueCat();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);

  const openLink = async (url) => {
    // Verifica se o link pode ser aberto
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      void 0;
      // Opcional: mostrar um alerta para o usuário informando que o link não pôde ser aberto
      alert("Não foi possível abrir o link. Por favor, tente novamente mais tarde.");
    }
  };

  // Benefícios para o carrossel
  const benefits = [
    { icon: "🧠", title: "Vocabulário personalizado" },
    { icon: "📚", title: "18 idiomas organizados" },
    { icon: "📈", title: "Acompanhe seu progresso" },
    { icon: "⚡", title: "Aprenda na sua rotina" },
    { icon: "🤝", title: "Decks da comunidade" },
    { icon: "🤖", title: "Criação com IA" },
    { icon: "🎯", title: "Foco no que importa" },
  ];

 // No início do componente, adicione essas constantes e refs
const carouselAnim = useRef(new Animated.Value(0)).current;
const carouselWidth = width * 0.7 + 14; // largura do item + marginRight
const totalContentWidth = carouselWidth * benefits.length;

// Substitua o useEffect atual do carrossel pelo seguinte:
useEffect(() => {
  // Iniciar a animação contínua quando o componente for montado
  startCarouselAnimation();
  
  return () => {
    // Limpar a animação quando o componente for desmontado
    carouselAnim.stopAnimation();
  };
}, []);

// Adicione esta função para gerenciar a animação contínua
const startCarouselAnimation = () => {
  // Resetar a animação para o início
  carouselAnim.setValue(0);
  
  // Criar animação que dura 30 segundos para uma rolagem completa
  Animated.timing(carouselAnim, {
    toValue: -totalContentWidth,
    duration: 30000, // 30 segundos para uma rolagem completa
    easing: Easing.linear,
    useNativeDriver: true,
    isInteraction: false,
  }).start(({ finished }) => {
    // Quando terminar, reiniciar a animação
    if (finished) {
      startCarouselAnimation();
    }
  });
};

  // Encontrar o pacote mensal para cálculo de desconto
  const monthlyPack = packages.find(pack => pack.packageType === "MONTHLY");
  const annualPack = packages.find(pack => pack.packageType === "ANNUAL");

  // Selecionar o pacote anual por padrão (se disponível)
  React.useEffect(() => {
    if (annualPack) {
      setSelectedPackage(annualPack);
    } else if (packages.length > 0) {
      setSelectedPackage(packages[0]);
    }
  }, [packages]);

  const handleSelectPackage = (pack) => {
    setSelectedPackage(pack);
  };

  const handlePurchase = async () => {
    if (selectedPackage) {
      setLoading(true);
      try {
        await purchasePackage(selectedPackage);
        setLoading(false);
        if (onSubscriptionSuccess) {
          onSubscriptionSuccess();
        }
      } catch (error) {
        void 0;
        setLoading(false);
        alert("Houve um erro ao processar sua compra. Tente novamente.");
      }
    } else {
      alert("Por favor, selecione um plano antes de prosseguir.");
    }
  };

  const getDiscount = () => {
    if (annualPack && monthlyPack) {
      const monthlyPrice = monthlyPack.product.price;
      const annualPrice = annualPack.product.price;
      const totalMonthly = monthlyPrice * 12;
      return (((totalMonthly - annualPrice) / totalMonthly) * 100).toFixed(0);
    }
    return "50";
  };

  // Principais benefícios para o grid 2x2
  const mainBenefits = [
    {
      icon: "🧠",
      title: "Memorização",
      description: "Aumente sua retenção em até 400% com flashcards personalizados baseados na sua rotina"
    },
    {
      icon: "🤖",
      title: "IA Inteligente",
      description: "Crie decks automáticos com IA adaptada ao seu estilo e contexto de aprendizado"
    },
    {
      icon: "📚",
      title: "18 Idiomas",
      description: "Separe seu vocabulário em até 18 perfis, sem misturar idiomas e com taxa de retenção individual"
    },
    {
      icon: "📊",
      title: "Progresso",
      description: "Acompanhe seu desempenho por idioma e melhore sua retenção semana a semana"
    },
    {
      icon: "🌎",
      title: "Explorar Decks",
      description: "Use e compartilhe flashcards criados por outros usuários da comunidade"
    },
    {
      icon: "⏱️",
      title: "Estudo Espaçado",
      description: "Aprenda com base em intervalos inteligentes para fixar o vocabulário no longo prazo"
    }
  ];
  

  const sortedPackages = [...packages].sort((a, b) => {
    if (a.packageType === "ANNUAL" && b.packageType !== "ANNUAL") {
      return -1;
    } else if (a.packageType !== "ANNUAL" && b.packageType === "ANNUAL") {
      return 1;
    }
    return 0;
  });

  return (
    <LinearGradient
      colors={['#ffffff', '#f5b1ff','#CB48DF']}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Animatable.Image 
            source={require('../../../../assets/icon.png')} 
            style={styles.logo} 
            animation="pulse" 
            iterationCount="infinite" 
            duration={3000}
            resizeMode="contain"
            delay={1000}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={styles.title}>MyBrainly Plus</Text>
            <MaterialIcons name="verified" size={16} color="#CB48DF" />
          </View>
          
          {/* Frase persuasiva */}
          <Animatable.Text 
            style={styles.persuasiveText}
            animation="fadeIn"
            delay={300}
          >
            Transforme sua capacidade de aprendizado e memorize conteúdo 3x mais rápido que métodos tradicionais
          </Animatable.Text>
        </View>

        {/* Grid de Benefícios 2x2 */}
        <View style={styles.benefitsGrid}>
          {mainBenefits.map((benefit, index) => (
            <Animatable.View 
              key={index} 
              style={styles.benefitCard}
              animation="fadeInUp"
              delay={300 + (index * 150)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
              <View style={styles.benefitIconContainer}>
              <Text style={styles.benefitTitleIcon}>{benefit.icon}</Text>
              </View>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              </View>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
            </Animatable.View>
          ))}
        </View>

        {/* Prova Social */}
        <Animatable.View 
          style={styles.socialProofContainer}
          animation="fadeIn"
          delay={800}
        >
          <MaterialCommunityIcons name="format-quote-open" size={24} color="#CB48DF" />
          <Text style={styles.socialProofText}>
            "Sempre achei difícil lembrar palavras novas. Com o MyBrainly, foi como se tudo começasse a fazer sentido. É o único app de flashcards voltado pra idiomas, e isso muda tudo. Meu vocabulário cresceu muito e foi o melhor parceiro de estudo, fez com que o dinheiro investido em curso valesse mais a pena, pois reti muito mais palavras."
          </Text>
          <MaterialCommunityIcons name="format-quote-close" size={24} color="#CB48DF" style={{alignSelf: 'flex-end'}} />
          
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>4.8</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <Ionicons 
                  key={star} 
                  name={star === 5 ? "star-half" : "star"} 
                  size={16} 
                  color="#FFD700" 
                />
              ))}
            </View>
            <Text style={styles.reviewCount}>7.4k avaliações</Text>
          </View>
        </Animatable.View>

        {/* Carrossel de benefícios */}
        <Text style={styles.carouselTitle}>Benefícios Exclusivos</Text>
        <View style={styles.carouselWrapper}>
          {/* Primeiro conjunto de itens para rolagem infinita */}
          <Animated.View
            style={[
              styles.carouselInnerContainer,
              {
                transform: [{ translateX: carouselAnim }]
              }
            ]}
          >
            {/* Repetir os benefícios duas vezes para criar efeito de loop infinito */}
            {[...benefits, ...benefits, ...benefits, ...benefits, ...benefits].map((benefit, index) => (
              <View key={index} style={styles.carouselItem}>
                <Text style={styles.carouselTextIcon}>{benefit.icon}</Text>
                <Text style={styles.carouselText}>{benefit.title}</Text>
              </View>
            ))}
          </Animated.View>
        </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8, justifyContent: 'center' }}>
              <Text style={{fontSize:22}} >🚀</Text>
              <Text style={{fontSize: 16, fontFamily: '500'}} >Assine agora e transforme seu vocabulário.</Text>
            </View>

        {/* Destaque de economia */}
        {annualPack && monthlyPack && (
          <Animatable.View 
            style={styles.savingsContainer}
            animation="flash"
            iterationCount={5}
            delay={1000}
          >
            <Text style={styles.savingsText}>Economize {getDiscount()}% com o plano anual!</Text>
          </Animatable.View>
        )}

        {/* Lista de Planos */}
        <View style={styles.plansContainer}>
          {sortedPackages.map((pack) => (
            <TouchableOpacity
              key={pack.identifier}
              style={[
                styles.planOption,
                selectedPackage?.identifier === pack.identifier
                  ? styles.selectedPlan
                  : {}
              ]}
              onPress={() => handleSelectPackage(pack)}
            >
              <View style={styles.planContent}>
                <View style={styles.planInfo}>
                <Text
                    style={[
                      styles.planTitle,
                      selectedPackage?.identifier === pack.identifier ? styles.selectedText : {}
                    ]}
                  >
                    {pack.packageType === "ANNUAL" ? "MyBrainly anual" : "MyBrainly mensal"}
                  </Text>
                  <Text
                    style={[
                      styles.planPrice,
                      selectedPackage?.identifier === pack.identifier ? styles.selectedText : {}
                    ]}
                  >
                    {pack.product.priceString}
                    {pack.packageType === "ANNUAL" ? " /ano" : " /mês"}
                  </Text>
                </View>

                {pack.packageType === "ANNUAL" && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>POPULAR</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botão de compra */}
        <TouchableOpacity 
          style={styles.purchaseButton}
          onPress={handlePurchase}
          disabled={loading}
        >
          <Text style={styles.purchaseButtonText}>
            {loading ? "Processando..." : "Assinar Agora"}
          </Text>
        </TouchableOpacity>

        {/* Termos */}
        <View style={styles.viewLink}>
           <Text style={styles.termsText}>
             Ao utilizar este app, você concorda com os{' '}
             <Text
                style={styles.linkText}
                onPress={() => openLink('https://tiny-platform-864674.framer.app/terms-of-use')}
              >
                Termos de Uso da Apple
              </Text>{' '}
              e nossa{' '}
              <Text
                style={styles.linkText}
                onPress={() => openLink('https://tiny-platform-864674.framer.app/privacy-policy')}
              >
                Política de Privacidade
              </Text>.
           </Text>
         </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 80 : 80,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
  },
  persuasiveText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 25,
    marginBottom: 20,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 100,
    backgroundColor: '#FCE8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
  },
  benefitTitleIcon: {
    fontSize: 16,
  },
  benefitDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  socialProofContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 15,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialProofText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 12,
  },
  carouselContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  carouselText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
  },
  carouselTextIcon: {
    fontSize: 24,
  },
  carouselWrapper: {
    height: 120,
    overflow: 'hidden',
    marginBottom: 20,
  },
  carouselInnerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  carouselItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff60',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 14,
    width: width * 0.3,
    height: 100,
  },
  savingsContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 15,
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CB48DF',
  },
  savingsText: {
    color: '#CB48DF',
    fontSize: 18,
    fontWeight: '600',
  },
  plansContainer: {
    marginBottom: 25,
    paddingHorizontal: 15,
  },
  planOption: {
    backgroundColor: '#ffffff20',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
    // elevation: 2,
  },
  selectedPlan: {
    borderColor: '#CB48DF',
    backgroundColor: '#ffffff80',
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#444',
  },
  selectedText: {
    color: '#CB48DF',
  },
  popularBadge: {
    backgroundColor: '#CB48DF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  purchaseButton: {
    backgroundColor: '#212121',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 25,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  viewLink: {
    marginVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  termsText: {
    fontSize: 12,
    color: '#dddd',
    textAlign: 'center',
    lineHeight: 18,
    paddingBottom: 100,
  },
  linkText: {
    color: '#fff',
    // textDecorationLine: 'underline',
    fontWeight: '600',
    fontSize: 12,
  },
});