import { ownerDocument } from '@base-ui/utils/owner';
import { useEffect, useRef } from 'react';

import { type SnapModel, SCROLL_EPSILON, chooseSnapTarget } from './resolve-snap-model';

interface UseDragParams {
	open: boolean;
	locked: boolean;
	scrollerRef: React.RefObject<HTMLDivElement | null>;
	handleRef: React.RefObject<HTMLDivElement | null>;
	snapModelRef: React.RefObject<SnapModel | null>;
	setDragging: (value: boolean) => void;
}

interface PointerSample {
	y: number;
	time: number;
}

// how far back (ms) to look when computing release velocity
const VELOCITY_WINDOW = 80;

/**
 * mouse/pen drag handler for the drawer. attaches to a handle element so only
 * that region initiates drags. temporarily disables scroll snap during drag and
 * smooth-scrolls to the nearest snap point on release.
 *
 * touch users get native scroll snap behavior — this hook only activates for
 * non-touch pointer types.
 */
export function useDrag(params: UseDragParams) {
	const { open, locked, scrollerRef, handleRef, snapModelRef, setDragging } = params;

	const startYRef = useRef(0);
	const scrollStartRef = useRef(0);
	const accumulatedDragRef = useRef(0);
	const isDraggingRef = useRef(false);
	const resetScrollHandlerRef = useRef<(() => void) | null>(null);
	const samplesRef = useRef<PointerSample[]>([]);

	useEffect(() => {
		if (!open || locked) {
			return;
		}

		const scroller = scrollerRef.current;
		const handle = handleRef.current;
		if (!scroller || !handle) {
			return;
		}

		const doc = ownerDocument(handle);

		const computeVelocity = (): number => {
			const samples = samplesRef.current;
			if (samples.length < 2) {
				return 0;
			}
			const now = samples[samples.length - 1];
			// find the oldest sample within the velocity window
			let oldest = now;
			for (let i = samples.length - 2; i >= 0; i--) {
				if (now.time - samples[i].time > VELOCITY_WINDOW) {
					break;
				}
				oldest = samples[i];
			}
			const dt = now.time - oldest.time;
			if (dt === 0) {
				return 0;
			}
			// positive velocity = pointer moving down = scrollTop decreasing (closing)
			// we want scroll velocity: positive = scrollTop increasing (opening)
			// pointer dy > 0 means pointer moved down → closing → negative scroll velocity
			const pointerDy = now.y - oldest.y;
			return -pointerDy / dt;
		};

		const reset = () => {
			const model = snapModelRef.current;
			const velocity = computeVelocity();

			let top: number;
			if (model) {
				const candidates = [0, ...model.restingTops];
				top = chooseSnapTarget(scroller.scrollTop, velocity, candidates, model.maxScrollTop);
			} else {
				// fallback: binary open/close
				const scrollStart = scrollStartRef.current;
				top = scroller.scrollTop < scrollStart * 0.5 ? 0 : scrollStart;
			}

			const handleScroll = () => {
				if (Math.abs(scroller.scrollTop - top) <= SCROLL_EPSILON) {
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

			samplesRef.current.push({ y: event.clientY, time: event.timeStamp });
			const cutoff = event.timeStamp - VELOCITY_WINDOW * 2;
			while (samplesRef.current.length > 0 && samplesRef.current[0].time < cutoff) {
				samplesRef.current.shift();
			}

			scroller.scrollTo({
				top: scrollStartRef.current - (event.clientY - startYRef.current),
				behavior: 'instant',
			});
		};

		const handleUp = () => {
			reset();
			doc.removeEventListener('pointermove', handleMove);
			doc.removeEventListener('pointerup', handleUp);
		};

		const handleDown = (event: PointerEvent) => {
			if (event.pointerType === 'touch') {
				return;
			}

			startYRef.current = event.clientY;
			scrollStartRef.current = scroller.scrollTop;
			accumulatedDragRef.current = 0;
			samplesRef.current = [{ y: event.clientY, time: event.timeStamp }];
			isDraggingRef.current = true;
			setDragging(true);

			doc.addEventListener('pointermove', handleMove);
			doc.addEventListener('pointerup', handleUp);
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
			doc.removeEventListener('pointermove', handleMove);
			doc.removeEventListener('pointerup', handleUp);
			if (isDraggingRef.current) {
				setDragging(false);
				isDraggingRef.current = false;
			}
			if (resetScrollHandlerRef.current) {
				scroller.removeEventListener('scroll', resetScrollHandlerRef.current);
				resetScrollHandlerRef.current = null;
			}
		};
	}, [open, locked, scrollerRef, handleRef, snapModelRef, setDragging]);
}
