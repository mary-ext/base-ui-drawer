import { useEffect, useRef } from 'react';

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
}

const scrollSnapChangeSupported = typeof window !== 'undefined' && 'onscrollsnapchange' in window;

/**
 * detects when the scroller snaps to the top anchor (scrollTop === 0) and
 * dismisses the drawer. uses `scrollsnapchange` when available, falls back to
 * IntersectionObserver.
 *
 * also syncs `--drawer-scroll-progress` (0 = dismissed, 1 = fully open)
 * as inline styles on target elements (indent, backdrop, etc.).
 */
export function useScrollSnapDismiss(params: UseScrollSnapDismissParams) {
	const { open, scrollerRef, slideRef, topAnchorRef, progressTargets, requestClose, setSnapDismissed } =
		params;

	// rAF handle for scroll sync
	const syncerRef = useRef(0);
	// rolling buffer to detect when scroll stabilises
	const syncsRef = useRef(new Array<number>(10));
	const syncsIndexRef = useRef(0);
	const frameCountRef = useRef(0);

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
				if (scroller.scrollTop === 0) {
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
					if (!isVisible && !isIntersecting && scroller.scrollTop < slide.offsetHeight * 0.5) {
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
		const syncs = syncsRef.current;
		let listening = false;

		const addNumber = (num: number) => {
			syncs[syncsIndexRef.current] = num;
			syncsIndexRef.current = (syncsIndexRef.current + 1) % syncs.length;
		};

		const setProgress = (value: string) => {
			for (const ref of progressTargets) {
				ref.current?.style.setProperty(SCROLL_PROGRESS_VAR, value);
			}
		};

		const syncDrawer = () => {
			syncerRef.current = requestAnimationFrame(() => {
				// 0 = dismissed (scrollTop near 0), 1 = fully open (scrollTop near slideHeight)
				const progress = slide.offsetHeight > 0 ? scroller.scrollTop / slide.offsetHeight : 1;
				setProgress(String(Math.max(0, Math.min(1, progress))));

				// detect when scroll has stabilised at the open position
				if (syncs.every((v) => v === slide.offsetHeight)) {
					frameCountRef.current++;
				}

				if (frameCountRef.current >= 10) {
					frameCountRef.current = 0;
					syncsRef.current = new Array<number>(10);
					listening = false;
					scroller.addEventListener('scroll', onScroll, { once: true });
				} else {
					addNumber(scroller.scrollTop);
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
	}, [open, scrollerRef, slideRef, topAnchorRef, progressTargets, requestClose, setSnapDismissed]);
}
