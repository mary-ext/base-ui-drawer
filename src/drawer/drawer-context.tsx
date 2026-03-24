import { createContext, use } from 'react';

import type { DrawerStore } from './drawer-store';

export interface DrawerContextValue {
	store: DrawerStore;
}

export const DrawerContext = createContext<DrawerContextValue | null>(null);

/**
 * reads the nearest DrawerContext and returns the store.
 * @throws when used outside a `Drawer.Root`
 */
export function useDrawerStore(): DrawerStore {
	const context = use(DrawerContext);
	if (context === null) {
		throw new Error(`Base UI: Drawer compound components must be rendered inside a Drawer.Root.`);
	}
	return context.store;
}
