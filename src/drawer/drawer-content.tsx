import { useDrawerStore } from './drawer-context';

/**
 * a container for the visible drawer contents.
 * mirrors state attributes from the popup for direct Tailwind styling.
 * renders a `<div>` element.
 */
export function DrawerContent(props: React.ComponentPropsWithRef<'div'>) {
	const { children, ...rest } = props;

	const store = useDrawerStore();

	const open = store.useState('open');
	const dragging = store.useState('dragging');
	const snapDismissed = store.useState('snapDismissed');

	return (
		<div
			data-drawer-content=""
			data-open={open ? '' : undefined}
			data-closed={open ? undefined : ''}
			data-dragging={dragging || undefined}
			data-snap-dismissed={snapDismissed || undefined}
			{...rest}
		>
			{children}
		</div>
	);
}
