import { Dialog } from '@base-ui/react/dialog';
import { useRefWithInit } from '@base-ui/utils/useRefWithInit';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { DrawerContext, type DrawerContextValue } from './drawer-context';
import { DrawerStore } from './drawer-store';

export interface DrawerRootProps {
	children: React.ReactNode;
	/** whether the drawer is currently open (controlled) */
	open?: boolean;
	/** whether the drawer is initially open (uncontrolled) */
	defaultOpen?: boolean;
	/** event handler called when the drawer is opened or closed */
	onOpenChange?: (open: boolean, event: { reason: string }) => void;
	/** event handler called after any animations complete when the drawer is opened or closed */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * determines if the drawer enters a modal state when open.
	 * @default true
	 */
	modal?: boolean | 'trap-focus';
	/**
	 * fractions of viewport height (0-1) where the drawer can rest.
	 * e.g. `[0.3, 0.6]` means the drawer snaps to 30% and 60% of viewport.
	 */
	snapPoints?: number[];
	/**
	 * fraction of viewport height (0-1) the drawer opens to initially.
	 * defaults to the largest snap point.
	 */
	defaultSnapPoint?: number;
	/** callback fired when the active snap point changes */
	onSnapPointChange?: (snapIndex: number) => void;
}

/**
 * groups all parts of the drawer.
 * doesn't render its own HTML element.
 */
export function DrawerRoot(props: DrawerRootProps) {
	const {
		children,
		open: openProp,
		defaultOpen = false,
		onOpenChange: onOpenChangeProp,
		onOpenChangeComplete: onOpenChangeCompleteProp,
		modal = true,
		snapPoints,
		defaultSnapPoint,
		onSnapPointChange,
	} = props;

	const store = useRefWithInit(() => new DrawerStore({ open: defaultOpen, openProp })).current;

	// sync the controlled open prop into the store so that
	// store.useState('open') reflects the controlled value via the openProp ?? open selector
	store.useControlledProp('openProp', openProp);

	const handleOpenChange = useCallback(
		(nextOpen: boolean, event: { reason: string }) => {
			store.set('open', nextOpen);
			onOpenChangeProp?.(nextOpen, event);
		},
		[store, onOpenChangeProp],
	);

	const handleOpenChangeComplete = useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen) {
				store.set('snapDismissed', false);
			}
			onOpenChangeCompleteProp?.(nextOpen);
		},
		[store, onOpenChangeCompleteProp],
	);

	// observe snapIndex changes without subscribing DrawerRoot to re-renders.
	// observe() fires the listener immediately on subscription (skipped via isFirst),
	// then on every subsequent change.
	const onSnapPointChangeRef = useRef(onSnapPointChange);
	onSnapPointChangeRef.current = onSnapPointChange;

	useEffect(() => {
		let isFirst = true;
		return store.observe('snapIndex', (snapIndex: number) => {
			if (isFirst) {
				isFirst = false;
				return;
			}
			if (store.state.open) {
				onSnapPointChangeRef.current?.(snapIndex);
			}
		});
	}, [store]);

	const contextValue: DrawerContextValue = useMemo(
		() => ({ store, snapPoints, defaultSnapPoint }),
		[store, snapPoints, defaultSnapPoint],
	);

	return (
		<DrawerContext value={contextValue}>
			<Dialog.Root
				open={openProp}
				defaultOpen={defaultOpen}
				onOpenChange={handleOpenChange}
				onOpenChangeComplete={handleOpenChangeComplete}
				modal={modal}
				actionsRef={store.context.actionsRef}
				disablePointerDismissal
			>
				{children}
			</Dialog.Root>
		</DrawerContext>
	);
}
