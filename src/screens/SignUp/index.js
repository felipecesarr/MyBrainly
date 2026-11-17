import React, { useContext, useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  TouchableWithoutFeedback, 
  Keyboard,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  ScrollView,
  Linking,
} from "react-native";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../contexts/AuthContext";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

export default function SignUp(){
  const { signUp, checkUsernameAvailability: checkUsername, usernameValidationState } = useContext(AuthContext);
  const navigation = useNavigation();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [userNameError, setUserNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-3 (weak to strong)
  
  // Username validation states
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  
  const logoScale = useRef(new Animated.Value(1)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  
  // Input refs for navigation between fields
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

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

  // O useEffect para verificação de username agora usa a função do contexto
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Skip validation for empty username
    if (!userName || userName.trim() === "") {
      return;
    }
    
    // Validate username format locally
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    const isValidFormat = usernameRegex.test(userName) && !userName.includes(" ");
    const isLongEnough = userName.length >= 3;
    
    // Se o formato for inválido, atualize o estado de erro
    if (!isValidFormat) {
      setUserNameError("Use apenas letras, números, pontos e underscores");
      return;
    } else if (!isLongEnough) {
      setUserNameError("Nome de usuário deve ter pelo menos 3 caracteres");
      return;
    } else {
      setUserNameError("");
    }
    
    // Set debounce to check username availability after 500ms
    const timeout = setTimeout(() => {
      checkUsername(userName);  // Use a função do AuthContext
    }, 500);
    
    setDebounceTimeout(timeout);
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [userName]);

  // Animate elements on mount
  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1.1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Validate and update password strength when password changes
  useEffect(() => {
    if (password) {
      let strength = 0;
      
      // Check length
      if (password.length >= 8) strength += 1;
      
      // Check complexity (has numbers, special chars, etc.)
      if (/\d/.test(password)) strength += 1;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
      
      setPasswordStrength(strength);
      
      // Set/clear password error
      if (password.length < 6) {
        setPasswordError("A senha deve ter pelo menos 6 caracteres");
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordStrength(0);
      setPasswordError("");
    }
  }, [password]);
  
  const validateForm = () => {
    let isValid = true;
    
    // Validate username
    if (!userName.trim()) {
      setUserNameError("Nome de usuário é obrigatório");
      isValid = false;
    } else if (userName.length < 3) {
      setUserNameError("Nome de usuário deve ter pelo menos 3 caracteres");
      isValid = false;
    } else if (!usernameValidationState.isValid) {
      setUserNameError("Nome de usuário inválido");
      isValid = false;
    } else if (!usernameValidationState.isAvailable) {
      setUserNameError("Nome de usuário indisponível");
      isValid = false;
    } else {
      setUserNameError("");
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email é obrigatório");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Digite um email válido");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    // Validate password
    if (!password) {
      setPasswordError("Senha é obrigatória");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      setConfirmPasswordError("As senhas não coincidem");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }
    
    return isValid;
  };

  async function handleSignUp(){
    Keyboard.dismiss();

        // Verificação adicional de username
      if (userName && (!usernameValidationState.isValid || !usernameValidationState.isAvailable)) {
        Alert.alert(
          "Nome de usuário inválido",
          usernameValidationState.message || "Por favor, escolha outro nome de usuário."
        );
        return;
      }
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      await signUp(userName, email, password);
      
      // Clear form
      setUserName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
      Alert.alert(
        "Conta criada com sucesso!",
        "Seja bem-vindo ao Brainly! Você já pode começar a usar o app.",
        [{ text: "OK" }]
      );
    } catch (error) {
      let errorMessage = "Falha ao criar conta. Tente novamente.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este email já está em uso por outra conta.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Email inválido.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Senha muito fraca.";
      }
      
      Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Get color based on password strength
  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return "#e57373"; // weak - light red
      case 1: return "#ffb74d"; // medium - light orange
      case 2: return "#81c784"; // good - light green
      case 3: return "#4caf50"; // strong - green
      default: return "#e0e0e0";
    }
  };
  
  // Get label based on password strength
  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 0: return "Fraca";
      case 1: return "Média";
      case 2: return "Boa";
      case 3: return "Forte";
      default: return "";
    }
  };

  const renderUsernameStatusIcon = () => {
    if (!userName || userName.trim() === "") return null;
    
    if (usernameValidationState.isChecking) {  // Use estado do contexto
      return <ActivityIndicator size="small" color="#FFB900" style={newStyles.statusIcon} />;
    }
    
    if (usernameValidationState.isValid && usernameValidationState.isAvailable) {  // Use estado do contexto
      return <Ionicons name="checkmark-circle" size={22} color="#4CAF50" style={newStyles.statusIcon} />;
    }
    
    return <Ionicons name="close-circle" size={22} color="#FF3B30" style={newStyles.statusIcon} />;
  };

  // Get username input border color - atualizado para usar valores do contexto
  const getUsernameInputStyle = () => {
    if (userNameError) return newStyles.inputError;
    if (!userName || userName.trim() === "") return {};
    if (usernameValidationState.isChecking) return newStyles.inputChecking;  // Use estado do contexto
    if (usernameValidationState.isValid && usernameValidationState.isAvailable) return newStyles.inputSuccess;  // Use estado do contexto
    if (!usernameValidationState.isValid || !usernameValidationState.isAvailable) return newStyles.inputError;  // Use estado do contexto
    return {};
  };

  // Get username message style - atualizado para usar valores do contexto
  const getUsernameMessageStyle = () => {
    if (!userName || userName.trim() === "") return {};
    if (usernameValidationState.isChecking) return newStyles.messageChecking;  // Use estado do contexto
    if (usernameValidationState.isValid && usernameValidationState.isAvailable) return newStyles.messageSuccess;  // Use estado do contexto
    return newStyles.errorText;
  };

  return(
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#FFFFFF' }} 
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView style={newStyles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" />
          
          {/* Logo and Header */}
          <Animated.View style={[newStyles.logoContainer, { transform: [{ scale: logoScale }] }]}>
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
          </Animated.View>
          
          <Animatable.Text 
            animation="fadeInUp"
            duration={800}
            delay={200}
            style={newStyles.heading}
          >
            Crie sua conta
          </Animatable.Text>
          
          <Animated.View style={[newStyles.formContainer, { opacity: formOpacity }]}>
            {/* Username Input - MODIFIED WITH VALIDATION */}
            <View style={newStyles.inputGroup}>
              <View style={newStyles.inputIconContainer}>
                <FontAwesome5 name="user-alt" size={18} color="#CB48DF" />
              </View>
              <View style={newStyles.inputWrapper}>
                <Text style={newStyles.inputLabel}>Nome de usuário</Text>
                <View style={[
                  newStyles.usernameContainer,
                  getUsernameInputStyle()
                ]}>
                  <TextInput 
                    placeholder="Ex: eubrainly"
                    style={newStyles.usernameInput}
                    value={userName}
                    onChangeText={(text) => {
                      // Replace spaces with underscores automatically
                      setUserName(text.replace(/\s+/g, '_'));
                    }}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current.focus()}
                    blurOnSubmit={false}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {renderUsernameStatusIcon()}
                </View>
                
                {userName && usernameValidationState.message ? (
                    <Text style={getUsernameMessageStyle()}>{usernameValidationState.message}</Text>
                  ) : userNameError ? (
                    <Text style={newStyles.errorText}>{userNameError}</Text>
                  ) : null}
              </View>
            </View>
            
            {/* Email Input */}
            <View style={newStyles.inputGroup}>
              <View style={newStyles.inputIconContainer}>
                <FontAwesome5 name="envelope" size={18} color="#CB48DF" />
              </View>
              <View style={newStyles.inputWrapper}>
                <Text style={newStyles.inputLabel}>Email</Text>
                <TextInput 
                  ref={emailRef}
                  placeholder="Ex: eubrainly@brainly.com"
                  style={[
                    newStyles.input,
                    emailError ? newStyles.inputError : null
                  ]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => setEmail(text)}
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
                    onChangeText={(text) => setPassword(text)}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordRef.current.focus()}
                    blurOnSubmit={false}
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
                
                {password ? (
                  <View style={newStyles.passwordStrengthContainer}>
                    <View style={newStyles.strengthBarsContainer}>
                      {[...Array(3)].map((_, index) => (
                        <View 
                          key={index}
                          style={[
                            newStyles.strengthBar,
                            { 
                              backgroundColor: 
                                index < passwordStrength 
                                  ? getPasswordStrengthColor()
                                  : '#E0E0E0'
                            }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[
                      newStyles.strengthLabel,
                      { color: getPasswordStrengthColor() }
                    ]}>
                      {getPasswordStrengthLabel()}
                    </Text>
                  </View>
                ) : null}
                
                {passwordError ? (
                  <Text style={newStyles.errorText}>{passwordError}</Text>
                ) : null}
              </View>
            </View>
            
            {/* Confirm Password Input */}
            <View style={newStyles.inputGroup}>
              <View style={newStyles.inputIconContainer}>
                <FontAwesome5 name="shield-alt" size={18} color="#CB48DF" />
              </View>
              <View style={newStyles.inputWrapper}>
                <Text style={newStyles.inputLabel}>Confirmar Senha</Text>
                <View style={[
                  newStyles.passwordContainer,
                  confirmPasswordError ? newStyles.inputError : null
                ]}>
                  <TextInput 
                    ref={confirmPasswordRef}
                    placeholder="Confirme sua senha"
                    style={newStyles.passwordInput}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(text) => setConfirmPassword(text)}
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={newStyles.eyeIcon}
                  >
                    <FontAwesome5 
                      name={showConfirmPassword ? "eye-slash" : "eye"} 
                      size={18} 
                      color="#999999" 
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Text style={newStyles.errorText}>{confirmPasswordError}</Text>
                ) : null}
              </View>
            </View>
            
            {/* Sign Up Button */}
            <TouchableOpacity 
              style={newStyles.signUpButton}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#CB48DF', '#ef238f']}
                style={newStyles.signUpGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={newStyles.signUpText}>Criar Conta</Text>
                    <FontAwesome5 name="arrow-right" size={16} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Sign In Link */}
            <TouchableOpacity 
              style={newStyles.signInLinkContainer}
              onPress={() => navigation.navigate('SignIn')}
              disabled={isLoading}
            >
              <Text style={newStyles.signInText}>Já possui uma conta?</Text>
              <Text style={newStyles.signInLinkText}>Entrar</Text>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Privacy Policy Text */}
          <Text style={newStyles.privacyText}>
            Ao criar uma conta, você concorda com nossos{' '}
            <Text style={newStyles.privacyLink} onPress={() => openLink('https://tiny-platform-864674.framer.app/terms-of-use')}>Termos de Uso</Text> e{' '}
            <Text style={newStyles.privacyLink} onPress={() => openLink('https://tiny-platform-864674.framer.app/privacy-policy')}>Política de Privacidade</Text>
          </Text>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}

const newStyles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 24,
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
  // Username input specific styles
  usernameContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
  },
  usernameInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  statusIcon: {
    marginRight: 12,
  },
  inputSuccess: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  inputChecking: {
    borderColor: '#FFB900',
    backgroundColor: '#FFFBF2',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  messageSuccess: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 4,
  },
  messageChecking: {
    color: '#FFB900',
    fontSize: 12,
    marginTop: 4,
  },
  // Password styles
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
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  strengthBarsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    height: 4,
    width: 50,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  signUpButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  signUpText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signInLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingVertical: 8,
  },
  signInText: {
    fontSize: 14,
    color: '#666666',
  },
  signInLinkText: {
    fontSize: 14,
    color: '#CB48DF',
    fontWeight: '600',
    marginLeft: 4,
  },
  privacyText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  privacyLink: {
    color: '#CB48DF',
    fontWeight: '500',
  },
};