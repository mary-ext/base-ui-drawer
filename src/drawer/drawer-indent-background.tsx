import { useDrawerContext } from './drawer-context';

/**
 * a background element placed behind `Drawer.Indent`.
 * applies `data-active` when the drawer is open and `data-inactive` when closed.
 * renders a `<div>` element.
 */
export function DrawerIndentBackground(props: React.ComponentPropsWithRef<'div'>) {
	const { children, ...rest } = props;
	const { state } = useDrawerContext();

	return (
		<div data-active={state.open ? '' : undefined} data-inactive={state.open ? undefined : ''} {...rest}>
			{children}
		</div>
	);
}
