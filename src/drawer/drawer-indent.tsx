import { useCallback } from 'react';

import { useDrawerContext } from './drawer-context';

/**
 * a wrapper element for your main UI that receives state when a drawer is open.
 * applies `data-active` when the drawer is open and `data-inactive` when closed.
 * receives `--drawer-scroll-progress` as an inline style (0 = dismissed, 1 = fully open).
 * renders a `<div>` element.
 */
export function DrawerIndent({ ref: userRef, children, style, ...rest }: React.ComponentPropsWithRef<'div'>) {
	const { state, meta } = useDrawerContext();

	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			meta.indentRef.current = node;
			if (typeof userRef === 'function') {
				userRef(node);
			} else if (userRef) {
				userRef.current = node;
			}
		},
		[meta.indentRef, userRef],
	);

	return (
		<div
			ref={ref}
			data-active={state.open ? '' : undefined}
			data-inactive={state.open ? undefined : ''}
			style={{
				'--drawer-scroll-progress': '1',
				...style,
			}}
			{...rest}
		>
			{children}
		</div>
	);
}
