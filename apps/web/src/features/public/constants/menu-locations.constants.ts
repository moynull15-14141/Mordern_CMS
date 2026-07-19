/**
 * `Menu.location` is a deliberately open-ended string column, not a Prisma
 * enum — "so a theme can name its own slots without a migration"
 * (`config/prisma/schema.prisma`'s `Menu.location` doc comment). These
 * three values are this app's own naming convention for the slots
 * `NavigationProvider` requests, matching the example already used in the
 * backend's own Swagger docs (`@ApiParam({ name: 'location', example: 'header' })`
 * on `PublicMenusController`) — not a backend-defined or frozen list. A
 * site whose menus use different location names will simply resolve
 * `null` for these three (see `navigation.service.ts`), not an error.
 */
export const MENU_LOCATIONS = {
  HEADER: 'header',
  FOOTER: 'footer',
  SECONDARY: 'secondary',
} as const;

export type MenuLocation = (typeof MENU_LOCATIONS)[keyof typeof MENU_LOCATIONS];
