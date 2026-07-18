import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useContext } from 'react';
import './global.css';
import { AuthContext, AuthProvider } from './src/context/AuthContext';
import { CajaScreen } from './src/screens/CajaScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MovimientosScreen } from './src/screens/MovimientosScreen';
import { HistorialScreen } from './src/screens/HistorialScreen';
import { AjustesScreen } from './src/screens/AjustesScreen';
import type { MainTabParamList, RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } });

function MainTabs() {
  const { user } = useContext(AuthContext);
  return <Tabs.Navigator screenOptions={{ headerShadowVisible: false, headerTitleStyle: { fontWeight: '600' } }}><Tabs.Screen name="Caja" component={CajaScreen} options={{ title: 'Caja' }} />{user?.role === 'admin' ? <><Tabs.Screen name="Historial" component={HistorialScreen} /><Tabs.Screen name="Ajustes" component={AjustesScreen} /></> : null}</Tabs.Navigator>;
}

function RootNavigator() {
  const { user } = useContext(AuthContext);
  return <NavigationContainer><Stack.Navigator screenOptions={{ headerShadowVisible: false, headerTitleStyle: { fontWeight: '600' } }}>{user ? <><Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} /><Stack.Screen name="Movimientos" component={MovimientosScreen} options={{ title: 'Movimientos de efectivo' }} /></> : <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />}</Stack.Navigator></NavigationContainer>;
}

export default function App() {
  return <QueryClientProvider client={queryClient}><AuthProvider><StatusBar style="dark" /><RootNavigator /></AuthProvider></QueryClientProvider>;
}
