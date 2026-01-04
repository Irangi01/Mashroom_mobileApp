import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Surface, Text, Button, ProgressBar, Switch, Chip, Divider, ActivityIndicator, useTheme, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { MLModelInfo } from '../types';
import { subscribeMLModelInfo, updateMLModelStatus } from '../services/firebaseService';

export const MLModelScreen = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [modelInfo, setModelInfo] = useState<MLModelInfo | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeMLModelInfo((data) => {
      if (data) {
        setModelInfo(data);
      }
      setLoading(false);
    });
    
    const timeout = setTimeout(() => setLoading(false), 3000);
    
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleStatusToggle = async () => {
    if (modelInfo) {
      const newStatus = modelInfo.status === 'active' ? 'inactive' : 'active';
      await updateMLModelStatus(newStatus);
    }
  };
//colours for staus chips
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'inactive': return '#9e9e9e';
      case 'training': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  //loading state

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" animating={true} color={theme.colors.secondary} />
        <Text style={{ marginTop: 16, color: theme.colors.onBackground }}>{t('loadingModelData')}</Text>
      </View>
    );
  }

  if (!modelInfo) {
    return (
      <View style={[styles.container, styles.centered, { padding: 32 }]}>
        <MaterialIcons name="smart-toy" size={60} color={theme.colors.onSurfaceDisabled} />
        <Text variant="titleLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>{t('noModelData')}</Text>
        <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          {t('initializeHint')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <MaterialIcons name="smart-toy" size={40} color={theme.colors.secondary} />
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground, marginLeft: 16 }}>
          {t('mlModelInfo')}
        </Text>
      </View>

      {/* Model Overview new add */}
      <Surface style={styles.card} elevation={2}>
        <View style={styles.cardHeader}>
          <View>
            <Text variant="titleLarge" style={{ fontWeight: '600' }}>{modelInfo.name}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('version')} {modelInfo.version}</Text>
          </View>
          <Chip
            textStyle={{ color: getStatusColor(modelInfo.status), fontWeight: 'bold' }}
            style={{ backgroundColor: `${getStatusColor(modelInfo.status)}20` }}
          >
            {modelInfo.status.toUpperCase()}
          </Chip>
        </View>

        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
          {modelInfo.description}
        </Text>

        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
          {t('modelAccuracy')}
        </Text>
        <View style={styles.progressRow}>
          <ProgressBar progress={modelInfo.accuracy / 100} color="#4caf50" style={styles.progressBar} />
          <Text variant="titleMedium" style={{ color: '#4caf50', fontWeight: 'bold', marginLeft: 12, minWidth: 50 }}>
            {modelInfo.accuracy}%
          </Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="access-time" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
            {t('lastTrained')}: {new Date(modelInfo.lastTrainedDate).toLocaleDateString()}
          </Text>
        </View>

        <Divider style={{ marginVertical: 16 }} />

        <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
          {t('inputFeatures')}
        </Text>
        <View style={styles.chipContainer}>
          {modelInfo.features.map((feature, index) => (
             <Chip key={index} mode="outlined" style={styles.featureChip} textStyle={{ fontSize: 12 }}>
               {feature}
             </Chip>
          ))}
        </View>
      </Surface>

      {/* Predictions view  */}
      <Surface style={styles.card} elevation={2}>
        <Text variant="titleLarge" style={{ fontWeight: '600', marginBottom: 16 }}>
          <MaterialCommunityIcons name="trending-up" size={24} color="#4caf50" /> {t('currentPredictions')}
        </Text>

        {/* Fruiting Readiness */}
        <View style={styles.predictionRow}>
           <View style={styles.rowSpaceBetween}>
             <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('fruitingReadiness')}</Text>
             <Text variant="bodyMedium" style={{ color: '#fbbf24', fontWeight: 'bold' }}>{modelInfo.predictions.fruitingReadiness}%</Text>
           </View>
           <ProgressBar progress={modelInfo.predictions.fruitingReadiness / 100} color="#fbbf24" style={styles.progressBarSmall} />
        </View>

        {/* Health Score */}
        <View style={styles.predictionRow}>
           <View style={styles.rowSpaceBetween}>
             <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('healthScore')}</Text>
             <Text variant="bodyMedium" style={{ color: '#4caf50', fontWeight: 'bold' }}>{modelInfo.predictions.healthScore}%</Text>
           </View>
           <ProgressBar progress={modelInfo.predictions.healthScore / 100} color="#4caf50" style={styles.progressBarSmall} />
        </View>

        {/* Estimated Harvest */}
        <Surface style={styles.harvestBox}>
           <MaterialIcons name="check-circle" size={32} color="#4caf50" />
           <View style={{ marginLeft: 16 }}>
             <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('estimatedHarvestDate')}</Text>
             <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
               {new Date(modelInfo.predictions.estimatedHarvestDate).toLocaleDateString(i18n.language, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
               })}
             </Text>
           </View>
        </Surface>

        <Divider style={{ marginVertical: 16 }} />

        <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
          {t('modelControls')}
        </Text>

        <View style={styles.rowSpaceBetween}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('autoLightControl')} (75%)</Text>
          <Switch value={isAutoMode} onValueChange={setIsAutoMode} color={theme.colors.secondary} />
        </View>

        <View style={styles.buttonRow}>
          <Button 
            mode="contained" 
            onPress={handleStatusToggle} 
            buttonColor={modelInfo.status === 'active' ? theme.colors.error : theme.colors.primary}
            icon={modelInfo.status === 'active' ? "pause" : "play"}
            style={{ flex: 1, marginRight: 8 }}
          >
            {modelInfo.status === 'active' ? t('pause') : t('activate')}
          </Button>
          <Button 
            mode="outlined" 
            icon="refresh" 
            style={{ flex: 1 }}
          >
            {t('retrain')}
          </Button>
        </View>
      </Surface>

      {/* Alerts */}
      <Surface style={styles.card} elevation={2}>
        <Text variant="titleLarge" style={{ fontWeight: '600', marginBottom: 16 }}>
          <MaterialIcons name="warning" size={24} color="#fbbf24" /> {t('alertsRecommendations')}
        </Text>

        <Surface style={[styles.alertBox, { borderColor: '#4caf50' }]}>
           <View style={styles.row}>
             <MaterialIcons name="check-circle" size={18} color="#4caf50" />
             <Text variant="titleSmall" style={{ color: '#4caf50', marginLeft: 8, fontWeight: 'bold' }}>{t('optimalConditions')}</Text>
           </View>
           <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
             {t('optimalConditionsMsg')}
           </Text>
        </Surface>

        <Surface style={[styles.alertBox, { borderColor: '#fbbf24' }]}>
           <View style={styles.row}>
             <MaterialIcons name="warning" size={18} color="#fbbf24" />
             <Text variant="titleSmall" style={{ color: '#fbbf24', marginLeft: 8, fontWeight: 'bold' }}>{t('co2Warning')}</Text>
           </View>
           <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
             {t('co2WarningMsg')}
           </Text>
        </Surface>
      </Surface>
      
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};
//style sheet issue fix
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  progressBarSmall: {
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  predictionRow: {
    marginBottom: 8,
  },
  harvestBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4caf50',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  alertBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // slight transparency
  }
});
