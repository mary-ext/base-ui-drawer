import { useMergedRefs } from '@base-ui/utils/useMergedRefs';

import { useDrawerStore } from './drawer-context';

/**
 * a wrapper element for your main UI that receives state when a drawer is open.
 * applies `data-active` when the drawer is open and `data-inactive` when closed.
 * receives `--drawer-scroll-progress` as an inline style (0 = dismissed, 1 = fully open).
 * renders a `<div>` element.
 */
export function DrawerIndent({ ref: userRef, children, style, ...rest }: React.ComponentPropsWithRef<'div'>) {
	const store = useDrawerStore();
	const open = store.useState('open');

	const ref = useMergedRefs(store.context.indentRef, userRef);

	return (
		<div
			ref={ref}
			data-active={open ? '' : undefined}
			data-inactive={open ? undefined : ''}
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
