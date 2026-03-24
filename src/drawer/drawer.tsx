import { Dialog } from '@base-ui/react/dialog';

import { DrawerBackdrop } from './drawer-backdrop';
import { DrawerContent } from './drawer-content';
import { DrawerHandle } from './drawer-handle';
import { DrawerIndent } from './drawer-indent';
import { DrawerIndentBackground } from './drawer-indent-background';
import { DrawerPopup } from './drawer-popup';
import { DrawerRoot } from './drawer-root';

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
