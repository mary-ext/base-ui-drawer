import { createContext, use } from 'react';

import type { DrawerStore } from './drawer-store';
import type { SnapPointValue } from './resolve-snap-model';

export interface DrawerContextValue {
	store: DrawerStore;
	snapPoints?: SnapPointValue[];
	defaultSnapPoint?: SnapPointValue;
	locked: boolean;
	modal: boolean | 'trap-focus';
}

export const DrawerContext = createContext<DrawerContextValue | null>(null);

/**
 * reads the nearest DrawerContext.
 * @throws when used outside a `Drawer.Root`
 */
export function useDrawerContext(): DrawerContextValue {
	const context = use(DrawerContext);
	if (context === null) {
		throw new Error(`Base UI: Drawer compound components must be rendered inside a Drawer.Root.`);
	}
	return context;
}

/**
 * reads the nearest DrawerContext and returns the store.
 * @throws when used outside a `Drawer.Root`
 */
export function useDrawerStore(): DrawerStore {
	return useDrawerContext().store;
}
