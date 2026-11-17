import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(33, 33, 33, 0.4)",
    justifyContent: "flex-end",
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: "80%",
  },
  viewHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    marginVertical: 20,
  },
  buttonAction: {
    backgroundColor: '#F9E2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backText: {
    color: '#CB48DF',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 24,
  },
  viewDoc: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  textDocTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#212121',
  },
  textDoc: {
    fontSize: 16,
    fontWeight: '400',
    color: '#747474',
    marginTop: 8,
  },
  viewVocab: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  viewVocabNumber: {
    backgroundColor: '#F9E2FD',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textVocabNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CB48DF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#CB48DF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    margin: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hiddenRow: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  deleteButton: {
    backgroundColor: '#F9E2FD',
    padding: 10,
    borderRadius: 8,
    
  },

// Container geral de estatísticas com visual mais moderno
statsContainer: {
  backgroundColor: 'transparent',
  borderRadius: 16,
  padding: 0,
  marginTop: 16,
  marginBottom: 16,
},

// Header das estatísticas
statsTitleContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
},

statsTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#333',
},

// Linha de estatísticas
statsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 16,
},

// Cartão de estatística individual com visual pastel
statCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  padding: 16,
  width: '48%',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
},

// Cabeçalho do cartão
statHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
  gap: 4,
},

// Valor da estatística com visual mais destacado
statValue: {
  fontSize: 28,
  fontWeight: '700',
  textAlign: 'center',
},

// Label da estatística
statLabel: {
  fontSize: 12,
  color: '#666',
  flex: 1,
},

// Container da barra de progresso
progressContainer: {
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
},

// Cabeçalho da barra de progresso
progressHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 12,
},

progressLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
},

// Novo container externo para a barra de progresso
progressBarOuterContainer: {
  marginBottom: 8,
},

// Container da barra de progresso refinado
progressBarContainer: {
  height: 12,
  backgroundColor: '#F0F0F0',
  borderRadius: 10,
  overflow: 'hidden',
},

// Barra de progresso com visual mais suave
progressBar: {
  height: '100%',
  borderRadius: 10,
},

// Novos marcos na barra de progresso
progressMilestones: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 4,
  marginTop: 4,
},

milestone: {
  alignItems: 'center',
},

milestoneMarker: {
  width: 6,
  height: 6,
  borderRadius: 3,
  marginBottom: 2,
},

milestoneLabel: {
  fontSize: 10,
  color: '#999',
},

// Footer da barra de progresso
progressFooter: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 12,
},

progressPercentage: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
},

// Botão de refresh pequeno com visual mais moderno
refreshButtonMini: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(203, 72, 223, 0.1)',
  paddingVertical: 5,
  paddingHorizontal: 10,
  borderRadius: 12,
},

refreshButtonTextMini: {
  color: '#CB48DF',
  fontSize: 12,
  fontWeight: '600',
  marginLeft: 4,
},

// Novos estilos para o tooltip centralizado
centeredTooltipOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},

centeredTooltipContainer: {
  width: '85%',
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  padding: 24,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 10,
},

tooltipIconContainer: {
  width: 70,
  height: 70,
  borderRadius: 35,
  backgroundColor: 'rgba(203, 72, 223, 0.15)',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 16,
},

centeredTooltipTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 12,
  textAlign: 'center',
},

centeredTooltipDescription: {
  fontSize: 16,
  color: '#666',
  textAlign: 'center',
  lineHeight: 22,
  marginBottom: 20,
},

centeredTooltipButton: {
  backgroundColor: '#CB48DF',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 50,
  alignSelf: 'stretch',
  alignItems: 'center',
},

centeredTooltipButtonText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 16,
},
// Novos estilos para a badge de tema

viewThemeContainer: {
  flexDirection: 'row',
  alignItems: 'center', 
  justifyContent: 'space-between',
  marginTop: 16,
},

themeBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 20,
  gap: 8,
},

iconCircle: {
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
},

themeBadgeText: {
  fontSize: 14,
  fontWeight: '600',
},

viewVocabNumber: {
  flexDirection: 'row',
  alignItems: 'baseline',
},

textVocabNumber: {
  fontSize: 20,
  fontWeight: '700',
},

textVocabLabel: {
  fontSize: 12,
  color: '#666',
  marginLeft: 4,
}
});
