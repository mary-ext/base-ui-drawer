import { useEffect, useRef } from 'react';

interface UseDragParams {
	open: boolean;
	scrollerRef: React.RefObject<HTMLDivElement | null>;
	handleRef: React.RefObject<HTMLDivElement | null>;
	setDragging: (value: boolean) => void;
}

/**
 * mouse/pen drag handler for the drawer. attaches to a handle element so only
 * that region initiates drags. temporarily disables scroll snap during drag and
 * smooth-scrolls to the nearest snap point on release.
 *
 * touch users get native scroll snap behavior — this hook only activates for
 * non-touch pointer types.
 */
export function useDrag(params: UseDragParams) {
	const { open, scrollerRef, handleRef, setDragging } = params;

	const startYRef = useRef(0);
	const scrollStartRef = useRef(0);
	const accumulatedDragRef = useRef(0);
	const isDraggingRef = useRef(false);
	// tracks the scroll listener from reset() so cleanup can remove it
	const resetScrollHandlerRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (!open) {
			return;
		}

		const scroller = scrollerRef.current;
		const handle = handleRef.current;
		if (!scroller || !handle) {
			return;
		}

		const reset = () => {
			const scrollStart = scrollStartRef.current;
			const top = scroller.scrollTop < scrollStart * 0.5 ? 0 : scrollStart;

			const handleScroll = () => {
				if (scroller.scrollTop === top) {
					setDragging(false);
					isDraggingRef.current = false;
					scroller.removeEventListener('scroll', handleScroll);
					resetScrollHandlerRef.current = null;
				}
			};

			// clean up any previous reset listener before adding a new one
			if (resetScrollHandlerRef.current) {
				scroller.removeEventListener('scroll', resetScrollHandlerRef.current);
			}
			resetScrollHandlerRef.current = handleScroll;
			scroller.addEventListener('scroll', handleScroll);

			scroller.scrollTo({ top, behavior: 'smooth' });
			handleScroll();
		};

		const handleMove = (event: PointerEvent) => {
			accumulatedDragRef.current += Math.abs(event.clientY - startYRef.current);
			scroller.scrollTo({
				top: scrollStartRef.current - (event.clientY - startYRef.current),
				behavior: 'instant',
			});
		};

		const handleUp = () => {
			reset();
			document.removeEventListener('pointermove', handleMove);
			document.removeEventListener('pointerup', handleUp);
		};

		const handleDown = (event: PointerEvent) => {
			if (event.pointerType === 'touch') {
				return;
			}

			startYRef.current = event.clientY;
			scrollStartRef.current = scroller.scrollTop;
			accumulatedDragRef.current = 0;
			isDraggingRef.current = true;
			setDragging(true);

			document.addEventListener('pointermove', handleMove);
			document.addEventListener('pointerup', handleUp);
		};

		// prevent clicks from firing after a drag (e.g. on links or buttons)
		const handleClick = (event: MouseEvent) => {
			if (accumulatedDragRef.current > 5) {
				event.preventDefault();
			}
		};

		handle.addEventListener('pointerdown', handleDown);
		handle.addEventListener('click', handleClick);

		return () => {
			handle.removeEventListener('pointerdown', handleDown);
			handle.removeEventListener('click', handleClick);
			document.removeEventListener('pointermove', handleMove);
			document.removeEventListener('pointerup', handleUp);
			if (resetScrollHandlerRef.current) {
				scroller.removeEventListener('scroll', resetScrollHandlerRef.current);
				resetScrollHandlerRef.current = null;
			}
		};
	}, [open, scrollerRef, handleRef, setDragging]);
}
