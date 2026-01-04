import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, RadioButton, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const [visible, setVisible] = React.useState(false);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    hideDialog();
  };
//language update 
  const getLanguageName = (lang: string) => {
    switch(lang) {
      case 'en': return 'English';
      case 'si': return 'සිංහල';
      case 'ta': return 'தமிழ்';
      default: return 'English';
    }
  };

  return (
    <View style={styles.container}>
      <Button 
        onPress={showDialog} 
        mode="outlined" 
        icon="translate"
        style={{ borderColor: theme.colors.primary }}
        compact
      >
        {getLanguageName(i18n.language)}
      </Button>

      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>{t('selectLanguage')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={changeLanguage} value={i18n.language}>
              <RadioButton.Item label="English" value="en" />
              <RadioButton.Item label="සිංහල" value="si" />
              <RadioButton.Item label="தமிழ்" value="ta" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LanguageSwitcher;
