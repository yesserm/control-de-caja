import { useMutation, useQuery } from '@tanstack/react-query';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { authenticate, authenticateWithGoogle, getCompanySettings } from '../services/authService';
import { hasRequiredFields } from '../utils/validation';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BrandLogo } from '../components/BrandLogo';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const company = useQuery({ queryKey: ['company-settings'], queryFn: getCompanySettings, retry: false });
  const login = useMutation({ mutationFn: () => authenticate(email.trim(), password), onSuccess: (user) => { if (user) setUser(user); else setError('Correo o contraseña incorrectos.'); }, onError: (reason) => setError(reason instanceof Error ? reason.message : 'No se pudo iniciar sesión.') });
  const handleLogin = () => { if (!hasRequiredFields(email, password)) { setError('Completa correo y contraseña.'); return; } setError(''); login.mutate(); };
  const configured = Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID && (Platform.OS !== 'ios' || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) && (Platform.OS !== 'android' || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID));

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-center bg-[#F5F5F5] p-5"><View className="items-center rounded-2xl border border-slate-200 bg-white p-5"><BrandLogo /><Text className={`mt-3 text-3xl text-slate-900 ${Platform.OS === 'android' ? 'font-medium' : 'font-semibold'}`}>{company.data?.empresaNombre ?? 'Parada Caribe'}</Text><Text className="mb-6 mt-1 text-slate-500">Control de caja</Text><View className="w-full"><Input label="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="admin@caja.local" required /><Input label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••" required />{error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}<Button title="Iniciar sesión" onPress={handleLogin} loading={login.isPending} /><View className="mt-3">{configured ? <GoogleButton setUser={setUser} setError={setError} /> : <><Button title="Google no configurado para esta plataforma" onPress={() => undefined} disabled variant="secondary" /><Text className="mt-2 text-xs text-slate-500">Agrega el Client ID de {Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'web'} y reinicia Expo.</Text></>}</View></View></View></KeyboardAvoidingView>;
}

function GoogleButton({ setUser, setError }: { setUser: (user: import('../types/models').User) => void; setError: (value: string) => void }) {
  const [, , promptGoogle] = Google.useIdTokenAuthRequest({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID });
  const login = useMutation({ mutationFn: authenticateWithGoogle, onSuccess: setUser, onError: (reason) => setError(reason instanceof Error ? reason.message : 'No se pudo iniciar sesión con Google.') });
  const start = async () => { const response = await promptGoogle(); const idToken = response.type === 'success' ? response.params.id_token : undefined; if (idToken) login.mutate(idToken); else if (response.type !== 'dismiss') setError('No se completó el inicio con Google.'); };
  return <Button title="Iniciar con Google" onPress={() => void start()} loading={login.isPending} variant="secondary" />;
}
