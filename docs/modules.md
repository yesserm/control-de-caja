# Application Modules

## Authentication

Login accepts username and password, rejects empty fields, then queries
`users`. On success it stores the full user in `AuthContext` and navigates to
Caja. On failure it preserves the entered values and shows a clear error.

## Caja

Caja loads the open register. If none exists, the signed-in user can open one
with the current ISO date, their ID, and `estado: abierta`. Closing patches the
same record with current date, closing user ID, and `estado: cerrada`.

While open, it renders bill denominations `10, 20, 50, 100, 200, 500, 1000`.
Each quantity is local form state; subtotal is derived as denomination times
quantity, and the general total is the sum of subtotals. Saving creates or
updates the matching `nominacion` record for that caja.

## Movimientos de efectivo

Movimientos is available for the active caja. Retiros require a positive amount
and concept; creation adds current date and authenticated user ID. Entradas use
the same fields plus a required `AM` or `PM` shift. Both sections list the
records belonging to the active caja and refresh after creation.

## Shared responsibilities

Components only render and report user input. Services perform HTTP work;
contexts retain cross-screen session state; TanStack Query handles cached server
state. Every mutation validates its form first, prevents duplicate submission
while pending, and displays a recoverable network error when needed.
