import { Dialog } from '@base-ui/react/dialog';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useDrawerContext } from './drawer-context';
import { type SnapModel, findClosestSnapIndex, resolveSnapModel } from './resolve-snap-model';
import { useScrollSnapDismiss } from './use-scroll-snap-dismiss';

// #region constants

const SNAP_ANCHOR_SIZE = 50;

// #endregion

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

const scrollerNoSnapStyle: React.CSSProperties = {
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
	zIndex: 10,
};

const snapAnchorBaseStyle: React.CSSProperties = {
	position: 'absolute',
	left: 0,
	right: 0,
	height: SNAP_ANCHOR_SIZE,
	scrollSnapAlign: 'end',
};

// #endregion

export interface DrawerPopupProps extends React.ComponentProps<typeof Dialog.Popup> {}

/**
 * a container for the drawer contents with scroll snap mechanics.
 * renders a `<div>` element via Dialog.Popup.
 */
export function DrawerPopup(props: DrawerPopupProps) {
	const { children, style, initialFocus, ...rest } = props;

	const { store, snapPoints, defaultSnapPoint } = useDrawerContext();
	const { scrollerRef, slideRef, topAnchorRef, indentRef, backdropRef, snapModelRef } = store.context;
	const popupRef = useRef<HTMLDivElement>(null);
	const open = store.useState('open');
	const dragging = store.useState('dragging');
	const snapDismissed = store.useState('snapDismissed');
	const setSnapDismissed = store.useStateSetter('snapDismissed');
	const setSnapIndex = store.useStateSetter('snapIndex');
	const setExpanded = store.useStateSetter('expanded');

	const progressTargets = useMemo(() => [indentRef, backdropRef], [indentRef, backdropRef]);

	const [snapModel, setSnapModel] = useState<SnapModel | null>(null);
	// scroll-snap is disabled until the browser has accepted the initial scroll position.
	// enabling snap dynamically causes the browser to re-evaluate snap positions, which
	// can override our scrollTop — so we delay re-enablement to after the first paint.
	const [snapReady, setSnapReady] = useState(false);
	const hasOpenedRef = useRef(false);

	// scroll snap dismiss detection + progress sync
	useScrollSnapDismiss({
		open,
		scrollerRef,
		slideRef,
		topAnchorRef,
		progressTargets,
		requestClose: store.requestClose,
		setSnapDismissed,
		setSnapIndex,
		setExpanded,
		snapModelRef,
	});

	// compute snap model synchronously before paint so anchors render correctly.
	// ResizeObserver continues to update the model on subsequent resize events.
	useIsoLayoutEffect(() => {
		if (!open) {
			snapModelRef.current = null;
			setSnapModel(null);
			setSnapReady(false);
			hasOpenedRef.current = false;
			store.set('snapIndex', 0);
			store.set('expanded', true);
			return;
		}

		const scroller = scrollerRef.current;
		const slide = slideRef.current;
		if (!scroller || !slide) {
			return;
		}

		let prevViewportHeight = 0;
		let prevMaxScrollTop = 0;

		const update = () => {
			const viewportHeight = scroller.clientHeight;
			const maxScrollTop = Math.min(scroller.scrollHeight - viewportHeight, slide.offsetHeight);
			if (maxScrollTop <= 0) {
				return;
			}

			// skip recomputation when inputs haven't changed
			if (viewportHeight === prevViewportHeight && maxScrollTop === prevMaxScrollTop) {
				return;
			}
			prevViewportHeight = viewportHeight;
			prevMaxScrollTop = maxScrollTop;

			const next = resolveSnapModel(viewportHeight, maxScrollTop, snapPoints, defaultSnapPoint);

			snapModelRef.current = next;
			setSnapModel((prev) => {
				if (
					prev &&
					prev.maxScrollTop === next.maxScrollTop &&
					prev.defaultTop === next.defaultTop &&
					prev.restingTops.length === next.restingTops.length &&
					prev.restingTops.every((v, i) => v === next.restingTops[i])
				) {
					return prev;
				}
				return next;
			});
		};

		update();

		const observer = new ResizeObserver(update);
		observer.observe(scroller);
		observer.observe(slide);

		return () => {
			observer.disconnect();
		};
	}, [open, scrollerRef, slideRef, snapPoints, defaultSnapPoint, snapModelRef]);

	// scroll to default snap position once the model is ready and anchors are committed.
	useIsoLayoutEffect(() => {
		if (!open || !snapModel || hasOpenedRef.current) {
			return;
		}

		const scroller = scrollerRef.current;
		if (!scroller) {
			return;
		}

		scroller.scrollTop = snapModel.defaultTop;
		hasOpenedRef.current = true;

		// set initial snap index from the default position
		const { restingTops } = snapModel;
		const closest = findClosestSnapIndex(snapModel.defaultTop, restingTops);
		store.set('snapIndex', closest);
		store.set('expanded', closest === restingTops.length - 1);
	}, [open, snapModel, scrollerRef, store]);

	// enable scroll-snap AFTER the first paint so the browser doesn't override
	// our programmatic scrollTop with a snap correction.
	useEffect(() => {
		if (!open || !snapModel || snapReady) {
			return;
		}
		if (hasOpenedRef.current) {
			requestAnimationFrame(() => {
				setSnapReady(true);
			});
		}
	}, [open, snapModel, snapReady]);

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

	// disable scroll-snap during drag and during initial positioning
	const scrollerActiveStyle = dragging || !snapReady ? scrollerNoSnapStyle : scrollerStyle;

	return (
		<Dialog.Popup
			{...rest}
			ref={popupRef}
			initialFocus={initialFocus ?? popupRef}
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
			<div ref={scrollerRef} onClick={handleScrollerClick} style={scrollerActiveStyle}>
				<div ref={slideRef} style={slideStyle}>
					<div style={anchorsStyle}>
						{/* dismiss anchor — above the slide */}
						<div ref={topAnchorRef} style={{ ...snapAnchorBaseStyle, top: -SNAP_ANCHOR_SIZE }} />
						{/* snap point anchors — only rendered once model is resolved */}
						{snapModel &&
							snapModel.restingTops.map((top) => (
								<div key={top} style={{ ...snapAnchorBaseStyle, top: top - SNAP_ANCHOR_SIZE }} />
							))}
					</div>
					{children}
				</div>
				<div style={spacerStyle} />
			</div>
		</Dialog.Popup>
	);
}
