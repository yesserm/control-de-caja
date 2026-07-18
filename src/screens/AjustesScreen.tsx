import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { AuthContext } from '../context/AuthContext';
import { getCompanySettings, getUsers, updateCompanyName, updateUserRole } from '../services/authService';

export function AjustesScreen() {
  const { user } = useContext(AuthContext); const client = useQueryClient(); const settings = useQuery({ queryKey: ['company-settings'], queryFn: getCompanySettings }); const users = useQuery({ queryKey: ['users'], queryFn: getUsers }); const [name, setName] = useState('');
  const save = useMutation({ mutationFn: () => updateCompanyName(name.trim()), onSuccess: () => client.invalidateQueries({ queryKey: ['company-settings'] }) });
  const changeRole = useMutation({ mutationFn: ({ id, role }: { id: string; role: 'admin' | 'user' }) => updateUserRole(id, role), onSuccess: () => client.invalidateQueries({ queryKey: ['users'] }) });
  const displayedName = name || settings.data?.empresaNombre || '';
  return <ScrollView className="flex-1 bg-[#F5F5F5]" contentContainerClassName="p-4"><Card><Text className="mb-3 text-xl font-semibold text-slate-900">Ajustes</Text><Input label="Nombre de empresa" value={displayedName} onChangeText={setName} placeholder="Parada Caribe" /><Button title="Guardar nombre" onPress={() => save.mutate()} loading={save.isPending} disabled={!name.trim()} /></Card><Card><Text className="mb-3 text-lg font-semibold text-slate-900">Usuarios registrados</Text>{users.data?.map((item) => <View key={item.id} className="mb-3 border-b border-slate-100 pb-3"><Text className="font-medium text-slate-900">{item.name}</Text><Text className="text-sm text-slate-500">{item.email} · {item.role}</Text>{item.id !== user?.id ? <Button title={item.role === 'admin' ? 'Cambiar a usuario' : 'Cambiar a admin'} onPress={() => changeRole.mutate({ id: item.id, role: item.role === 'admin' ? 'user' : 'admin' })} variant="secondary" /> : null}</View>)}</Card></ScrollView>;
}
