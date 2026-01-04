import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Surface, Text, Button, Switch, ActivityIndicator, useTheme, Divider, IconButton } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { 
  triggerSensorReading, 
  updateLightControl, 
  subscribeCurrentSensorValues,
  subscribeLightControl 
} from '../services/firebaseService';
import { CurrentSensorValues, LightControl } from '../types';

interface SensorControlItemProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  onRead: () => void;
  onCalibrate: () => void;
  isReading: boolean;
  lastReading?: number;
  unit: string;
}

const SensorControlItem: React.FC<SensorControlItemProps> = ({
  title,
  icon,
  color,
  onRead,
  onCalibrate,
  isReading,
  lastReading,
  unit
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Surface style={styles.sensorCard} elevation={2}>
      <View style={styles.sensorHeader}>
        <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
          {icon}
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text variant="titleMedium" style={{ fontWeight: '600' }}>{t(title.replace(' ', '').replace('Level', '').toLowerCase()) || title}</Text>
          {lastReading !== undefined && (
             <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
               Last: {lastReading.toFixed(2)} {unit}
             </Text>
          )}
        </View>
      </View>
      
      <View style={styles.buttonRow}>
        <Button 
          mode="contained" 
          onPress={onRead} 
          loading={isReading} 
          disabled={isReading}
          style={{ flex: 1, backgroundColor: color }}
          compact
        >
          {isReading ? '...' : t('read')}
        </Button>
        <Button 
          mode="outlined" 
          onPress={onCalibrate}
          style={{ flex: 1, marginLeft: 8, borderColor: color }}
          textColor={color}
          compact
        >
          {t('calibrate')}
        </Button>
      </View>
    </Surface>
  );
};
//export sensor control screen
export const SensorControlsScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [readingStates, setReadingStates] = useState<Record<string, boolean>>({});
  const [lightIntensity, setLightIntensity] = useState<number>(75);
  const [isAutoLight, setIsAutoLight] = useState<boolean>(true);
  const [lightStatus, setLightStatus] = useState<boolean>(true);
  const [currentValues, setCurrentValues] = useState<CurrentSensorValues>({
    ph: 0,
    moisture: 0,
    co2: 0,
    humidity: 0,
    temperature: 0
  });

  useEffect(() => {
    const unsubscribeSensors = subscribeCurrentSensorValues(setCurrentValues);
    const unsubscribeLight = subscribeLightControl((data: LightControl | null) => {
      if (data) {
        setLightIntensity(data.intensity);
        setIsAutoLight(data.isAuto);
        setLightStatus(data.status === 'on');
      }
    });

    return () => {
      unsubscribeSensors();
      unsubscribeLight();
    };
  }, []);

  const handleSensorRead = async (sensorType: 'ph' | 'moisture' | 'co2' | 'humidity' | 'temperature') => {
    setReadingStates(prev => ({ ...prev, [sensorType]: true }));
    await triggerSensorReading(sensorType);
    setTimeout(() => {
      setReadingStates(prev => ({ ...prev, [sensorType]: false }));
    }, 2000);
  };

  const handleCalibrate = (sensorType: string) => {
    console.log(`Calibrating ${sensorType} sensor`);
  };

  const handleLightIntensityChange = async (value: number) => {
    setLightIntensity(value);
    await updateLightControl({ intensity: value });
  };

  const sensors = [
    {
      type: 'temperature' as const,
      title: 'temperature',
      icon: <MaterialCommunityIcons name="thermometer" size={24} color="#ff6b6b" />,
      color: '#ff6b6b',
      unit: '°C',
      lastReading: currentValues.temperature
    },
    {
      type: 'humidity' as const,
      title: 'humidity',
      icon: <MaterialCommunityIcons name="water-percent" size={24} color="#4ecdc4" />,
      color: '#4ecdc4',
      unit: '%',
      lastReading: currentValues.humidity
    },
    {
      type: 'co2' as const,
      title: 'co2',
      icon: <MaterialCommunityIcons name="molecule-co2" size={24} color="#a78bfa" />,
      color: '#a78bfa',
      unit: 'ppm',
      lastReading: currentValues.co2
    },
    {
      type: 'moisture' as const,
      title: 'moisture',
      icon: <MaterialCommunityIcons name="water" size={24} color="#60a5fa" />,
      color: '#60a5fa',
      unit: '%',
      lastReading: currentValues.moisture
    },
    {
      type: 'ph' as const,
      title: 'ph',
      icon: <MaterialCommunityIcons name="flask" size={24} color="#fbbf24" />,
      color: '#fbbf24',
      unit: 'pH',
      lastReading: currentValues.ph
    }
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <MaterialIcons name="sensors" size={40} color="#4ecdc4" />
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground, marginLeft: 16 }}>
          {t('sensorControls')}
        </Text>
      </View>

      <View style={styles.grid}>
        {sensors.map((sensor) => (
          <SensorControlItem
            key={sensor.type}
            {...sensor}
            onRead={() => handleSensorRead(sensor.type)}
            onCalibrate={() => handleCalibrate(sensor.type)}
            isReading={readingStates[sensor.type] || false}
          />
        ))}
      </View>

      {/* Light Control */}
      <Surface style={styles.bigCard} elevation={2}>
        <Text variant="titleLarge" style={{ fontWeight: '600', marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <MaterialIcons name="light-mode" size={24} color="#fbbf24" /> {t('lightControlUnit')}
        </Text>

        <View>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
            {t('lightIntensity')}: {lightIntensity.toFixed(0)}%
          </Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={100}
            value={lightIntensity}
            onSlidingComplete={handleLightIntensityChange}
            disabled={isAutoLight}
            minimumTrackTintColor="#fbbf24"
            maximumTrackTintColor={theme.colors.surfaceDisabled}
            thumbTintColor="#fbbf24"
          />
          <View style={styles.rowSpaceBetween}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>0%</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>100%</Text>
          </View>
        </View>

        <Divider style={{ marginVertical: 16 }} />

        <View style={styles.rowSpaceBetween}>
           <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('lightStatus')}: {lightStatus ? t('on') : t('off')}</Text>
           <Switch 
             value={lightStatus} 
             onValueChange={() => {
                setLightStatus(!lightStatus);
                updateLightControl({ status: !lightStatus ? 'on' : 'off' });
             }} 
             color="#fbbf24"
           />
        </View>

        <View style={[styles.rowSpaceBetween, { marginTop: 16 }]}>
           <View style={{ flex: 1, paddingRight: 16 }}>
             <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
               {t('autoMode')}
             </Text>
           </View>
           <Switch 
             value={isAutoLight} 
             onValueChange={() => {
                setIsAutoLight(!isAutoLight);
                updateLightControl({ isAuto: !isAutoLight });
             }} 
             color={theme.colors.secondary}
           />
        </View>

        <View style={[styles.infoBox, { marginTop: 16 }]}>
           <View style={[styles.dot, { backgroundColor: lightStatus ? '#fbbf24' : theme.colors.surfaceDisabled }]} />
           <Text variant="labelSmall" style={{ flex: 1, color: theme.colors.onSurfaceVariant }}>
             {isAutoLight 
               ? t('autoModeMsg')
               : t('manualModeMsg')
             }
           </Text>
        </View>

      </Surface>

      {/* Quick Actions */}
      <Surface style={[styles.bigCard, { marginBottom: 32 }]} elevation={2}>
        <Text variant="titleLarge" style={{ fontWeight: '600', marginBottom: 16 }}>{t('quickActions')}</Text>
        <View style={styles.actionGrid}>
          <Button 
            mode="contained" 
            icon="refresh" 
            onPress={() => sensors.forEach(s => handleSensorRead(s.type))}
            buttonColor="#4caf50"
            style={styles.actionBtn}
          >
            {t('readAll')}
          </Button>
          <Button 
            mode="outlined" 
            icon="tools" 
            onPress={() => {}}
            textColor="#ff9800"
            style={[styles.actionBtn, { borderColor: '#ff9800' }]}
          >
            {t('calibrateAll')}
          </Button>
        </View>
      </Surface>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  grid: {
    marginBottom: 16,
  },
  sensorCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bigCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
     flex: 1,
     minWidth: '45%'
  }
});
