# Architecture

## Platform and stack

The target application is an Expo SDK 54 project written in strict TypeScript.
It runs on Android and iOS, using React Navigation's native stack directly
instead of Expo Router. The application root composes `NavigationContainer`,
`QueryClientProvider`, and `AuthProvider`.

Use NativeWind with Tailwind CSS v3 for component styling. Use
`Platform.select` only where a platform difference is meaningful, such as a
`font-medium` Android label and a `font-semibold` iOS label.

## Layers and data flow

Place screens, reusable UI components, services, types, and context under
`src/`. Screens render data from hooks and call services through TanStack Query
queries and mutations. Services are the only layer that knows HTTP endpoints.

`AuthContext` owns the in-memory authenticated user. It exposes login and
logout operations but deliberately does not restore a session after an app
restart. TanStack Query owns server data and invalidates the affected caja or
movement queries after a successful mutation.

Never call `useEffect` directly. Use queries for server reads, derived values
for totals, and event handlers for user-triggered actions.

## Navigation

The root stack contains `Login`, `Caja`, and `Movimientos`. Unauthenticated
users can only reach Login. A valid login replaces Login with Caja. Caja opens
Movimientos only when a cash register is open; returning preserves the current
stack state.

## Environment

Every HTTP request uses `EXPO_PUBLIC_API_URL`, for example
`http://192.168.1.20:3001` on a physical device. Do not hard-code `localhost`:
it resolves to the device itself on Android and iOS hardware.
