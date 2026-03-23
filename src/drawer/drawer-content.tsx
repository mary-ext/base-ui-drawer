import { useDrawerContext } from './drawer-context';

/**
 * a container for the visible drawer contents.
 * mirrors state attributes from the popup for direct Tailwind styling.
 * renders a `<div>` element.
 */
export function DrawerContent(props: React.ComponentPropsWithRef<'div'>) {
	const { children, ...rest } = props;
	const { state } = useDrawerContext();

	return (
		<div
			data-drawer-content=""
			data-open={state.open ? '' : undefined}
			data-closed={state.open ? undefined : ''}
			data-dragging={state.dragging || undefined}
			data-snap-dismissed={state.snapDismissed || undefined}
			{...rest}
		>
			{children}
		</div>
	);
}
