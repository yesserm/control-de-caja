import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';

type Props = TextInputProps & { label: string; error?: string; required?: boolean };

export function Input({ label, error, required, className, ...props }: Props) {
  return <View className="mb-3 gap-1">
    <Text className="text-sm text-slate-700">{label}{required ? ' *' : ''}</Text>
    <TextInput className={`rounded-md border bg-white px-3 py-2 text-base text-slate-900 ${error ? 'border-red-500' : 'border-slate-300'} ${className ?? ''}`} placeholderTextColor="#94a3b8" {...props} />
    {error ? <Text className="text-xs text-red-600">{error}</Text> : null}
  </View>;
}
