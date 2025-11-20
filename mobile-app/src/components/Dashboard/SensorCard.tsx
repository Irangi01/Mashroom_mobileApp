import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: 'temperature' | 'humidity' | 'co2' | 'moisture' | 'ph';
  color: string;
  minValue?: number;
  maxValue?: number;
  optimalMin?: number;
  optimalMax?: number;
}

const iconMap: Record<string, string> = {
  temperature: 'thermometer',
  humidity: 'water-percent',
  co2: 'molecule-co2',
  moisture: 'water',
  ph: 'flask',
};

const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  icon,
  color,
  minValue = 0,
  maxValue = 100,
  optimalMin,
  optimalMax
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  // Ensure value is within bounds for progress calculation
  const clampedValue = Math.min(Math.max(value, minValue), maxValue);
  const progress = ((clampedValue - minValue) / (maxValue - minValue)) * 100;
  
  const isOptimal = optimalMin !== undefined && optimalMax !== undefined
    ? value >= optimalMin && value <= optimalMax
    : true;

  const statusColor = isOptimal ? '#4caf50' : '#ff9800';

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <View style={styles.header}>
        <View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {t(title)}
          </Text>
          <View style={styles.valueContainer}>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
              {value.toFixed(1)}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4, marginLeft: 2 }}>
              {unit}
            </Text>
          </View>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={iconMap[icon]} size={28} color={color} />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.secondaryContainer }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${progress}%`,
                backgroundColor: color 
              }
            ]} 
          />
        </View>
        
        {optimalMin !== undefined && optimalMax !== undefined && (
           <View style={styles.statusContainer}>
             <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
               {t('range')}: {minValue} - {maxValue}
             </Text>
             <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
               <View style={[styles.dot, { backgroundColor: statusColor }]} />
               <Text variant="labelSmall" style={{ color: statusColor, fontWeight: 'bold' }}>
                 {isOptimal ? t('optimal') : t('warning')}
               </Text>
             </View>
           </View>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
});

export default SensorCard;
