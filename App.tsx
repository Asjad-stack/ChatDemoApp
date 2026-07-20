import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import RootNavigator from './src/navigation/RootNavigator';
import useAuth from './src/hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

function App() {
  const { user, authLoading, authError } = useAuth();

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.message}>Signing in...</Text>
      </SafeAreaView>
    );
  }

  if (authError || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>
          {authError || 'Authentication failed.'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.appContainer}>
      <RootNavigator />
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    color: '#ffffff',
    marginTop: 12,
    fontSize: 14,
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
});
