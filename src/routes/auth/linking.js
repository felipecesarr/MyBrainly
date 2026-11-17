// linking.js
import { Linking } from 'react-native';

export const linking = {
  // prefixos que o app reconhece
  prefixes: ['brainly://'], 
  // config vazio (não vamos usar "screens")
  config: {},

  // Maneira de obter URL inicial (caso o app tenha sido aberto via deep link)
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    return url;
  },
  // Para escutar eventos de link quando o app já está aberto
  subscribe(listener) {
    const callback = ({ url }) => {
      listener(url);
    };

    const subscription = Linking.addEventListener('url', callback);

    return () => {
      subscription.remove();
    };
  },
};
