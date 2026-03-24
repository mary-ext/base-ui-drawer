import { useRender } from '@base-ui/react/use-render';

import { useDrawerStore } from './drawer-context';
import { DrawerContentDataAttributes } from './drawer-data-attributes';
import type { DrawerComponentProps, StateAttributesMapping } from './drawer-types';

// #region state

export type DrawerContentState = {
	/** whether the drawer is open */
	open: boolean;
	/** whether the user is currently dragging the drawer */
	dragging: boolean;
	/** whether the drawer is at its last (largest) snap point */
	expanded: boolean;
	/** whether the close was initiated by scroll snap */
	snapDismissed: boolean;
};

// #endregion

// #region props

export interface DrawerContentProps extends DrawerComponentProps<DrawerContentState> {}

// #endregion

// #region state attributes mapping

const OPEN_HOOK = { [DrawerContentDataAttributes.open]: '' };
const CLOSED_HOOK = { [DrawerContentDataAttributes.closed]: '' };
const SNAP_DISMISSED_HOOK = { [DrawerContentDataAttributes.snapDismissed]: '' };

const stateAttributesMapping = {
	open(value) {
		if (value) {
			return OPEN_HOOK;
		}
		return CLOSED_HOOK;
	},
	snapDismissed(value) {
		if (value) {
			return SNAP_DISMISSED_HOOK;
		}
		return null;
	},
} satisfies StateAttributesMapping<DrawerContentState>;

// #endregion

/**
 * a container for the visible drawer contents.
 * exposes drawer state via data attributes and function-based `className`/`style`.
 * renders a `<div>` element.
 */
export function DrawerContent(props: DrawerContentProps) {
	const { className: classNameProp, style: styleProp, render, ref, ...rest } = props;

	const store = useDrawerStore();

	const open = store.useState('open');
	const dragging = store.useState('dragging');
	const expanded = store.useState('expanded');
	const snapDismissed = store.useState('snapDismissed');

	const state: DrawerContentState = { open, dragging, expanded, snapDismissed };

	const className = typeof classNameProp === 'function' ? classNameProp(state) : classNameProp;
	const style = typeof styleProp === 'function' ? styleProp(state) : styleProp;

	return useRender({
		defaultTagName: 'div',
		render,
		ref,
		state,
		stateAttributesMapping,
		props: {
			[DrawerContentDataAttributes.drawerContent]: '',
			className,
			style,
			...rest,
		},
	});
}

export declare namespace DrawerContent {
	type State = DrawerContentState;
	type Props = DrawerContentProps;
}
