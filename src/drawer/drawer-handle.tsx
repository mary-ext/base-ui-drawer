import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useRef } from 'react';

import { useDrawerStore } from './drawer-context';
import { useDrag } from './use-drag';

/**
 * designates a region of the drawer as the drag handle for mouse/pen users.
 * renders a `<div>` element with no visual styling — the grab bar or any
 * other affordance is up to the consumer.
 */
export function DrawerHandle({ ref: userRef, children, ...rest }: React.ComponentPropsWithRef<'div'>) {
	const store = useDrawerStore();

	const dragging = store.useState('dragging');
	const open = store.useState('open');
	const setDragging = store.useStateSetter('dragging');

	const handleRef = useRef<HTMLDivElement>(null);
	const ref = useMergedRefs(handleRef, userRef);

	useDrag({
		open,
		scrollerRef: store.context.scrollerRef,
		handleRef,
		snapModelRef: store.context.snapModelRef,
		setDragging,
	});

	return (
		<div ref={ref} data-dragging={dragging || undefined} {...rest}>
			{children}
		</div>
	);
}
