import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

export function Card({ children }: PropsWithChildren) { return <View className="mb-4 rounded-xl border border-slate-200 bg-white p-4">{children}</View>; }
