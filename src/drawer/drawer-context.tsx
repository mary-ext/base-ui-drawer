import { createContext, use } from 'react';

// #region types

export interface DrawerState {
	/** whether the drawer is open */
	open: boolean;
	/** whether the user is currently dragging the drawer */
	dragging: boolean;
	/** whether the close was initiated by scroll snap */
	snapDismissed: boolean;
}

export interface DrawerActions {
	requestClose: () => void;
	setDragging: (value: boolean) => void;
	setSnapDismissed: (value: boolean) => void;
}

export interface DrawerMeta {
	scrollerRef: React.RefObject<HTMLDivElement | null>;
	slideRef: React.RefObject<HTMLDivElement | null>;
	topAnchorRef: React.RefObject<HTMLDivElement | null>;
	indentRef: React.RefObject<HTMLDivElement | null>;
	backdropRef: React.RefObject<HTMLDivElement | null>;
}

export interface DrawerContextValue {
	state: DrawerState;
	actions: DrawerActions;
	meta: DrawerMeta;
}

// #endregion

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
