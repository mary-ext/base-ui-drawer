import { Dialog } from '@base-ui/react/dialog';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';

import { useDrawerStore } from './drawer-context';

type BackdropProps = React.ComponentProps<typeof Dialog.Backdrop>;

/**
 * an overlay displayed beneath the popup.
 * receives `--drawer-scroll-progress` as an inline style (0 = dismissed, 1 = fully open).
 * renders a `<div>` element.
 */
export function DrawerBackdrop({ ref: userRef, style, ...rest }: BackdropProps) {
	const store = useDrawerStore();
	const ref = useMergedRefs(store.context.backdropRef, userRef);

	return <Dialog.Backdrop ref={ref} style={style} {...rest} />;
}
