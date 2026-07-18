import { ActivityIndicator, Pressable, Text } from 'react-native';

type Variant = 'primary' | 'secondary' | 'danger';
type Props = { title: string; onPress: () => void; loading?: boolean; disabled?: boolean; variant?: Variant };

const backgrounds: Record<Variant, string> = { primary: 'bg-blue-600', secondary: 'bg-slate-200', danger: 'bg-red-600' };

export function Button({ title, onPress, loading, disabled, variant = 'primary' }: Props) {
  const muted = disabled || loading;
  return <Pressable disabled={muted} onPress={onPress} className={`items-center rounded-lg px-4 py-3 ${backgrounds[variant]} ${muted ? 'opacity-50' : ''}`}>
    {loading ? <ActivityIndicator color={variant === 'secondary' ? '#334155' : '#ffffff'} /> : <Text className={`font-semibold ${variant === 'secondary' ? 'text-slate-800' : 'text-white'}`}>{title}</Text>}
  </Pressable>;
}
