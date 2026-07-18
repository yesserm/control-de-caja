# Repository Guidelines

## Required reading

Before writing application code, read the exact Expo SDK 54 documentation at
https://docs.expo.dev/versions/v54.0.0/. Then read the documents in `docs/`
that apply to the change:

- `docs/architecture.md` for app structure, navigation, state, and tooling.
- `docs/api.md` for json-server models, endpoints, and network behavior.
- `docs/design.md` for NativeWind styles and platform-specific UI choices.
- `docs/modules.md` for module responsibilities and acceptance behavior.

## Implementation rules

- Use TypeScript, React Navigation Native Stack, NativeWind with Tailwind CSS
  v3, and json-server as described in the documents above.
- Do not use `useEffect` directly. Fetch remote data with TanStack Query and
  perform mutations from explicit event handlers.
- Keep the `EXPO_PUBLIC_API_URL` configuration outside source control and use
  it for every simulated-backend request.
- Preserve the flat, accessible interface and validate user input before
  sending mutations.
