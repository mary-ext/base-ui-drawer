import { useEffect, useRef } from 'react';

import { type SnapModel, SCROLL_EPSILON } from './resolve-snap-model';

const SCROLL_PROGRESS_VAR = '--drawer-scroll-progress';

interface UseScrollSnapDismissParams {
	open: boolean;
	scrollerRef: React.RefObject<HTMLDivElement | null>;
	slideRef: React.RefObject<HTMLDivElement | null>;
	topAnchorRef: React.RefObject<HTMLDivElement | null>;
	/** additional elements to receive `--drawer-scroll-progress` inline style updates */
	progressTargets: React.RefObject<HTMLElement | null>[];
	requestClose: () => void;
	setSnapDismissed: (value: boolean) => void;
	snapModelRef: React.RefObject<SnapModel | null>;
}

const scrollSnapChangeSupported = typeof window !== 'undefined' && 'onscrollsnapchange' in window;

/**
 * detects when the scroller snaps to the top anchor (scrollTop near 0) and
 * dismisses the drawer. uses `scrollsnapchange` when available, falls back to
 * IntersectionObserver.
 *
 * also syncs `--drawer-scroll-progress` (0 = dismissed, 1 = fully open)
 * as inline styles on target elements (indent, backdrop, etc.).
 */
export function useScrollSnapDismiss(params: UseScrollSnapDismissParams) {
	const {
		open,
		scrollerRef,
		slideRef,
		topAnchorRef,
		progressTargets,
		requestClose,
		setSnapDismissed,
		snapModelRef,
	} = params;

	// rAF handle for scroll sync
	const syncerRef = useRef(0);
	// consecutive frames where scroll has been stable
	const stableCountRef = useRef(0);
	const lastScrollTopRef = useRef(-1);

	useEffect(() => {
		if (!open) {
			return;
		}

		const scroller = scrollerRef.current;
		const slide = slideRef.current;
		const topAnchor = topAnchorRef.current;
		if (!scroller || !slide) {
			return;
		}

		// -- scrollsnapchange detection --
		let handleSnapChange: (() => void) | null = null;
		if (scrollSnapChangeSupported) {
			handleSnapChange = () => {
				if (scroller.scrollTop <= SCROLL_EPSILON) {
					setSnapDismissed(true);
					requestClose();
				}
			};
			scroller.addEventListener('scrollsnapchange', handleSnapChange);
		}

		// -- IntersectionObserver fallback --
		let observer: IntersectionObserver | null = null;
		if (!scrollSnapChangeSupported && topAnchor) {
			observer = new IntersectionObserver(
				(entries) => {
					const { isIntersecting, intersectionRatio } = entries[0];
					const isVisible = intersectionRatio === 1;
					if (!isVisible && !isIntersecting && scroller.scrollTop <= SCROLL_EPSILON) {
						setSnapDismissed(true);
						requestClose();
						observer?.disconnect();
					}
				},
				{
					root: scroller,
					rootMargin: '0px 0px -1px 0px',
					threshold: 1.0,
				},
			);
			observer.observe(topAnchor);
		}

		// -- scroll progress sync --
		// sets --drawer-scroll-progress on target elements as an inline style.
		// value ranges from 0 (dismissed) to 1 (fully open).
		let listening = false;

		const setProgress = (value: string) => {
			for (const ref of progressTargets) {
				ref.current?.style.setProperty(SCROLL_PROGRESS_VAR, value);
			}
		};

		const syncDrawer = () => {
			syncerRef.current = requestAnimationFrame(() => {
				const maxScrollTop = snapModelRef.current?.maxScrollTop ?? slide.offsetHeight;
				const progress = maxScrollTop > 0 ? scroller.scrollTop / maxScrollTop : 1;
				setProgress(String(Math.max(0, Math.min(1, progress))));

				// detect when scroll has stabilised at any resting position
				if (Math.abs(scroller.scrollTop - lastScrollTopRef.current) <= SCROLL_EPSILON) {
					stableCountRef.current++;
				} else {
					stableCountRef.current = 0;
				}
				lastScrollTopRef.current = scroller.scrollTop;

				if (stableCountRef.current >= 10) {
					stableCountRef.current = 0;
					lastScrollTopRef.current = -1;
					listening = false;
					scroller.addEventListener('scroll', onScroll, { once: true });
				} else {
					syncDrawer();
				}
			});
		};

		const onScroll = () => {
			if (!listening) {
				listening = true;
				syncDrawer();
			}
		};

		scroller.addEventListener('scroll', onScroll, { once: true });

		return () => {
			if (handleSnapChange) {
				scroller.removeEventListener('scrollsnapchange', handleSnapChange);
			}
			observer?.disconnect();
			if (syncerRef.current) {
				cancelAnimationFrame(syncerRef.current);
			}
			scroller.removeEventListener('scroll', onScroll);
			setProgress('0');
		};
	}, [
		open,
		scrollerRef,
		slideRef,
		topAnchorRef,
		progressTargets,
		requestClose,
		setSnapDismissed,
		snapModelRef,
	]);
}
