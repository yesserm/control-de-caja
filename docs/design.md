# Design System

## Visual direction

Use a clean, flat Stitch-inspired interface: white or light-neutral surfaces,
clear borders, restrained use of blue for primary actions, and no exaggerated
shadows. Prioritize readable forms and large touch targets for cashier use.

## NativeWind conventions

Use Tailwind CSS v3 class names on React Native components. Typical patterns:

- Screen containers: `flex-1 bg-slate-50 p-4`.
- Form groups: `mb-4 gap-2`.
- Inputs: `rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900`.
- Primary buttons: `rounded-lg bg-blue-500 px-4 py-3 text-center text-white`.
- Cards: `rounded-xl border border-slate-200 bg-white p-4`.

Keep spacing on a 4-point rhythm and use semantic labels instead of color-only
meaning. Disabled controls must remain distinguishable and inaccessible actions
must not be tappable.

## Components and states

`Input` renders a visible label, required hint when applicable, keyboard type,
and inline validation text. `Button` supports primary, secondary, danger, and
loading states. `Card` groups related content without owning business logic.

Show a loading indicator during initial data retrieval, an inline retryable
message for network failures, and concise confirmation or validation feedback
after form actions. Use `Platform.select` for intentional platform typography
differences only; keep dimensions and behavior consistent between Android and
iOS.
