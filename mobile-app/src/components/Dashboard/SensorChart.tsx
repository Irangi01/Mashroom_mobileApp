import React, { useMemo, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import { SensorData } from '../../types';

interface SensorChartProps {
  title: string;
  data: SensorData[];
  dataKey?: string; // Not strictly needed for single line chart but kept for compat
  color: string;
  unit: string;
  minValue?: number;
  maxValue?: number;
}


const SensorChart: React.FC<SensorChartProps> = ({
  title,
  data,
  color,
  unit,
  minValue,
  maxValue
}) => {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 48; // Padding correction
  const { t } = useTranslation();

  // Process data for Chart Kit
  // We only show last 10-15 points to avoid overcrowding since chart kit is static-ish
  const displayData = data.slice(-15);
  
  const chartData = useMemo(() => {
    if (displayData.length === 0) return { labels: [], datasets: [{ data: [0] }] };

    const labels = displayData.map(d => {
       const date = new Date(d.timestamp);
       return `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    });
    
    // Subsample labels to avoid overlapping
    const step = Math.ceil(labels.length / 5);
    const visibleLabels = labels.map((l, i) => i % step === 0 ? l : '');

    return {
      labels: visibleLabels,
      datasets: [
        {
          data: displayData.map(d => d.value),
          color: (opacity = 1) => color, // optional
          strokeWidth: 2
        }
      ],
      legend: [t(title)] 
    };
  }, [displayData, color, title, t]);

  const lastValue = displayData.length > 0 ? displayData[displayData.length - 1].value : 0;

  return (
    <Surface style={styles.card} elevation={2}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={{ color: color, fontWeight: 'bold' }}>
          {t(title)} <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>({unit})</Text>
        </Text>
      </View>

      <View style={styles.chartContainer}>
        {displayData.length > 0 ? (
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 1,
              color: (opacity = 1) => color,
              labelColor: (opacity = 1) => theme.colors.onSurfaceVariant,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "3",
                strokeWidth: "1",
                stroke: color
              },
              propsForBackgroundLines: {
                 strokeDasharray: "3 3",
                 stroke: theme.colors.surfaceDisabled
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
            fromZero={false}
            yAxisInterval={1} 
            withVerticalLines={false}
          />
        ) : (
          <View style={styles.noData}>
            <Text>{t('noDataAvailable')}</Text>
          </View>
        )}
      </View>
      
      {displayData.length > 0 && (
        <View style={styles.footer}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
             {t('current')}: <Text style={{ color: color, fontWeight: 'bold' }}>{lastValue.toFixed(2)} {unit}</Text>
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {displayData.length} {t('readings')}
          </Text>
        </View>
      )}
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
    marginBottom: 8,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden' 
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  noData: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default SensorChart;
