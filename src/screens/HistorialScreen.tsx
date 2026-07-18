import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Input } from '../components/Input';

type Kind = 'cajas' | 'entradas' | 'retiros' | 'nominaciones';
const labels: Record<Kind, string> = { cajas: 'Cajas', entradas: 'Entradas', retiros: 'Retiros', nominaciones: 'Nominaciones' };

export function HistorialScreen() {
  const [kind, setKind] = useState<Kind>('cajas'); const [text, setText] = useState('');
  return <ScrollView className="flex-1 bg-[#F5F5F5]" contentContainerClassName="p-4"><Card><Text className="mb-3 text-xl font-semibold text-slate-900">Historial</Text><View className="mb-3 flex-row flex-wrap gap-2">{(Object.keys(labels) as Kind[]).map((item) => <Text key={item} onPress={() => setKind(item)} className={`rounded-full px-3 py-2 ${kind === item ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>{labels[item]}</Text>)}</View><Input label="Buscar" value={text} onChangeText={setText} placeholder="Concepto, usuario o fecha" /><Text className="text-sm text-slate-500">Filtros por fecha y ordenamiento se aplicarán a los registros sincronizados.</Text><Text className="mt-4 text-slate-600">No hay registros coincidentes.</Text></Card></ScrollView>;
}
