import { useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { authenticate } from '../services/authService';
import { hasRequiredFields } from '../utils/validation';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function LoginScreen() {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useMutation({ mutationFn: () => authenticate(email.trim(), password), onSuccess: (user) => { if (user) setUser(user); else setError('Correo o contraseña incorrectos.'); }, onError: (reason) => setError(reason instanceof Error ? reason.message : 'No se pudo iniciar sesión.') });
  const handleLogin = () => { if (!hasRequiredFields(email, password)) { setError('Completa correo y contraseña.'); return; } setError(''); login.mutate(); };

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-center bg-slate-50 p-5"><View className="rounded-2xl border border-slate-200 bg-white p-5"><Text className={`mb-1 text-3xl text-slate-900 ${Platform.OS === 'android' ? 'font-medium' : 'font-semibold'}`}>Control de caja</Text><Text className="mb-6 text-slate-500">Ingresa con tu correo para operar la caja.</Text><Input label="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="admin@caja.local" /><Input label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••" />{error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}<Button title="Iniciar sesión" onPress={handleLogin} loading={login.isPending} /></View></KeyboardAvoidingView>;
}
