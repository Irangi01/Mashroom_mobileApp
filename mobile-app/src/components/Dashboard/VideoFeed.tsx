import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Surface, Text, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { WebView } from 'react-native-webview';

interface VideoFeedProps {
  streamUrl?: string;
  title?: string;
}
//video feed update 
const VideoFeed: React.FC<VideoFeedProps> = ({ 
  streamUrl, 
  title = 'liveCameraFeed' 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>('noVideoSignal');
  const [key, setKey] = useState(0); // Used to force reload Image
  const theme = useTheme();
  const { t } = useTranslation();

  const handleRetryConnection = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    // Simulate connection attempt / Reload image 
    // IN real implementation this would cgeck autual connection status
    setTimeout(() => {
      if (streamUrl) {
        setIsConnected(true);
        setError(null);
        setKey(prev => prev + 1);
      } else {
        setIsConnected(false);
        setError('connectionFailed');
      }
      setIsLoading(false);
    }, 2000);
  }, [streamUrl]);

  useEffect(() => {
    if (streamUrl) {
      handleRetryConnection();
    }
  }, [streamUrl, handleRetryConnection]);

  return (
    <Surface style={styles.card} elevation={2}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{t(title)}</Text>
        <View style={styles.headerRight}>
          <View style={[
              styles.statusChip, 
              { backgroundColor: isConnected ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)' }
            ]}>
            <MaterialIcons 
              name="fiber-manual-record" 
              size={12} 
              color={isConnected ? '#4caf50' : '#f44336'} 
            />
            <Text style={[
              styles.statusText, 
              { color: isConnected ? '#4caf50' : '#f44336' }
            ]}>
              {isConnected ? t('live') : t('offline')}
            </Text>
          </View>
          <IconButton 
            icon="refresh" 
            size={20} 
            onPress={handleRetryConnection}
            disabled={isLoading}
          />
        </View>
      </View>

      {/* Video Container */}
      <View style={[styles.videoContainer, { backgroundColor: theme.colors.elevation.level3 }]}>
        {/* DEBUG INFO - REMOVE AFTER FIXING */}
        <Text style={{fontSize: 10, color: 'gray', textAlign: 'center', padding: 4}}>
            Debug: {streamUrl || 'No URL'} | Status: {isConnected ? 'Connected' : 'Disconnected'} | Error: {error || 'None'}
        </Text>

        {isConnected && streamUrl ? (
          Platform.OS === 'web' ? (
            <Image 
              key={key}
              source={{ uri: streamUrl }} 
              style={styles.image}
              resizeMode="cover"
              onError={() => {
                  setIsConnected(false);
                  setError('streamUnavailable');
              }}
            />
          ) : (
            <WebView
              key={key}
              source={{ 
                html: `
                  <html>
                    <body style="margin:0;padding:0;background:black;display:flex;justify-content:center;align-items:center;height:100%;">
                      <img src="${streamUrl}" style="width:100%;height:100%;object-fit:contain;" />
                    </body>
                  </html>
                `
              }}
              style={{ width: '100%', height: 300, backgroundColor: 'black' }} 
              scrollEnabled={false}
              originWhitelist={['*']}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              scalesPageToFit={true}
              startInLoadingState={true}
              renderLoading={() => (
                 <View style={styles.loaderOverlay}>
                   <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
                 </View>
              )}
              onError={(e: any) => {
                  console.log('WebView Error:', e.nativeEvent);
                  setIsConnected(false);
                  setError(`WebErr: ${e.nativeEvent.description || 'Unknown'}`);
              }}
              onHttpError={(e: any) => {
                  console.log('WebView HTTP Error:', e.nativeEvent);
                  setError(`HttpErr: ${e.nativeEvent.statusCode}`);
              }}
            />
          )
        ) : (
          <View style={styles.placeholder}>
             <MaterialIcons 
               name={error?.includes('Connection') ? "signal-wifi-off" : "videocam-off"} 
               size={40} 
               color="#f44336" 
             />
             <Text variant="titleMedium" style={{ marginTop: 16 }}>{t('noVideoSignal')}</Text>
             <Text variant="bodySmall" style={{ textAlign: 'center', marginTop: 8, maxWidth: 250, color: theme.colors.onSurfaceVariant }}>
               {t('cameraUnavailable')}
             </Text>
             <Text variant="bodySmall" style={{ color: 'red', marginTop: 8 }}>Debug: {error}</Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.loaderOverlay}>
             <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
             <Text style={{ color: 'white', marginTop: 16 }}>{t('connecting')}</Text>
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
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  videoContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    padding: 24,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoFeed;
