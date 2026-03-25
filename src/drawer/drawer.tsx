import { Dialog } from '@base-ui/react/dialog';

import { DrawerBackdrop } from './drawer-backdrop';
import { DrawerContent } from './drawer-content';
import { DrawerHandle } from './drawer-handle';
import { DrawerIndent } from './drawer-indent';
import { DrawerIndentBackground } from './drawer-indent-background';
import { DrawerPopup } from './drawer-popup';
import { DrawerRoot } from './drawer-root';

export { type DrawerContentState, type DrawerContentProps } from './drawer-content';
export { type DrawerHandleState, type DrawerHandleProps } from './drawer-handle';
export { type DrawerIndentState, type DrawerIndentProps } from './drawer-indent';
export {
	type DrawerIndentBackgroundState,
	type DrawerIndentBackgroundProps,
} from './drawer-indent-background';
export { type DrawerPopupProps } from './drawer-popup';
export { type DrawerRootActions, type DrawerRootProps } from './drawer-root';
export { type DrawerComponentProps } from './drawer-types';
export { type SnapPointValue } from './resolve-snap-model';

export const Drawer = {
	Root: DrawerRoot,
	Trigger: Dialog.Trigger,
	Portal: Dialog.Portal,
	Backdrop: DrawerBackdrop,
	Popup: DrawerPopup,
	Content: DrawerContent,
	Handle: DrawerHandle,
	Indent: DrawerIndent,
	IndentBackground: DrawerIndentBackground,
	Close: Dialog.Close,
	Title: Dialog.Title,
	Description: Dialog.Description,
};
