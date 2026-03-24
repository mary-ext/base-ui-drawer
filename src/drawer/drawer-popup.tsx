import { Dialog } from '@base-ui/react/dialog';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useMemo } from 'react';

import { useDrawerStore } from './drawer-context';
import { useScrollSnapDismiss } from './use-scroll-snap-dismiss';

// #region structural styles (functional only, no visual styling)

const scrollerStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	height: '100%',
	width: '100%',
	overflowY: 'auto',
	overscrollBehavior: 'none',
	scrollSnapType: 'y mandatory',
};

const scrollerDraggingStyle: React.CSSProperties = {
	...scrollerStyle,
	scrollSnapType: 'none',
};

const spacerStyle: React.CSSProperties = {
	order: -1,
	height: '100svh',
	width: '100%',
	flex: '1 0 100svh',
};

const slideStyle: React.CSSProperties = {
	position: 'relative',
	width: '100%',
	maxHeight: '95%',
	flexShrink: 0,
};

const anchorsStyle: React.CSSProperties = {
	pointerEvents: 'none',
	position: 'absolute',
	inset: 0,
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
	zIndex: 10,
};

const anchorStyle: React.CSSProperties = {
	height: 50,
	width: '100%',
	scrollSnapAlign: 'end',
};

const topAnchorStyle: React.CSSProperties = {
	...anchorStyle,
	translate: '0 -100%',
};

// #endregion

export interface DrawerPopupProps extends React.ComponentProps<typeof Dialog.Popup> {}

/**
 * a container for the drawer contents with scroll snap mechanics.
 * renders a `<div>` element via Dialog.Popup.
 */
export function DrawerPopup(props: DrawerPopupProps) {
	const { children, style, ...rest } = props;

	const store = useDrawerStore();
	const { scrollerRef, slideRef, topAnchorRef, indentRef, backdropRef } = store.context;
	const open = store.useState('open');
	const dragging = store.useState('dragging');
	const snapDismissed = store.useState('snapDismissed');
	const setSnapDismissed = store.useStateSetter('snapDismissed');

	const progressTargets = useMemo(() => [indentRef, backdropRef], [indentRef, backdropRef]);

	// scroll snap dismiss detection + progress sync
	useScrollSnapDismiss({
		open,
		scrollerRef,
		slideRef,
		topAnchorRef,
		progressTargets,
		requestClose: store.requestClose,
		setSnapDismissed,
	});

	// scroll to bottom (open position) when the drawer opens
	useIsoLayoutEffect(() => {
		if (!open) {
			return;
		}

		const scroller = scrollerRef.current;
		if (scroller) {
			scroller.scrollTop = scroller.scrollHeight;
		}
	}, [open, scrollerRef]);

	// dismiss when clicking outside the drawer content (sides, above, spacer).
	// also ignore clicks when a nested dialog is open (the parent popup gets
	// data-nested-dialog-open, and clicks in the nested area shouldn't dismiss the parent).
	const handleScrollerClick = (event: React.MouseEvent) => {
		if (!(event.target instanceof HTMLElement)) {
			return;
		}
		// don't dismiss if a nested dialog is open
		const popup = event.currentTarget.parentElement;
		if (popup?.hasAttribute('data-nested-dialog-open')) {
			return;
		}
		if (!event.target.closest('[data-drawer-content]')) {
			store.requestClose();
		}
	};

	return (
		<Dialog.Popup
			{...rest}
			data-snap-dismissed={snapDismissed || undefined}
			data-dragging={dragging || undefined}
			style={{
				position: 'fixed',
				inset: 0,
				margin: 0,
				padding: 0,
				border: 'none',
				background: 'transparent',
				maxWidth: 'unset',
				maxHeight: 'unset',
				width: 'unset',
				height: 'unset',
				overflow: 'hidden',
				...style,
			}}
		>
			<div
				ref={scrollerRef}
				onClick={handleScrollerClick}
				style={dragging ? scrollerDraggingStyle : scrollerStyle}
			>
				<div ref={slideRef} style={slideStyle}>
					<div style={anchorsStyle}>
						<div ref={topAnchorRef} style={topAnchorStyle} />
						<div style={anchorStyle} />
					</div>
					{children}
				</div>
				<div style={spacerStyle} />
			</div>
		</Dialog.Popup>
	);
}
