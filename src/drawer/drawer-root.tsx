import { Dialog } from '@base-ui/react/dialog';
import { useRefWithInit } from '@base-ui/utils/useRefWithInit';
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';

import { DrawerContext, type DrawerContextValue } from './drawer-context';
import { DrawerStore } from './drawer-store';
import type { SnapPointValue } from './resolve-snap-model';

export interface DrawerRootActions {
	/** smoothly scrolls the drawer to its largest snap point */
	expand: () => void;
	/** smoothly scrolls the drawer to its smallest snap point */
	collapse: () => void;
	/** smoothly scrolls the drawer to the snap point at the given index */
	snapTo: (index: number) => void;
	/** requests the dialog to close */
	requestClose: () => void;
}

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
	 * positions where the drawer can rest. numbers (0-1) are viewport fractions,
	 * strings are CSS units (e.g. `'72px'`, `'4rem'`).
	 * e.g. `[0.3, 0.6]` snaps to 30% and 60%, `['72px', 1]` snaps to 72px and 100%.
	 */
	snapPoints?: SnapPointValue[];
	/**
	 * position the drawer opens to initially. accepts the same format as `snapPoints`.
	 * defaults to the smallest snap point.
	 */
	defaultSnapPoint?: SnapPointValue;
	/** callback fired when the active snap point changes */
	onSnapPointChange?: (snapIndex: number) => void;
	/**
	 * whether the drawer is locked at its current snap position.
	 * when `true`, all positional user interaction is disabled — drag, scroll snap,
	 * escape, and click-outside dismiss. programmatic control via the `open` prop
	 * still works. useful during async operations where the drawer should not be
	 * dismissed until the operation completes.
	 * @default false
	 */
	locked?: boolean;
	/**
	 * a ref to imperative actions for controlling the drawer programmatically.
	 * exposes `expand`, `collapse`, `snapTo`, and `requestClose` methods.
	 */
	actionsRef?: React.RefObject<DrawerRootActions | null>;
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
		locked = false,
		actionsRef,
	} = props;

	const store = useRefWithInit(() => new DrawerStore({ open: defaultOpen, openProp })).current;

	// sync the controlled open prop into the store so that
	// store.useState('open') reflects the controlled value via the openProp ?? open selector
	store.useControlledProp('openProp', openProp);

	useImperativeHandle(
		actionsRef,
		() => ({
			expand: store.expand,
			collapse: store.collapse,
			snapTo: store.snapTo,
			requestClose: store.requestClose,
		}),
		[store],
	);

	const handleOpenChange = useCallback(
		(nextOpen: boolean, event: { reason: string }) => {
			// block user-initiated closes when locked
			if (!nextOpen && locked) {
				return;
			}
			store.set('open', nextOpen);
			onOpenChangeProp?.(nextOpen, event);
		},
		[store, onOpenChangeProp, locked],
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
			if (store.state.openProp ?? store.state.open) {
				onSnapPointChangeRef.current?.(snapIndex);
			}
		});
	}, [store]);

	const contextValue: DrawerContextValue = useMemo(
		() => ({ store, snapPoints, defaultSnapPoint, locked, modal }),
		[store, snapPoints, defaultSnapPoint, locked, modal],
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
