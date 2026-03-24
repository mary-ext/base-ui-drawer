import { useCallback, useRef } from 'react';

import { useDrawerContext } from './drawer-context';
import { useDrag } from './use-drag';

/**
 * designates a region of the drawer as the drag handle for mouse/pen users.
 * renders a `<div>` element with no visual styling — the grab bar or any
 * other affordance is up to the consumer.
 */
export function DrawerHandle({ ref: userRef, children, ...rest }: React.ComponentPropsWithRef<'div'>) {
	const { state, actions, meta } = useDrawerContext();
	const handleRef = useRef<HTMLDivElement>(null);

	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			handleRef.current = node;
			if (typeof userRef === 'function') {
				userRef(node);
			} else if (userRef) {
				userRef.current = node;
			}
		},
		[userRef],
	);

	useDrag({
		open: state.open,
		scrollerRef: meta.scrollerRef,
		handleRef,
		setDragging: actions.setDragging,
	});

	return (
		<div ref={ref} data-dragging={state.dragging || undefined} {...rest}>
			{children}
		</div>
	);
}
