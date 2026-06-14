import { Redirect } from 'expo-router';

export default function Index() {

  const isAuthenticated = false; 

  return isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
}