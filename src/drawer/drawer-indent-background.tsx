import { useDrawerStore } from './drawer-context';

/**
 * a background element placed behind `Drawer.Indent`.
 * applies `data-active` when the drawer is open and `data-inactive` when closed.
 * renders a `<div>` element.
 */
export function DrawerIndentBackground(props: React.ComponentPropsWithRef<'div'>) {
	const { children, ...rest } = props;

	const store = useDrawerStore();
	const open = store.useState('open');

	return (
		<div data-active={open ? '' : undefined} data-inactive={open ? undefined : ''} {...rest}>
			{children}
		</div>
	);
}
