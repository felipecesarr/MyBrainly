// AuthRoute.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext'; 
import Drawer from '../drawer';
import MyStack from '../stacks'; 
import { Linking } from 'react-native';// ou import { Linking } from 'react-native'
import { navigationRef } from './navigationRef';

export default function AuthRoute() {
  const { signed, loading } = useContext(AuthContext);

  // Se quisermos armazenar deckId enquanto a pessoa não está logada
  const [pendingDeckId, setPendingDeckId] = useState(null);

  useEffect(() => {
    // Assim que montar, busca URL inicial (se o app foi aberto por link)
    handleInitialUrl();

    // Depois escuta links quando o app está em uso
    const subscription = Linking.addEventListener('url', ({ url }) => {
      parseDeepLink(url);
    });

    return () => {
      subscription.remove?.();
    };
  }, []);

  async function handleInitialUrl() {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      parseDeepLink(initialUrl);
    }
  }

  function parseDeepLink(url) {
    // Exemplo: "brainly://deck/abc123"
    const prefix = 'brainly://deck/';
    if (url.startsWith(prefix)) {
      const deckId = url.replace(prefix, '');
      // Se está logado, já navega
      if (signed) {
        navigationRef.current?.navigate('Início', {
          screen: 'Explorer',
          params: { deckId },
        });
      } else {
        // Se não logado, salva e chamaremos dps
        setPendingDeckId(deckId);
      }
    }
  }

  useEffect(() => {
    // Se o user logar e tinha deck pendente, navega
    if (signed && pendingDeckId) {
      navigationRef.current?.navigate('Início', {
        screen: 'Explorer',
        params: { deckId: pendingDeckId },
      });
      setPendingDeckId(null);
    }
  }, [signed, pendingDeckId]);

  if (loading) {
    return (
      <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
        <ActivityIndicator size="large" color="#cb48df" />
      </View>
    );
  }

  if (!signed) {
    // se não logado => MyStack
    return <MyStack />;
  }

  // se logado => Drawer
  return <Drawer />;
}
