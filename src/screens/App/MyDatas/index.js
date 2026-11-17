import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  TouchableWithoutFeedback, 
  Keyboard, 
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  Animated,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../../contexts/AuthContext';
import { db } from '../../../db/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateEmail } from "firebase/auth";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';

export default function MyDatas() {
  const { user, deleteAccount, resetPassword } = useContext(AuthContext);
  const navigation = useNavigation();
  const [editON, setEditOn] = useState(false);
  const [userName, setUserName] = useState('');
  const [originalUserName, setOriginalUserName] = useState('');
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [originalEmail, setOriginalEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [savingData, setSavingData] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const avatarRotate = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  // Verifica se há alterações nos campos
  useEffect(() => {
    const changed = 
      userName !== originalUserName || 
      name !== originalName || 
      email !== originalEmail;
    setHasChanges(changed);
  }, [userName, name, email, originalUserName, originalName, originalEmail]);

  // Carregar dados do Firestore ao montar o componente
  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const fetchedUserName = userData.userName || '';
          const fetchedName = userData.name || '';
          
          setUserName(fetchedUserName);
          setOriginalUserName(fetchedUserName);
          setName(fetchedName);
          setOriginalName(fetchedName);
        }
      } catch (error) {
        void 0;
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [user?.uid]);

  // Animation effect when toggling edit mode
  useEffect(() => {
    // Card animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.4,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Avatar animation
    if (editON) {
      Animated.sequence([
        Animated.timing(avatarScale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(avatarScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      Animated.timing(avatarRotate, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(avatarRotate, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [editON]);

  // Reset password reset status after 5 seconds
  useEffect(() => {
    if (passwordResetSent) {
      const timer = setTimeout(() => {
        setPasswordResetSent(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [passwordResetSent]);

  async function handleSave() {
    try {
      setSavingData(true);
      
      if (!userName.trim() || !name.trim() || !email.trim()) {
        Alert.alert("Campos obrigatórios", "Por favor, preencha todos os campos.");
        setSavingData(false);
        return;
      }
      
      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert("E-mail inválido", "Por favor, forneça um e-mail válido.");
        setSavingData(false);
        return;
      }

      const userRef = doc(db, 'users', user.uid);

      // Atualizar nome de usuário e nome completo no Firestore
      await updateDoc(userRef, { userName, name });

      // Atualizar e-mail no Firebase Authentication, se necessário
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // Atualizar valores originais
      setOriginalUserName(userName);
      setOriginalName(name);
      setOriginalEmail(email);
      
      setSavingData(false);
      
      // Mostrar mensagem de sucesso com temporizador
      Animated.sequence([
        Animated.timing(avatarScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(avatarScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      Alert.alert("Sucesso", "Seus dados foram atualizados com sucesso!");
      setEditOn(false); // Finalizar a edição
    } catch (error) {
      setSavingData(false);
      Alert.alert("Erro ao salvar os dados", error.message);
    }
  }

  async function handlePasswordReset() {
    try {
      setLoading(true);
      await resetPassword(user.email);
      setLoading(false);
      setPasswordResetSent(true);
      Alert.alert("E-mail enviado", "Verifique sua caixa de entrada para redefinir sua senha.");
    } catch (error) {
      setLoading(false);
      Alert.alert("Erro ao redefinir a senha", error.message);
    }
  }

  async function handleDeleteAccount() {
    Alert.alert(
      "Excluir Conta",
      "Tem certeza de que deseja excluir sua conta permanentemente? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir Permanentemente",
          style: "destructive",
          onPress: async () => {
            // Segunda confirmação
            Alert.alert(
              "Confirmar Exclusão",
              "Esta ação excluirá PERMANENTEMENTE todos os seus dados, incluindo decks e flashcards. Digite 'EXCLUIR' para confirmar.",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Confirmar", 
                  style: "destructive",
                  onPress: async () => {
                    try {
                      setLoading(true);
                      await deleteAccount();
                      setLoading(false);
                      navigation.navigate("Home");
                    } catch (error) {
                      setLoading(false);
                      void 0;
                      Alert.alert("Erro", "Não foi possível excluir sua conta. Tente novamente.");
                    }
                  }
                }
              ]
            );
          },
        },
      ]
    );
  }

  // Toggle edit mode with animation
  const toggleEditMode = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Se estiver saindo do modo edição com alterações não salvas
    if (editON && hasChanges) {
      Alert.alert(
        "Alterações não salvas",
        "Deseja sair sem salvar as alterações realizadas?",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Descartar", 
            style: "destructive",
            onPress: () => {
              // Restaurar valores originais
              setUserName(originalUserName);
              setName(originalName);
              setEmail(originalEmail);
              setEditOn(false);
            }
          },
          {
            text: "Salvar",
            onPress: handleSave
          }
        ]
      );
    } else {
      setEditOn(!editON);
    }
  };

  // Interpolação para rotação do avatar
  const spin = avatarRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={newStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      
      {/* Header */}
      <View style={newStyles.header}>
        <View style={newStyles.headerRow}>
          <TouchableOpacity 
            style={newStyles.backButton}
            onPress={() => navigation.openDrawer()}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Ionicons name="chevron-back" size={24} color="#414141" />
          </TouchableOpacity>
          
          <Text style={newStyles.headerTitle}>Minha Conta</Text>
          
          <TouchableOpacity
            style={[
              newStyles.editButton, 
              editON ? newStyles.cancelButton : {}
            ]}
            onPress={toggleEditMode}
            disabled={loading || savingData}
          >
            {editON ? (
              <LinearGradient
                colors={['#ff6b6b', '#ee5253']}
                style={newStyles.editButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="close-outline" size={24} color="#fff" />
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={['#CB48DF', '#ef238f']}
                style={newStyles.editButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="edit" size={20} color="#FFFFFF" />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>

        <View style={newStyles.userAvatarContainer}>
          <Animated.View 
            style={[
              newStyles.userAvatarWrapper,
              { transform: [{ rotate: spin }, { scale: avatarScale }] }
            ]}
          >
            <LinearGradient
              colors={editON ? ['#ef238f', '#CB48DF'] : ['#CB48DF', '#ef238f']}
              style={newStyles.userAvatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={newStyles.userInitials}>
                {userName ? userName[0]?.toUpperCase() : "U"}
              </Text>
              {editON && (
                <View style={newStyles.editBadge}>
                  <MaterialIcons name="edit" size={14} color="#FFFFFF" />
                </View>
              )}
            </LinearGradient>
          </Animated.View>
          
          <Animatable.View
            animation={editON ? "pulse" : undefined}
            iterationCount={editON ? "infinite" : 1}
            duration={2000}
            style={newStyles.userAccountStatusContainer}
          >
            <LinearGradient
              colors={editON ? ['#CB48DF20', '#CB48DF40'] : ['#f0f0f0', '#e8e8e8']}
              style={newStyles.userAccountStatusGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[
                newStyles.userAccountStatus,
                editON && newStyles.userAccountStatusEdit
              ]}>
                {editON ? "Modo de edição" : "Dados pessoais"}
              </Text>
              {editON && (
                <View style={newStyles.editDot} />
              )}
            </LinearGradient>
          </Animatable.View>
        </View>
      </View>

      <ScrollView 
        style={newStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={newStyles.scrollContentContainer}
      >
        {loading ? (
          <View style={newStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#CB48DF" />
            <Text style={newStyles.loadingText}>Carregando seus dados...</Text>
          </View>
        ) : (
          <>
            <Animated.View 
              style={[
                newStyles.formContainer,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
              ]}
            >
              {/* Form Fields */}
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View>
                  <View style={newStyles.fieldContainer}>
                    <View style={newStyles.fieldIconContainer}>
                      <FontAwesome6 name="user" size={16} color="#CB48DF" />
                    </View>
                    <View style={newStyles.fieldContent}>
                      <Text style={newStyles.fieldLabel}>Nome de usuário</Text>
                      <View style={newStyles.inputWrapper}>
                        <TextInput
                          style={[
                            newStyles.fieldInput,
                            !editON && newStyles.fieldInputDisabled,
                            editON && userName !== originalUserName && newStyles.fieldInputChanged
                          ]}
                          placeholder="Digite seu nome de usuário"
                          placeholderTextColor="#999"
                          value={userName}
                          onChangeText={setUserName}
                          editable={editON}
                        />
                        {editON && userName !== originalUserName && (
                          <View style={newStyles.changedIndicator}>
                            <MaterialIcons name="edit" size={14} color="#CB48DF" />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  <View style={newStyles.fieldContainer}>
                    <View style={newStyles.fieldIconContainer}>
                      <FontAwesome6 name="address-card" size={16} color="#CB48DF" />
                    </View>
                    <View style={newStyles.fieldContent}>
                      <Text style={newStyles.fieldLabel}>Nome Completo</Text>
                      <View style={newStyles.inputWrapper}>
                        <TextInput
                          style={[
                            newStyles.fieldInput,
                            !editON && newStyles.fieldInputDisabled,
                            editON && name !== originalName && newStyles.fieldInputChanged
                          ]}
                          placeholder="Digite seu nome completo"
                          placeholderTextColor="#999"
                          value={name}
                          onChangeText={setName}
                          editable={editON}
                        />
                        {editON && name !== originalName && (
                          <View style={newStyles.changedIndicator}>
                            <MaterialIcons name="edit" size={14} color="#CB48DF" />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  <View style={newStyles.fieldContainer}>
                    <View style={newStyles.fieldIconContainer}>
                      <FontAwesome6 name="envelope" size={16} color="#CB48DF" />
                    </View>
                    <View style={newStyles.fieldContent}>
                      <Text style={newStyles.fieldLabel}>Email</Text>
                      <View style={newStyles.inputWrapper}>
                        <TextInput
                          style={[
                            newStyles.fieldInput,
                            !editON && newStyles.fieldInputDisabled,
                            editON && email !== originalEmail && newStyles.fieldInputChanged
                          ]}
                          placeholder="Digite seu email"
                          placeholderTextColor="#999"
                          value={email}
                          onChangeText={setEmail}
                          editable={editON}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                        {editON && email !== originalEmail && (
                          <View style={newStyles.changedIndicator}>
                            <MaterialIcons name="edit" size={14} color="#CB48DF" />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  {editON ? (
                    <View style={newStyles.actionsContainer}>
                      {/* Password Reset Button */}
                      <TouchableOpacity
                        style={newStyles.resetPasswordButton}
                        onPress={handlePasswordReset}
                        disabled={loading || savingData}
                      >
                        <LinearGradient
                          colors={passwordResetSent ? ['#4CAF5080', '#4CAF50'] : ['#f0f0f0', '#e0e0e0']}
                          style={newStyles.resetPasswordGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          {passwordResetSent ? (
                            <>
                              <FontAwesome6 name="check" size={16} color="#FFFFFF" />
                              <Text style={[newStyles.resetPasswordText, {color: '#FFFFFF'}]}>
                                E-mail Enviado
                              </Text>
                            </>
                          ) : (
                            <>
                              <FontAwesome6 name="lock" size={16} color="#333" />
                              <Text style={newStyles.resetPasswordText}>
                                Redefinir Senha
                              </Text>
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      {/* Save Button */}
                      <TouchableOpacity
                        style={[
                          newStyles.saveButton,
                          !hasChanges && newStyles.saveButtonDisabled
                        ]}
                        onPress={handleSave}
                        disabled={loading || savingData || !hasChanges}
                      >
                        <LinearGradient
                          colors={hasChanges ? ['#CB48DF', '#ef238f'] : ['#d0d0d0', '#c0c0c0']}
                          style={newStyles.saveButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          {savingData ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <Text style={newStyles.saveButtonText}>
                                {hasChanges ? 'Salvar Alterações' : 'Nenhuma Alteração'}
                              </Text>
                              {hasChanges && <FontAwesome6 name="check" size={16} color="#FFFFFF" />}
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={newStyles.actionsContainer}>
                      {/* Password Reset Button Outside Edit Mode */}
                      <TouchableOpacity
                        style={newStyles.resetPasswordButton}
                        onPress={handlePasswordReset}
                        disabled={loading}
                      >
                        <LinearGradient
                          colors={passwordResetSent ? ['#4CAF5080', '#4CAF50'] : ['#f0f0f0', '#e0e0e0']}
                          style={newStyles.resetPasswordGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          {passwordResetSent ? (
                            <>
                              <FontAwesome6 name="check" size={16} color="#FFFFFF" />
                              <Text style={[newStyles.resetPasswordText, {color: '#FFFFFF'}]}>
                                E-mail Enviado
                              </Text>
                            </>
                          ) : (
                            <>
                              <FontAwesome6 name="lock" size={16} color="#333" />
                              <Text style={newStyles.resetPasswordText}>
                                Redefinir Senha
                              </Text>
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      {/* Delete Account Button */}
                      <TouchableOpacity
                        style={newStyles.deleteAccountButton}
                        onPress={handleDeleteAccount}
                        disabled={loading}
                      >
                        <LinearGradient
                          colors={['#ff6b6b', '#ee5253']}
                          style={newStyles.deleteAccountGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <FontAwesome6 name="user-xmark" size={16} color="#FFFFFF" />
                          <Text style={newStyles.deleteAccountText}>Excluir Minha Conta</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
            
            <View style={newStyles.infoCard}>
              <View style={newStyles.infoCardIcon}>
                <Ionicons name="information-circle" size={24} color="#CB48DF" />
              </View>
              <View style={newStyles.infoCardContent}>
                <Text style={newStyles.infoCardTitle}>Dados pessoais</Text>
                <Text style={newStyles.infoCardText}>
                  Mantenha seus dados sempre atualizados para melhor experiência com o aplicativo.
                  {editON 
                    ? hasChanges 
                      ? " Você tem alterações não salvas."
                      : " Toque em Salvar para confirmar as alterações." 
                    : " Toque em Editar para fazer alterações."}
                </Text>
              </View>
            </View>
            
            <View style={newStyles.brainlyBranding}>
              <LinearGradient
                colors={['#CB48DF20', '#ef238f20']}
                style={newStyles.brandingGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={newStyles.brandingText}>MyBrainly</Text>
                <Text style={newStyles.brandingVersion}>v1.0.27</Text>
              </LinearGradient>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const newStyles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 50 : 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  editButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  userAvatarContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  userAvatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#CB48DF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 12,
  },
  userAvatarGradient: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  userInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#CB48DF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userAccountStatusContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  userAccountStatusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  userAccountStatus: {
    fontSize: 14,
    color: '#666666',
  },
  userAccountStatusEdit: {
    color: '#CB48DF',
    fontWeight: '600',
  },
  editDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CB48DF',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  fieldContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  fieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(203, 72, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#CB48DF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
  },
  fieldInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  fieldInputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#666666',
    borderColor: '#E0E0E0',
  },
  fieldInputChanged: {
    borderColor: '#CB48DF80',
    backgroundColor: '#FBF7FF',
  },
  changedIndicator: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(203, 72, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    marginTop: 20,
  },
  saveButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetPasswordButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resetPasswordGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  resetPasswordText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteAccountButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteAccountGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  deleteAccountText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'rgba(203, 72, 223, 0.05)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(203, 72, 223, 0.1)',
  },
  infoCardIcon: {
    marginRight: 12,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  brainlyBranding: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  brandingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CB48DF',
  },
  brandingVersion: {
    fontSize: 12,
    color: '#CB48DF',
    marginLeft: 6,
  }
};