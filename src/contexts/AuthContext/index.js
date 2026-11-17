import React, { createContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import { auth, db } from "../../db/config";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  deleteUser 
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RunMigrations } from "../../utils/migrations/migrationsGame";

export const AuthContext = createContext({});

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usernameValidationState, setUsernameValidationState] = useState({
    isChecking: false,
    isValid: null,
    isAvailable: null,
    message: ""
  });

  useEffect(() => {
    async function loadStorage() {
      const storageUser = await AsyncStorage.getItem('@brainlyUser');
      if (storageUser) {
        setUser(JSON.parse(storageUser));
      }
      setLoading(false);
    }
    loadStorage();
  }, []);

   // Função para verificar a disponibilidade do username
   async function checkUsernameAvailability(username) {
    if (!username || username.trim() === "") return false;
    
    try {
      setUsernameValidationState(prev => ({ ...prev, isChecking: true }));
      
      // Verificar formato
      const regex = /^[a-zA-Z0-9._]+$/;  // Permite letras, números, pontos e underscores
      const isFormatValid = regex.test(username) && !username.includes(" ");
      
      if (!isFormatValid) {
        setUsernameValidationState({
          isChecking: false,
          isValid: false,
          isAvailable: null,
          message: "Use apenas letras, números, pontos e underscores"
        });
        return false;
      }
      
      // Verificar se já existe
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("usernameLower", "==", username.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      const isAvailable = querySnapshot.empty;
      
      setUsernameValidationState({
        isChecking: false,
        isValid: true,
        isAvailable: isAvailable,
        message: isAvailable ? "Username disponível" : "Username já está em uso"
      });
      
      return isAvailable;
    } catch (error) {
      void 0;
      setUsernameValidationState({
        isChecking: false,
        isValid: null,
        isAvailable: null,
        message: "Erro ao verificar disponibilidade"
      });
      return false;
    }
  }

  async function signUp(userName, email, password) {
    try {

      // Validar formato do username
      const regex = /^[a-zA-Z0-9._]+$/;
      if (!regex.test(userName) || userName.includes(" ")) {
        Alert.alert(
          "Nome de usuário inválido", 
          "O nome de usuário deve conter apenas letras, números, pontos e underscores (sem espaços ou caracteres especiais)."
        );
        return;
      }
      
      // Verificar disponibilidade do username
      const isAvailable = await checkUsernameAvailability(userName);
      if (!isAvailable) {
        Alert.alert(
          "Nome de usuário indisponível", 
          "Este nome de usuário já está sendo utilizado. Por favor, escolha outro."
        );
        return;
      }
      const value = await createUserWithEmailAndPassword(auth, email, password);
      const uid = value.user.uid;
      const userRef = doc(db, 'users', uid);

      // Adicionando os campos de gamificação ao criar um novo usuário
      await setDoc(userRef, {
        userName: userName,
        email: value.user.email,
        usernameLower: userName.toLowerCase(),
        createdAt: new Date(),
        // Novos campos de gamificação
        gamification: {
          level: 1,
          title: "Iniciante",
          totalCardsWithHighRetention: 0,
          cardsNeededForNextLevel: 51,
          progress: 0,
          streak: 0,
          lastStudyDate: null,
          totalStudySessions: 0,
          studyTime: 0
        }
      });

      // Enviar e-mail de verificação
      await sendEmailVerification(auth.currentUser);
      Alert.alert("Verifique seu e-mail", "Um link de verificação foi enviado para seu e-mail. Por favor, confirme antes de prosseguir.");

      let data = {
        uid: uid,
        userName: userName,
        usernameLower: userName.toLowerCase(),
        email: value.user.email,
        // Incluir dados de gamificação no objeto do usuário local
        gamification: {
          level: 1,
          title: "Iniciante",
          totalCardsWithHighRetention: 0,
          cardsNeededForNextLevel: 51,
          progress: 0,
          streak: 0
        }
      };
      setUser(data);
      storageUser(data);

    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Erro ao registrar", "Este e-mail já está em uso. Por favor, tente outro e-mail.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Erro ao registrar", "Formato de e-mail incorreto. Verifique e tente novamente.");
      } else {
        void 0;
        Alert.alert("Erro ao registrar", error.message);
      }
    }
  }

  async function signIn(email, password) {
    try {
      const value = await signInWithEmailAndPassword(auth, email, password);
      const uid = value.user.uid;
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
  
      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        let data = {
          uid: uid,
          userName: userData.userName,
          email: userData.email,
          // Se já existir gamification, use; senão, defina como objeto vazio
          gamification: userData.gamification || {}
        };
        
        setUser(data);
        storageUser(data);
        
        // Execute a migração após definir o usuário
        const migrationDone = await AsyncStorage.getItem('@gamificationMigration');
        if (migrationDone !== 'true') {
          try {
            void 0;
            await RunMigrations();
            
            // Recarregar os dados do usuário após a migração para obter os novos campos
            const updatedDoc = await getDoc(userRef);
            if (updatedDoc.exists()) {
              const updatedData = updatedDoc.data();
              setUser({
                ...data,
                gamification: updatedData.gamification || {}
              });
              storageUser({
                ...data,
                gamification: updatedData.gamification || {}
              });
            }
          } catch (migError) {
            void 0;
          }
        }   
      } else {
        void 0;
      } 
    } catch (error) {
      void 0;
      // Alertas específicos para cada código de erro
      if (error.code === "auth/wrong-password") {
        Alert.alert("Erro ao entrar", "Senha incorreta. Tente novamente.");
      } else if (error.code === "auth/user-not-found") {
        Alert.alert("Erro ao entrar", "Usuário não existe. Verifique o e-mail ou cadastre-se.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Erro ao entrar", "Formato de e-mail incorreto. Verifique e tente novamente.");
      } else {
        Alert.alert("Erro ao entrar", "Usuário não existe. Verifique o e-mail ou cadastre-se.");
      }
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Sucesso", "E-mail de redefinição de senha enviado!");
    } catch (error) {
      void 0;
      Alert.alert("Erro ao redefinir a senha", error.message);
    }
  }

  async function signOut() {
    try {
      await auth.signOut();
      await AsyncStorage.clear();
      setUser(null);
    } catch (error) {
      void 0;
    }
  }

  async function storageUser(data) {
    await AsyncStorage.setItem('@brainlyUser', JSON.stringify(data));
  }

  async function deleteAccount() {
    try {
      const userId = auth.currentUser.uid;
  
      // Deletar os dados do usuário no Firestore
      const userDocRef = doc(db, "users", userId);
      await deleteDoc(userDocRef);
  
      // Deletar a conta no Firebase Authentication
      await deleteUser(auth.currentUser);
  
      // Limpar os dados locais
      await AsyncStorage.clear();
      setUser(null);
  
      Alert.alert("Conta excluída", "Sua conta foi excluída com sucesso.");
    } catch (error) {
      void 0;
      Alert.alert("Erro", "Não foi possível excluir sua conta. Tente novamente.");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        signUp,
        signIn,
        signOut,
        loading,
        user,
        resetPassword,
        deleteAccount,
        checkUsernameAvailability,
        usernameValidationState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}