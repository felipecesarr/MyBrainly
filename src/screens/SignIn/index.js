import React, { useState, useContext, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  TouchableWithoutFeedback, 
  Keyboard, 
  Alert,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  Linking
} from "react-native";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../contexts/AuthContext";
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const { height } = Dimensions.get('window');

export default function SignIn(){
  const { signIn, resetPassword } = useContext(AuthContext);
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
  
  // Animation values
  const logoScale = useRef(new Animated.Value(1)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  
  // Input refs
  const passwordRef = useRef(null);
  
  // Start animations on mount
  useEffect(() => {
    // Animate logo
    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1.15,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate form
    Animated.parallel([
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate form fields
  const validateForm = () => {
    let isValid = true;
    
    if (!email.trim()) {
      setEmailError("Email é obrigatório");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Formato de email inválido");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    if (!password.trim()) {
      setPasswordError("Senha é obrigatória");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    return isValid;
  };

  async function handleSignIn(){
    Keyboard.dismiss();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      void 0;
      
      let errorMessage = "Erro ao fazer login. Verifique suas credenciais e tente novamente.";
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = "Email inválido.";
        setEmailError(errorMessage);
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "Usuário não encontrado.";
        setEmailError(errorMessage);
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Senha incorreta.";
        setPasswordError(errorMessage);
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
      }
      
      Alert.alert("Não foi possível entrar", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReset(){
    if (!email.trim()) {
      setEmailError("Digite seu email para redefinir a senha");
      return;
    } else if (!validateEmail(email)) {
      setEmailError("Digite um email válido");
      return;
    } else {
      setEmailError("");
    }

    try {
      setIsLoading(true);
      await resetPassword(email);
      Alert.alert(
        "Email enviado", 
        "Enviamos um link para redefinir sua senha no email informado."
      );
    } catch (error) {
      void 0;
      Alert.alert("Erro", "Não foi possível enviar o email de redefinição. Verifique o endereço e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return(
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={newStyles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        
        {/* Logo and Header */}
        <Animated.View 
          style={[
            newStyles.logoContainer, 
            { transform: [{ scale: logoScale }] }
          ]}
        >
          <LinearGradient
            colors={['#f5b1ff', '#FFFFFF']}
            style={newStyles.logoBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image 
              source={require("../../../assets/adaptive-icon.png")}
              style={newStyles.logo}
            />
          </LinearGradient>
          <Animatable.View animation="fadeIn" duration={1000} delay={300}>
            <Text style={newStyles.appName}>MyBrainly</Text>
          </Animatable.View>
        </Animated.View>
        
        <Animatable.View 
          animation="fadeIn" 
          duration={800} 
          delay={200}
          style={newStyles.welcomeContainer}
        >
          <Text style={newStyles.welcomeText}>Bem-vindo de volta!</Text>
          <Text style={newStyles.welcomeSubtext}>
            Entre para continuar seus estudos
          </Text>
        </Animatable.View>
        
        <Animated.View 
          style={[
            newStyles.formContainer,
            { 
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }]
            }
          ]}
        >
          {/* Email Input */}
          <View style={newStyles.inputGroup}>
            <View style={newStyles.inputIconContainer}>
              <FontAwesome5 name="envelope" size={18} color="#CB48DF" />
            </View>
            <View style={newStyles.inputWrapper}>
              <Text style={newStyles.inputLabel}>Email</Text>
              <TextInput 
                placeholder="Ex: seuemail@exemplo.com"
                style={[
                  newStyles.input,
                  emailError ? newStyles.inputError : null
                ]}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                }}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()}
                blurOnSubmit={false}
              />
              {emailError ? (
                <Text style={newStyles.errorText}>{emailError}</Text>
              ) : null}
            </View>
          </View>
          
          {/* Password Input */}
          <View style={newStyles.inputGroup}>
            <View style={newStyles.inputIconContainer}>
              <FontAwesome5 name="lock" size={18} color="#CB48DF" />
            </View>
            <View style={newStyles.inputWrapper}>
              <Text style={newStyles.inputLabel}>Senha</Text>
              <View style={[
                newStyles.passwordContainer,
                passwordError ? newStyles.inputError : null
              ]}>
                <TextInput 
                  ref={passwordRef}
                  placeholder="Digite sua senha"
                  style={newStyles.passwordInput}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={newStyles.eyeIcon}
                >
                  <FontAwesome5 
                    name={showPassword ? "eye-slash" : "eye"} 
                    size={18} 
                    color="#999999" 
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={newStyles.errorText}>{passwordError}</Text>
              ) : null}
            </View>
          </View>
          
          {/* Forgot Password Button */}
          <TouchableOpacity 
            style={newStyles.forgotPasswordButton} 
            onPress={handleReset}
            disabled={isLoading}
          >
            <Text style={newStyles.forgotPasswordText}>
              Esqueceu sua senha?
            </Text>
          </TouchableOpacity>
          
          {/* Login Button */}
          <TouchableOpacity 
            style={newStyles.loginButton}
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#CB48DF', '#ef238f']}
              style={newStyles.loginGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={newStyles.loginText}>Entrar</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Register Link */}
          <TouchableOpacity 
            style={newStyles.registerContainer}
            onPress={() => navigation.navigate('SignUp')}
            disabled={isLoading}
          >
            <Text style={newStyles.registerText}>Não possui uma conta?</Text>
            <Text style={newStyles.registerLinkText}>Cadastrar</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Privacy policy note */}
        <Text style={newStyles.privacyText}>
          Ao entrar, você concorda com nossos{' '}
          <Text style={newStyles.privacyLink} onPress={() => openLink('https://tiny-platform-864674.framer.app/terms-of-use')}>Termos de Uso</Text> e{' '}
          <Text style={newStyles.privacyLink} onPress={() => openLink('https://tiny-platform-864674.framer.app/privacy-policy')}>Política de Privacidade</Text>
        </Text>
      </SafeAreaView>
    </TouchableWithoutFeedback> 
  );
}

const newStyles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginTop: 10,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  formContainer: {
    width: '90%',
    marginBottom: 24,
  },
  inputGroup: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(203, 72, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    alignSelf: 'flex-start',
    marginTop: 24, // Align with input field
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  inputError: {
    borderColor: '#e57373',
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#e57373',
    fontSize: 12,
    marginTop: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#CB48DF',
    fontWeight: '500',
    fontSize: 14,
  },
  loginButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  registerText: {
    fontSize: 14,
    color: '#666666',
  },
  registerLinkText: {
    fontSize: 14,
    color: '#CB48DF',
    fontWeight: '600',
    marginLeft: 4,
  },
  privacyText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  privacyLink: {
    color: '#CB48DF',
    fontWeight: '500',
  }
};