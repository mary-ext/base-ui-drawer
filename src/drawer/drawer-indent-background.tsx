import { useRender } from '@base-ui/react/use-render';

import { useDrawerStore } from './drawer-context';
import { indentStateMapping } from './drawer-data-attributes';
import type { DrawerComponentProps } from './drawer-types';

// #region state

export type DrawerIndentBackgroundState = {
	/** whether the drawer is open */
	open: boolean;
};

// #endregion

// #region props

export interface DrawerIndentBackgroundProps extends DrawerComponentProps<DrawerIndentBackgroundState> {}

// #endregion

/**
 * a background element placed behind `Drawer.Indent`.
 * applies `data-active` when the drawer is open and `data-inactive` when closed.
 * renders a `<div>` element.
 */
export function DrawerIndentBackground(props: DrawerIndentBackgroundProps) {
	const { className: classNameProp, style: styleProp, render, ref, ...rest } = props;

	const store = useDrawerStore();
	const open = store.useState('open');

	const state: DrawerIndentBackgroundState = { open };

	const className = typeof classNameProp === 'function' ? classNameProp(state) : classNameProp;
	const style = typeof styleProp === 'function' ? styleProp(state) : styleProp;

	return useRender({
		defaultTagName: 'div',
		render,
		ref,
		state,
		stateAttributesMapping: indentStateMapping,
		props: { className, style, ...rest },
	});
}

export declare namespace DrawerIndentBackground {
	type State = DrawerIndentBackgroundState;
	type Props = DrawerIndentBackgroundProps;
}
