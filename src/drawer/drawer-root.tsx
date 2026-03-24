import { Dialog } from '@base-ui/react/dialog';
import { useRefWithInit } from '@base-ui/utils/useRefWithInit';
import { useCallback, useMemo } from 'react';

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
	} = props;

	const store = useRefWithInit(() => new DrawerStore({ open: defaultOpen })).current;

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
