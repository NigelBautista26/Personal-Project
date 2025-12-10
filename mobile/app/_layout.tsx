import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { QueryProvider } from '../src/context/QueryProvider';

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="(photographer)" />
          <Stack.Screen name="photographer-onboarding" />
          <Stack.Screen name="photographer-pending" />
          <Stack.Screen name="photographer-rejected" />
        </Stack>
      </AuthProvider>
    </QueryProvider>
  );
}
