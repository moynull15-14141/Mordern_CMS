/** Public surface for the Navigation feature — only what `app/` and
 * cross-feature consumers (Site Design's Header/Footer picker) actually
 * need. */
export { NavigationPageContent } from './components/navigation-page-content';
export { CreateNavigationPageContent } from './components/create-navigation-page-content';
export { EditNavigationPageContent } from './components/edit-navigation-page-content';
export { MenuPickerField } from './components/menu-picker-field';

export { useMenus, useMenu, useAllMenus } from './hooks/use-menus';
export {
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
  useRestoreMenu,
} from './hooks/use-menu-mutations';

export type {
  Menu,
  MenuItem,
  MenuFilters,
  MenuStatus,
  MenuItemTargetType,
  MenuItemOpenMode,
  CreateMenuInput,
  UpdateMenuInput,
} from './types/menu';
