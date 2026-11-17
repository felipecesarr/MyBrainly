import React, { useState } from "react";
import { View, Text, SafeAreaView, Image, TouchableOpacity, FlatList, Dimensions, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    title: "Bem-vindo ao MyBrainly!",
    text: "Acompanhe sua jornada de aprendizado de idiomas com flashcards personalizados e torne-se fluente de maneira mais rápida e eficaz.",
    image: require("../../../assets/brain-deck-one.png"),
  },
  {
    key: "2",
    title: "Crie seu próprio vocabulário",
    text: "Adicione palavras e frases que você encontra no seu dia a dia, como assistindo suas séries favoritas ou durante uma viagem. Transforme seu aprendizado em algo pessoal e dinâmico.",
    image: require("../../../assets/brain-deck-2.png"),
  },
  {
    key: "3",
    title: "Método de Repetição Espaçada",
    text: "Utilizamos a repetição espaçada e o método Golden List com intervalos otimizados para garantir uma memorização mais profunda e duradoura.",
    image: require("../../../assets/brain-deck-3.png"),
  },
  {
    key: "4",
    title: "Multi-idiomas",
    text: "Aprenda até 17 idiomas! Organize seus estudos em até 17 idiomas diferentes com perfis separados. Aprenda inglês, espanhol, alemão e muitos outros, sem misturar os conteúdos.",
    image: require("../../../assets/brain-deck-4.png"),
  },
  {
    key: "5",
    title: "Pronto para transformar seu aprendizado?",
    text: "Comece agora mesmo a criar seus flashcards e veja a diferença no seu domínio do idioma.",
    image: require("../../../assets/brain-deck-5.png"),
  },
];

export default function Onboarding() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        style={styles.list}
      />
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
      {currentIndex === slides.length - 1 &&  <TouchableOpacity
        style={styles.button}
        onPress={() =>
          currentIndex === slides.length - 1
            ? navigation.navigate("SignUp")
            : setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1))
        }
      >
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 && "Vamos lá!" }
        </Text>
      </TouchableOpacity> 
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  list: {
    flex: 1,
  },
  slide: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  image:{
    resizeMode: 'contain',
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#989898",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: "#F194FF",
  },
  button: {
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: "flex-end",
    marginBottom: 20,
  },
  buttonText: {
    color: "#212121",
    fontSize: 18,
    fontWeight: "600",
  },
});