import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, Button, Chip, ActivityIndicator, useTheme, Divider } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { RobotArmPosition, Plot } from '../types';
import { 
  subscribeRobotArmPosition, 
  subscribePlots, 
  moveRobotToPlot, 
  updateRobotStatus
} from '../services/firebaseService';

export const RobotArmScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [robotPosition, setRobotPosition] = useState<RobotArmPosition>({
    currentPlot: 1,
    status: 'idle',
    lastAction: 'Waiting for data...'
  });
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<number>(1);
  const [isMoving, setIsMoving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeRobot = subscribeRobotArmPosition((data) => {
      if (data) {
        setRobotPosition({
          currentPlot: data.currentPlot || 1,
          status: data.status || 'idle',
          lastAction: data.lastAction || 'System ready'
        });
        setIsMoving(data.status === 'moving');
      }
      setLoading(false);
    });

    const unsubscribePlots = subscribePlots((data) => {
      if (data && data.length > 0) {
        setPlots(data);
      } else {
        setPlots([
          { id: 1, name: 'Plot 1', status: 'active', lastVisited: new Date().toISOString() },
          { id: 2, name: 'Plot 2', status: 'active', lastVisited: new Date().toISOString() },
          { id: 3, name: 'Plot 3', status: 'active', lastVisited: new Date().toISOString() },
          { id: 4, name: 'Plot 4', status: 'active', lastVisited: new Date().toISOString() },
          { id: 5, name: 'Plot 5', status: 'inactive', lastVisited: new Date().toISOString() },
          { id: 6, name: 'Plot 6', status: 'active', lastVisited: new Date().toISOString() },
        ]);
      }
    });

    return () => {
      unsubscribeRobot();
      unsubscribePlots();
    };
  }, []);

  const handleMoveToPlot = async () => {
    setIsMoving(true);
    await moveRobotToPlot(selectedPlot);
    
    setTimeout(() => {
      setRobotPosition(prev => ({
        ...prev,
        currentPlot: selectedPlot,
        status: 'idle',
        lastAction: `Arrived at Plot ${selectedPlot}`
      }));
      setIsMoving(false);
    }, 3000);
  };

  const handleEmergencyStop = async () => {
    await updateRobotStatus('idle');
    setIsMoving(false);
    setRobotPosition(prev => ({
      ...prev,
      status: 'idle',
      lastAction: 'Emergency stop activated'
    }));
  };

  const handleReturnHome = async () => {
    setIsMoving(true);
    await moveRobotToPlot(1);
    
    setTimeout(() => {
      setRobotPosition(prev => ({
        ...prev,
        currentPlot: 1,
        status: 'idle',
        lastAction: 'Returned to home position'
      }));
      setIsMoving(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return '#4caf50';
      case 'moving': return '#ff9800';
      case 'operating': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  if (loading) {
     return (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" animating={true} color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onBackground }}>{t('loadingRobotStatus')}</Text>
        </View>
      );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <MaterialIcons name="precision-manufacturing" size={40} color={theme.colors.primary} />
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground, marginLeft: 16 }}>
          {t('robotArm')}
        </Text>
      </View>

      {/* Robot Status Panel */}
      <Surface style={styles.card} elevation={2}>
        <Text variant="titleLarge" style={{ fontWeight: '600', marginBottom: 16 }}>{t('robotStatus')}</Text>
        
        <View style={styles.row}>
           <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryContainer }]}>
             <MaterialIcons name="location-on" size={32} color={theme.colors.primary} />
           </View>
           <View style={{ marginLeft: 16 }}>
             <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('currentPosition')}</Text>
             <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>{t('plot')} {robotPosition.currentPlot}</Text>
           </View>
        </View>

        <View style={{ marginTop: 24, marginBottom: 16 }}>
           <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>{t('status')}</Text>
           <Chip 
             icon={() => isMoving ? <ActivityIndicator size={16} color="#ff9800" /> : <MaterialIcons name="check-circle" size={16} color={getStatusColor(robotPosition.status)} />}
             style={{ backgroundColor: `${getStatusColor(robotPosition.status)}20`, alignSelf: 'flex-start' }}
             textStyle={{ color: getStatusColor(robotPosition.status), fontWeight: 'bold' }}
           >
             {robotPosition.status.toUpperCase()}
           </Chip>
        </View>

        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('lastAction')}</Text>
        <Text variant="bodyLarge">{robotPosition.lastAction}</Text>
      </Surface>

      {/* Plot Grid Visualization */}
      <Surface style={styles.card} elevation={2}>
         <Text variant="titleLarge" style={{ fontWeight: '600', marginBottom: 16 }}>{t('selectTargetPlot')}</Text>
         
         <View style={styles.plotGrid}>
           {plots.map((plot) => {
             const isCurrent = robotPosition.currentPlot === plot.id;
             const isSelected = selectedPlot === plot.id;
             const isInactive = plot.status === 'inactive';
             
             let cardColor = theme.colors.surfaceVariant;
             if (isCurrent) cardColor = theme.colors.primary; // Or success color
             else if (isSelected) cardColor = theme.colors.secondary;
             else if (isInactive) cardColor = theme.colors.surfaceDisabled;

             let textColor = theme.colors.onSurfaceVariant;
             if (isCurrent || isSelected) textColor = theme.colors.onPrimary;
             if (isInactive) textColor = theme.colors.onSurfaceDisabled;

             return (
               <TouchableOpacity 
                 key={plot.id}
                 onPress={() => {
                   if (plot.status === 'active' && !isMoving) {
                     setSelectedPlot(plot.id);
                   }
                 }}
                 disabled={isInactive || isMoving}
                 style={[
                    styles.plotCard, 
                    { 
                      backgroundColor: cardColor,
                      borderColor: (isCurrent || isSelected) ? 'transparent' : theme.colors.outline,
                    }
                 ]}
               >
                 <View style={styles.plotCardHeader}>
                   <Text variant="titleSmall" style={{ color: textColor, fontWeight: 'bold' }}>{plot.name}</Text>
                   {isCurrent && <MaterialIcons name="precision-manufacturing" size={16} color="white" />}
                 </View>
                 <Text variant="labelSmall" style={{ color: textColor, opacity: 0.8 }}>
                   {isInactive ? t('inactive') : `${t('lastVisited')}:\n${new Date(plot.lastVisited).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                 </Text>
               </TouchableOpacity>
             )
           })}
         </View>
         
         <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: theme.colors.primary }]} /><Text variant="labelSmall">{t('current')}</Text></View>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: theme.colors.secondary }]} /><Text variant="labelSmall">Selected</Text></View>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: theme.colors.surfaceDisabled }]} /><Text variant="labelSmall">{t('inactive')}</Text></View>
         </View>
      </Surface>

      {/* Controls */}
      <Surface style={[styles.card, { marginBottom: 32 }]} elevation={2}>
         <Text variant="titleLarge" style={{ fontWeight: '600', marginBottom: 16 }}>{t('controls')}</Text>
         
         <View style={styles.buttonGrid}>
           <Button 
             mode="contained" 
             onPress={handleMoveToPlot}
             disabled={isMoving || selectedPlot === robotPosition.currentPlot}
             icon={isMoving ? () => <ActivityIndicator size={16} color="white" /> : "play"}
             buttonColor="#4caf50"
             style={styles.controlButton}
           >
             {isMoving ? t('moving') : t('moveToPlot')}
           </Button>
           
           <Button 
             mode="contained" 
             onPress={handleReturnHome}
             disabled={isMoving || robotPosition.currentPlot === 1}
             icon="home"
             buttonColor={theme.colors.primary}
             style={styles.controlButton}
           >
             {t('home')}
           </Button>
         </View>

         <Button 
            mode="contained" 
            onPress={handleEmergencyStop}
            icon="stop"
            buttonColor={theme.colors.error}
            style={{ marginTop: 12 }}
          >
            {t('emergencyStop')}
          </Button>
      </Surface>

    </ScrollView>
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
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  plotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  plotCard: {
    width: '31%', // roughly 1/3 minus margins
    margin: '1%',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 80,
    justifyContent: 'space-between'
  },
  plotCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  legend: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10, 
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1, 
  }
});
