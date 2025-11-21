import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, Surface, useTheme, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export const HomeScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<any>();

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <View style={styles.header}>
        <View style={styles.languageContainer}>
           <LanguageSwitcher />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="mushroom" size={80} color={theme.colors.primary} />
        </View>
        
        <Text variant="displaySmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Smart Mushroom
        </Text>
        <Text variant="headlineSmall" style={[styles.subtitle, { color: theme.colors.secondary }]}>
          Incubation System
        </Text>

        <Surface style={styles.descriptionCard} elevation={2}>
          <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            {t('projectDescription')}
          </Text>
        </Surface>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Dashboard')}
            contentStyle={{ paddingVertical: 8 }}
            style={{ borderRadius: 30 }}
            icon="view-dashboard"
          >
            {t('dashboard')}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align to the right
    padding: 16,
  },
  languageContainer: {
    marginTop: 40, // For status bar
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24, // Side padding
    justifyContent: 'center',
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 40,
    textAlign: 'center',
  },
  descriptionCard: {
    padding: 24,
    borderRadius: 16,
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  }
});
