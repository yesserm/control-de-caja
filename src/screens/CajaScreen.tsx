import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useContext, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorMessage, Loading } from '../components/Feedback';
import { AuthContext } from '../context/AuthContext';
import { abrirCaja, cerrarCaja, getCajaAbierta, getNominaciones, saveNominacion } from '../services/cajaService';
import type { RootStackParamList } from '../types/navigation';
import { currency, DENOMINACIONES, toQuantity, totalNominaciones } from '../utils/caja';

type Props = NativeStackScreenProps<RootStackParamList, 'Caja'>;

export function CajaScreen({ navigation }: Props) {
  const { user, logout } = useContext(AuthContext);
  const client = useQueryClient();
  const [edited, setEdited] = useState<Record<number, string>>({});
  const cajaQuery = useQuery({ queryKey: ['caja-abierta', user?.id], queryFn: () => getCajaAbierta(user ?? undefined) });
  const caja = cajaQuery.data;
  const nominacionesQuery = useQuery({ queryKey: ['nominaciones', caja?.id], queryFn: () => getNominaciones(caja!.id), enabled: Boolean(caja) });
  const nominaciones = nominacionesQuery.data ?? [];
  const byDenomination = new Map(nominaciones.map((item) => [item.denominacion, item]));
  const rows = DENOMINACIONES.map((denominacion) => {
    const saved = byDenomination.get(denominacion);
    const input = edited[denominacion] ?? String(saved?.cantidad ?? 0);
    const cantidad = toQuantity(input);
    return { denominacion, input, cantidad, subtotal: denominacion * cantidad, saved };
  });
  const total = totalNominaciones(rows);
  const refreshCaja = () => client.invalidateQueries({ queryKey: ['caja-abierta'] });
  const openMutation = useMutation({ mutationFn: () => abrirCaja(user!.id), onSuccess: refreshCaja });
  const closeMutation = useMutation({ mutationFn: () => cerrarCaja(caja!, user!.id), onSuccess: refreshCaja });
  const saveMutation = useMutation({ mutationFn: () => Promise.all(rows.map((row) => saveNominacion({ cajaId: caja!.id, denominacion: row.denominacion, cantidad: row.cantidad, subtotal: row.subtotal }, row.saved))), onSuccess: () => { setEdited({}); client.invalidateQueries({ queryKey: ['nominaciones', caja!.id] }); } });
  const error = cajaQuery.error ?? nominacionesQuery.error ?? openMutation.error ?? closeMutation.error ?? saveMutation.error;

  if (cajaQuery.isPending) return <Loading />;
  if (cajaQuery.isError) return <View className="flex-1 bg-slate-50 p-4"><ErrorMessage message={(error as Error).message} retry={cajaQuery.refetch} /></View>;
  if (!caja) return <View className="flex-1 justify-center bg-slate-50 p-4"><Card><Text className="mb-2 text-xl font-semibold text-slate-900">No hay una caja abierta</Text><Text className="mb-5 text-slate-600">Abre una nueva caja a nombre de {user?.name}.</Text><Button title="Abrir caja" onPress={() => openMutation.mutate()} loading={openMutation.isPending} />{openMutation.isError ? <Text className="mt-3 text-red-600">{(openMutation.error as Error).message}</Text> : null}</Card><Button title="Cerrar sesión" onPress={() => void logout()} variant="secondary" /></View>;

  return <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="p-4"><Card><Text className="text-xl font-semibold text-slate-900">Caja abierta</Text><Text className="mt-1 text-slate-600">Abierta por {user?.name} · {new Date(caja.fechaInicio).toLocaleString('es-NI')}</Text><View className="mt-4 gap-2"><Button title="Movimientos de efectivo" onPress={() => navigation.navigate('Movimientos', { cajaId: caja.id })} variant="secondary" /><Button title="Cerrar caja" onPress={() => closeMutation.mutate()} loading={closeMutation.isPending} variant="danger" /></View></Card><Card><Text className="mb-1 text-lg font-semibold text-slate-900">Nominaciones de billetes</Text><Text className="mb-4 text-sm text-slate-500">Indica la cantidad de billetes por denominación.</Text>{nominacionesQuery.isPending ? <Loading /> : rows.map((row) => <View key={row.denominacion} className="mb-3 flex-row items-center gap-3 border-b border-slate-100 pb-3"><View className="w-20"><Text className="font-medium text-slate-800">C$ {row.denominacion}</Text></View><TextInput value={row.input} onChangeText={(value) => setEdited((current) => ({ ...current, [row.denominacion]: value }))} keyboardType="number-pad" className="w-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-slate-900" /><Text className="flex-1 text-right text-slate-600">{currency(row.subtotal)}</Text></View>)}<View className="mt-2 flex-row justify-between"><Text className="text-lg font-semibold text-slate-900">Total general</Text><Text className="text-lg font-semibold text-blue-700">{currency(total)}</Text></View><View className="mt-4"><Button title="Guardar nominaciones" onPress={() => saveMutation.mutate()} loading={saveMutation.isPending || nominacionesQuery.isPending} /></View>{saveMutation.isError ? <Text className="mt-3 text-red-600">{(saveMutation.error as Error).message}</Text> : null}</Card><Button title="Cerrar sesión" onPress={() => void logout()} variant="secondary" /></ScrollView>;
}
