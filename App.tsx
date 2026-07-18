import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useContext } from 'react';
import './global.css';
import { AuthContext, AuthProvider } from './src/context/AuthContext';
import { CajaScreen } from './src/screens/CajaScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MovimientosScreen } from './src/screens/MovimientosScreen';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } });

function RootNavigator() {
  const { user } = useContext(AuthContext);
  return <NavigationContainer><Stack.Navigator screenOptions={{ headerShadowVisible: false, headerTitleStyle: { fontWeight: '600' } }}>{user ? <><Stack.Screen name="Caja" component={CajaScreen} options={{ title: 'Control de caja' }} /><Stack.Screen name="Movimientos" component={MovimientosScreen} options={{ title: 'Movimientos de efectivo' }} /></> : <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />}</Stack.Navigator></NavigationContainer>;
}

export default function App() {
  return <QueryClientProvider client={queryClient}><AuthProvider><StatusBar style="dark" /><RootNavigator /></AuthProvider></QueryClientProvider>;
}
