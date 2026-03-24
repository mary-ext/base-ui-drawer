import { Dialog } from '@base-ui/react/dialog';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';

import { useDrawerStore } from './drawer-context';

type BackdropProps = React.ComponentProps<typeof Dialog.Backdrop>;
type BackdropState = Dialog.Backdrop.State;

/**
 * an overlay displayed beneath the popup.
 * receives `--drawer-scroll-progress` as an inline style (0 = dismissed, 1 = fully open).
 * renders a `<div>` element.
 */
export function DrawerBackdrop({ ref: userRef, style: userStyle, ...rest }: BackdropProps) {
	const store = useDrawerStore();
	const ref = useMergedRefs(store.context.backdropRef, userRef);

	// the CSS variable augmentation on CSSProperties conflicts with Base UI's
	// union style prop type, so we need the assertion here
	const style = (
		typeof userStyle === 'function'
			? (state: BackdropState) => ({ '--drawer-scroll-progress': '1', ...userStyle(state) })
			: { '--drawer-scroll-progress': '1', ...userStyle }
	) as BackdropProps['style'];

	return <Dialog.Backdrop ref={ref} style={style} {...rest} />;
}
