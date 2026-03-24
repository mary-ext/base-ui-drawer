import type { Dialog } from '@base-ui/react/dialog';
import { ReactStore, createSelector } from '@base-ui/utils/store';
import { createRef } from 'react';

// #region state

export interface DrawerState {
	/** whether the drawer is open */
	open: boolean;
	/** whether the user is currently dragging the drawer */
	dragging: boolean;
	/** whether the close was initiated by scroll snap */
	snapDismissed: boolean;
}

// #endregion

// #region context (non-reactive)

export interface DrawerStoreContext {
	scrollerRef: React.RefObject<HTMLDivElement | null>;
	slideRef: React.RefObject<HTMLDivElement | null>;
	topAnchorRef: React.RefObject<HTMLDivElement | null>;
	indentRef: React.RefObject<HTMLDivElement | null>;
	backdropRef: React.RefObject<HTMLDivElement | null>;
	actionsRef: React.RefObject<Dialog.Root.Actions | null>;
}

// #endregion

// #region selectors

const selectors = {
	open: createSelector((state: DrawerState) => state.open),
	dragging: createSelector((state: DrawerState) => state.dragging),
	snapDismissed: createSelector((state: DrawerState) => state.snapDismissed),
};

// #endregion

/**
 * reactive store for drawer state. components subscribe to individual fields
 * via `store.useState('field')` so they only re-render when that field changes.
 *
 * non-reactive values (refs, actions) live in `store.context`.
 */
export class DrawerStore extends ReactStore<DrawerState, DrawerStoreContext, typeof selectors> {
	constructor(initialState?: Partial<DrawerState>) {
		super(
			{
				open: false,
				dragging: false,
				snapDismissed: false,
				...initialState,
			},
			{
				scrollerRef: createRef<HTMLDivElement>(),
				slideRef: createRef<HTMLDivElement>(),
				topAnchorRef: createRef<HTMLDivElement>(),
				indentRef: createRef<HTMLDivElement>(),
				backdropRef: createRef<HTMLDivElement>(),
				actionsRef: createRef<Dialog.Root.Actions>(),
			},
			selectors,
		);
	}

	/** requests the dialog to close via its internal actions ref */
	requestClose = () => {
		this.context.actionsRef.current?.close();
	};
}
