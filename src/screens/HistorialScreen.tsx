import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { dataProvider } from '../providers/provider';
import type { HistoryItem, HistoryKind } from '../types/models';
import { currency } from '../utils/caja';

const labels: Record<HistoryKind, string> = { cajas: 'Cajas', entradas: 'Entradas', retiros: 'Retiros', nominaciones: 'Nominaciones' };
const dateOf = (item: HistoryItem) => 'fechaInicio' in item ? item.fechaInicio : 'fecha' in item ? item.fecha : '';
function detail(item: HistoryItem) {
  if ('denominacion' in item) return `C$ ${item.denominacion} · ${item.cantidad} billetes · ${currency(item.subtotal)}`;
  if ('montoInicial' in item) return `${item.estado} · inicial ${currency(item.montoInicial)}`;
  return `${currency(item.monto)} · ${item.concepto}${'turno' in item ? ` (${item.turno})` : ''}`;
}

export function HistorialScreen() {
  const [kind, setKind] = useState<HistoryKind>('cajas'); const [text, setText] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [descending, setDescending] = useState(true);
  const history = useQuery({ queryKey: ['history', kind], queryFn: () => dataProvider.getHistory(kind) });
  const items = (history.data ?? []).filter((item) => { const date = dateOf(item); return JSON.stringify(item).toLowerCase().includes(text.toLowerCase()) && (!from || date.slice(0, 10) >= from) && (!to || date.slice(0, 10) <= to); }).sort((a, b) => descending ? dateOf(b).localeCompare(dateOf(a)) : dateOf(a).localeCompare(dateOf(b)));
  return <ScrollView className="flex-1 bg-[#F5F5F5]" contentContainerClassName="p-4"><Card><Text className="mb-3 text-xl font-semibold text-slate-900">Historial</Text><View className="mb-3 flex-row flex-wrap gap-2">{(Object.keys(labels) as HistoryKind[]).map((item) => <Pressable key={item} onPress={() => setKind(item)} className={`rounded-full px-3 py-2 ${kind === item ? 'bg-blue-600' : 'bg-slate-200'}`}><Text className={kind === item ? 'text-white' : 'text-slate-700'}>{labels[item]}</Text></Pressable>)}</View><Input label="Buscar" value={text} onChangeText={setText} placeholder="Concepto o identificador" /><View className="flex-row gap-2"><View className="flex-1"><Input label="Desde" value={from} onChangeText={setFrom} placeholder="AAAA-MM-DD" /></View><View className="flex-1"><Input label="Hasta" value={to} onChangeText={setTo} placeholder="AAAA-MM-DD" /></View></View><Pressable onPress={() => setDescending((value) => !value)}><Text className="mb-3 text-blue-700">Orden: {descending ? 'más reciente' : 'más antiguo'}</Text></Pressable>{items.map((item) => <View key={item.id} className="border-t border-slate-100 py-3"><Text className="font-medium text-slate-900">{detail(item)}</Text><Text className="text-sm text-slate-500">{dateOf(item) ? new Date(dateOf(item)).toLocaleString('es-NI') : 'Sin fecha'}</Text></View>)}{history.isPending ? <Text className="text-slate-500">Cargando…</Text> : null}{!history.isPending && !items.length ? <Text className="text-slate-600">No hay registros coincidentes.</Text> : null}</Card></ScrollView>;
}
