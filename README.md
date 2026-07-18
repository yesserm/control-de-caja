# Control de caja

Aplicación Expo SDK 54 para controlar apertura/cierre de caja, nominaciones de
billetes y movimientos de efectivo. Usa React Navigation Native Stack,
NativeWind (Tailwind CSS v3), TanStack Query y json-server.

## Instalación

```bash
npm install
Copy-Item .env.example .env.local
```

Edita `.env.local` con una URL accesible desde tu dispositivo. Para Expo Go en
un teléfono conectado a la misma Wi-Fi, usa la IP LAN del equipo, por ejemplo
`http://192.168.0.108:3005`; no uses `localhost` ni `127.0.0.1`. Las variables
`EXPO_PUBLIC_*` se incluyen en el cliente; no coloques secretos.

## Ejecutar

En una terminal inicia el backend simulado:

```bash
npm run api
```

En otra terminal inicia Expo:

```bash
npm start
```

Después de cambiar `EXPO_PUBLIC_API_URL`, reinicia Expo limpiando la caché y
recarga la aplicación:

```bash
npx expo start -c
```

Para probar Expo Go, el teléfono y el equipo deben compartir la misma red
Wi-Fi. Si el teléfono no alcanza `http://192.168.0.108:3005/users`, permite
Node.js/json-server en el Firewall de Windows para redes privadas.

Usa `npm run android` o `npm run ios` para abrir el emulador/simulador.
Credenciales de prueba: `admin` / `1234` o `cajero` / `1234`.

## Validación

```bash
npm run lint
npm test
```

Consulta `AGENTS.md` y los documentos en `docs/` antes de modificar la
arquitectura, API, diseño o módulos de negocio.
