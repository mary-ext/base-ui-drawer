import { Dialog } from '@base-ui/react/dialog';
import { useCallback, useMemo, useRef, useState } from 'react';

import { DrawerContext, type DrawerContextValue } from './drawer-context';

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
	} = props;

	const actionsRef = useRef<Dialog.Root.Actions>(null);
	const scrollerRef = useRef<HTMLDivElement>(null);
	const slideRef = useRef<HTMLDivElement>(null);
	const topAnchorRef = useRef<HTMLDivElement>(null);
	const indentRef = useRef<HTMLDivElement>(null);
	const backdropRef = useRef<HTMLDivElement>(null);

	const [open, setOpen] = useState(openProp ?? defaultOpen);
	const [dragging, setDragging] = useState(false);
	const [snapDismissed, setSnapDismissed] = useState(false);

	const handleOpenChange = useCallback(
		(nextOpen: boolean, event: { reason: string }) => {
			setOpen(nextOpen);
			onOpenChangeProp?.(nextOpen, event);
		},
		[onOpenChangeProp],
	);

	const handleOpenChangeComplete = useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen) {
				setSnapDismissed(false);
			}
			onOpenChangeCompleteProp?.(nextOpen);
		},
		[onOpenChangeCompleteProp],
	);

	const requestClose = useCallback(() => {
		actionsRef.current?.close();
	}, []);

	const contextValue: DrawerContextValue = useMemo(
		() => ({
			state: { open, dragging, snapDismissed },
			actions: { requestClose, setDragging, setSnapDismissed },
			meta: { scrollerRef, slideRef, topAnchorRef, indentRef, backdropRef },
		}),
		[open, dragging, snapDismissed, requestClose],
	);

	return (
		<DrawerContext value={contextValue}>
			<Dialog.Root
				open={openProp}
				defaultOpen={defaultOpen}
				onOpenChange={handleOpenChange}
				onOpenChangeComplete={handleOpenChangeComplete}
				modal={modal}
				actionsRef={actionsRef}
				disablePointerDismissal
			>
				{children}
			</Dialog.Root>
		</DrawerContext>
	);
}
