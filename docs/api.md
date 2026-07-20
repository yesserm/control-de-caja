# Simulated API

## Running the server

The development backend is json-server with `db.json` at the repository root.
Run it with:

```bash
npm run api
```

Set `EXPO_PUBLIC_API_URL` to the host and port reachable from the selected
emulator, simulator, or device. Expo Go on a physical device must use the
computer's LAN IP (for example, `http://192.168.0.108:3005`), not localhost.

## Resources

| Resource | Required fields | Operations |
| --- | --- | --- |
| `users` | `id`, `email`, `password`, `name`, `role`, `empresaNombre` | JSON/SQLite test login by email and password. |
| `cajas` | `id`, `fechaInicio`, `fechaCierre`, `usuarioInicioId`, `usuarioCierreId`, `usuarioAsignadoId`, `montoInicial`, `estado` | List open caja, create opening, patch closing. |
| `nominaciones` | `id`, `cajaId`, `denominacion`, `cantidad`, `subtotal` | List by caja; create or patch each denomination. |
| `retiros` | `id`, `cajaId`, `monto`, `concepto`, `fecha`, `usuarioId` | List and create withdrawals. |
| `entradas` | `id`, `cajaId`, `monto`, `concepto`, `turno`, `fecha`, `usuarioId` | List and create cash entries. |
| `settings/general` | `empresaNombre` | Firebase global company name managed by admins. |

## Request behavior

In JSON mode authenticate with `GET /users?email={email}&password={password}`.
Firebase mode uses Firebase Authentication and retrieves the matching profile
from `users/{uid}`. An empty result is an invalid test login. Query open registers with
`GET /cajas?estado=abierta`; mutations use `POST` to create and `PATCH /:id`
to update existing records.

Validate required text before requests. Amounts and bill counts must be finite,
non-negative numbers; entry shifts are exactly `AM` or `PM`. Generate dates as
ISO strings. Convert connection failures and non-success responses into a
short, user-visible Spanish error without exposing technical details.
