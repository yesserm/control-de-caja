import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorMessage, Loading } from '../components/Feedback';
import { Input } from '../components/Input';
import { AuthContext } from '../context/AuthContext';
import { crearEntrada, crearRetiro, getEntradas, getRetiros } from '../services/movimientosService';
import type { RootStackParamList } from '../types/navigation';
import { currency } from '../utils/caja';
import { hasRequiredFields, isPositiveAmount } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Movimientos'>;

export function MovimientosScreen({ route }: Props) {
  const { user } = useContext(AuthContext);
  const client = useQueryClient();
  const [retiroMonto, setRetiroMonto] = useState(''); const [retiroConcepto, setRetiroConcepto] = useState('');
  const [entradaMonto, setEntradaMonto] = useState(''); const [entradaConcepto, setEntradaConcepto] = useState(''); const [turno, setTurno] = useState<'AM' | 'PM'>('AM'); const [error, setError] = useState('');
  const retiros = useQuery({ queryKey: ['retiros', route.params.cajaId], queryFn: () => getRetiros(route.params.cajaId) });
  const entradas = useQuery({ queryKey: ['entradas', route.params.cajaId], queryFn: () => getEntradas(route.params.cajaId) });
  const refresh = () => { client.invalidateQueries({ queryKey: ['retiros', route.params.cajaId] }); client.invalidateQueries({ queryKey: ['entradas', route.params.cajaId] }); };
  const retiroMutation = useMutation({ mutationFn: () => crearRetiro({ cajaId: route.params.cajaId, monto: Number(retiroMonto), concepto: retiroConcepto.trim(), usuarioId: user!.id }), onSuccess: () => { setRetiroMonto(''); setRetiroConcepto(''); refresh(); }, onError: (reason) => setError((reason as Error).message) });
  const entradaMutation = useMutation({ mutationFn: () => crearEntrada({ cajaId: route.params.cajaId, monto: Number(entradaMonto), concepto: entradaConcepto.trim(), turno, usuarioId: user!.id }), onSuccess: () => { setEntradaMonto(''); setEntradaConcepto(''); refresh(); }, onError: (reason) => setError((reason as Error).message) });
  const submitRetiro = () => { if (!hasRequiredFields(retiroMonto, retiroConcepto) || !isPositiveAmount(retiroMonto)) { setError('Ingresa un monto positivo y un concepto para el retiro.'); return; } setError(''); retiroMutation.mutate(); };
  const submitEntrada = () => { if (!hasRequiredFields(entradaMonto, entradaConcepto) || !isPositiveAmount(entradaMonto)) { setError('Ingresa un monto positivo y un concepto para la entrada.'); return; } setError(''); entradaMutation.mutate(); };
  if (retiros.isPending || entradas.isPending) return <Loading />;
  if (retiros.isError || entradas.isError) return <View className="flex-1 bg-slate-50 p-4"><ErrorMessage message="No se pudieron cargar los movimientos." retry={refresh} /></View>;

  return <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="p-4"><Card><Text className="mb-4 text-lg font-semibold text-slate-900">Retiros</Text><Input label="Monto" value={retiroMonto} onChangeText={setRetiroMonto} keyboardType="decimal-pad" placeholder="0.00" /><Input label="Concepto" value={retiroConcepto} onChangeText={setRetiroConcepto} placeholder="Compras de insumos" /><Button title="Registrar retiro" onPress={submitRetiro} loading={retiroMutation.isPending} variant="danger" /><View className="mt-4 gap-2">{retiros.data?.map((item) => <Text key={item.id} className="border-t border-slate-100 pt-2 text-slate-700">{currency(item.monto)} · {item.concepto}</Text>)}</View></Card><Card><Text className="mb-4 text-lg font-semibold text-slate-900">Entradas</Text><Input label="Monto" value={entradaMonto} onChangeText={setEntradaMonto} keyboardType="decimal-pad" placeholder="0.00" /><Input label="Concepto" value={entradaConcepto} onChangeText={setEntradaConcepto} placeholder="Ventas" /><Text className="mb-2 text-sm text-slate-700">Turno *</Text><View className="mb-4 flex-row gap-2">{(['AM', 'PM'] as const).map((item) => <Pressable key={item} onPress={() => setTurno(item)} className={`rounded-md px-5 py-2 ${turno === item ? 'bg-blue-600' : 'bg-slate-200'}`}><Text className={turno === item ? 'font-semibold text-white' : 'text-slate-700'}>{item}</Text></Pressable>)}</View><Button title="Registrar entrada" onPress={submitEntrada} loading={entradaMutation.isPending} /><View className="mt-4 gap-2">{entradas.data?.map((item) => <Text key={item.id} className="border-t border-slate-100 pt-2 text-slate-700">{currency(item.monto)} · {item.concepto} ({item.turno})</Text>)}</View></Card>{error ? <ErrorMessage message={error} /> : null}</ScrollView>;
}
