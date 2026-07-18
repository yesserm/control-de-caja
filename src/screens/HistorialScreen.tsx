import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollView, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { dataProvider } from '../providers/provider';

type Kind = 'cajas' | 'entradas' | 'retiros' | 'nominaciones';
const labels: Record<Kind, string> = { cajas: 'Cajas', entradas: 'Entradas', retiros: 'Retiros', nominaciones: 'Nominaciones' };

export function HistorialScreen() {
  const [kind, setKind] = useState<Kind>('cajas'); const [text, setText] = useState(''); const [descending, setDescending] = useState(true);
  const history = useQuery({ queryKey: ['history', kind], queryFn: () => dataProvider.getHistory(kind) });
  const items = (history.data ?? []).filter((item) => JSON.stringify(item).toLowerCase().includes(text.toLowerCase())).sort((a, b) => { const left = String('fechaInicio' in a ? a.fechaInicio : 'fecha' in a ? a.fecha : ''); const right = String('fechaInicio' in b ? b.fechaInicio : 'fecha' in b ? b.fecha : ''); return descending ? right.localeCompare(left) : left.localeCompare(right); });
  return <ScrollView className="flex-1 bg-[#F5F5F5]" contentContainerClassName="p-4"><Card><Text className="mb-3 text-xl font-semibold text-slate-900">Historial</Text><View className="mb-3 flex-row flex-wrap gap-2">{(Object.keys(labels) as Kind[]).map((item) => <Text key={item} onPress={() => setKind(item)} className={`rounded-full px-3 py-2 ${kind === item ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>{labels[item]}</Text>)}</View><Input label="Buscar" value={text} onChangeText={setText} placeholder="Concepto, usuario o fecha" /><Text onPress={() => setDescending((value) => !value)} className="mb-3 text-blue-700">Orden: {descending ? 'más reciente' : 'más antiguo'}</Text>{items.map((item) => <Text key={item.id} className="border-t border-slate-100 py-3 text-slate-700">{JSON.stringify(item)}</Text>)}{!history.isPending && !items.length ? <Text className="text-slate-600">No hay registros coincidentes.</Text> : null}</Card></ScrollView>;
}
