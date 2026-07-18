# Control de caja

Aplicación Expo SDK 54 para controlar apertura/cierre de caja, nominaciones de
billetes y movimientos de efectivo. Usa React Navigation Native Stack,
NativeWind (Tailwind CSS v3), TanStack Query y proveedores JSON, SQLite o
Firebase.

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
Credenciales JSON/SQLite de prueba: `admin@caja.local` / `1234` o
`cajero@caja.local` / `1234`.

## Proveedores de datos

Configura `EXPO_PUBLIC_DATA_PROVIDER` en `.env.local` y reinicia Expo:

- `json`: modo predeterminado para web; ejecuta `npm run api`.
- `sqlite`: modo persistente local para Android/iOS y Expo Go. No está
  disponible en web.
- `firebase`: producción/remoto. Crea un proyecto Firebase, registra una app
  web, habilita **Email/Password** en Authentication, crea Cloud Firestore y
  completa las variables `EXPO_PUBLIC_FIREBASE_*` del archivo `.env.example`.

Despliega [firestore.rules](./firestore.rules) en Firestore antes de permitir
usuarios de producción. La configuración Firebase es pública por diseño, pero
las reglas Firestore son obligatorias para proteger los datos.

## Validación

```bash
npm run lint
npm test
```

Consulta `AGENTS.md` y los documentos en `docs/` antes de modificar la
arquitectura, API, diseño o módulos de negocio.
