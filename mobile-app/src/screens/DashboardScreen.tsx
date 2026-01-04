import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import { Text, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';


import SensorCard from '../components/Dashboard/SensorCard';
import SensorChart from '../components/Dashboard/SensorChart';
import VideoFeed from '../components/Dashboard/VideoFeed';
import LanguageSwitcher from '../components/LanguageSwitcher';

import { SensorData, CurrentSensorValues } from '../types';
import { subscribeSensorData, subscribeCurrentSensorValues, subscribeCameraUrl } from '../services/firebaseService';

export const DashboardScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  // ui edite for the changes 
  
  const [phData, setPhData] = useState<SensorData[]>([]);
  const [moistureData, setMoistureData] = useState<SensorData[]>([]);
  const [co2Data, setCo2Data] = useState<SensorData[]>([]);
  const [humidityData, setHumidityData] = useState<SensorData[]>([]);
  const [temperatureData, setTemperatureData] = useState<SensorData[]>([]);
  
  const [currentValues, setCurrentValues] = useState<CurrentSensorValues>({
    ph: 0,
    moisture: 0,
    co2: 0,
    humidity: 0,
    temperature: 0
  });
  //fetch camera url
  const [cameraUrl, setCameraUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to sensor dataa
    const unsubscribePh = subscribeSensorData('ph', (data) => {
      setPhData(data);
      setLoading(false);
    });
    const unsubscribeMoisture = subscribeSensorData('moisture', setMoistureData);
    const unsubscribeCo2 = subscribeSensorData('co2', setCo2Data);
    const unsubscribeHumidity = subscribeSensorData('humidity', setHumidityData);
    const unsubscribeTemperature = subscribeSensorData('temperature', setTemperatureData);
    
    // Subscribe to current values
    const unsubscribeCurrent = subscribeCurrentSensorValues((data) => {
      setCurrentValues(data);
    });
    
    // Subscribe to camera url
    const unsubscribeCamera = subscribeCameraUrl((url) => {
      setCameraUrl(url);
    });

    const timeout = setTimeout(() => setLoading(false), 3000);

    return () => {
      unsubscribePh();
      unsubscribeMoisture();
      unsubscribeCo2();
      unsubscribeHumidity();
      unsubscribeTemperature();
      unsubscribeCurrent();
      unsubscribeCamera(); //unsubscribe camera 
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" animating={true} color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onBackground }}>{t('loadingSensorData')}</Text>
      </View>
    );
  }
//start the UI createion
  return (
    <ImageBackground 
      source={require('../assets/mushroom_bg.png')} 
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
             <MaterialCommunityIcons name="view-dashboard" size={32} color={theme.colors.primary} />
             <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground, marginLeft: 8 }}>
               {t('dashboard')}
             </Text>
          </View>
          <LanguageSwitcher />
        </View>
        <View style={{ alignItems: 'flex-end', marginBottom: 16 }}>
          <Button mode="text" onPress={() => console.log('Refresh')} labelStyle={{ color: theme.colors.primary }}>
            {t('lastUpdated')}: {new Date().toLocaleTimeString()}
          </Button>
        </View>

        {/* Video Feed */}
        <VideoFeed streamUrl={cameraUrl || undefined} />

        {/* Quick Stats Grid */}
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>{t('currentStatus')}</Text>
        <View style={styles.grid}>
           {/* Sensor Cards */}
          <SensorCard
            title="temperature"
            value={currentValues.temperature}
            unit="°C"
            icon="temperature"
            color="#ff6b6b"
            minValue={10}
            maxValue={40}
            optimalMin={20}
            optimalMax={28}
          />
          <SensorCard
            title="humidity"
            value={currentValues.humidity}
            unit="%"
            icon="humidity"
            color="#4ecdc4"
            minValue={0}
            maxValue={100}
            optimalMin={80}
            optimalMax={95}
          />
          <SensorCard
            title="co2"
            value={currentValues.co2}
            unit="ppm"
            icon="co2"
            color="#a78bfa"
            minValue={0}
            maxValue={2000}
            optimalMin={500}
            optimalMax={1000}
          />
          <SensorCard
            title="moisture"
            value={currentValues.moisture}
            unit="%"
            icon="moisture"
            color="#60a5fa"
            minValue={0}
            maxValue={100}
            optimalMin={65}
            optimalMax={85}
          />
          <SensorCard
            title="ph"
            value={currentValues.ph}
            unit="pH"
            icon="ph"
            color="#fbbf24"
            minValue={0}
            maxValue={14}
            optimalMin={6.0}
            optimalMax={7.0}
          />
        </View>

        {/* Charts */}
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>{t('trends')}</Text>
        
        <SensorChart
          title="temperature"
          data={temperatureData}
          color="#ff6b6b"
          unit="°C"
          minValue={10}
          maxValue={40}
        />
        
        <SensorChart
          title="humidity"
          data={humidityData}
          color="#4ecdc4"
          unit="%"
          minValue={0}
          maxValue={100}
        />

        <SensorChart
          title="co2"
          data={co2Data}
          color="#a78bfa"
          unit="ppm"
          minValue={0}
          maxValue={2000}
        />

        <View style={{ height: 20 }} /> 
      </ScrollView>
    </ImageBackground>
  );
};

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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  grid: {
    gap: 8,
  }
});
