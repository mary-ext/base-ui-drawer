import { useRender } from '@base-ui/react/use-render';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';

import { useDrawerStore } from './drawer-context';
import { indentStateMapping } from './drawer-data-attributes';
import type { DrawerComponentProps } from './drawer-types';

// #region state

export type DrawerIndentState = {
	/** whether the drawer is open */
	open: boolean;
};

// #endregion

// #region props

export interface DrawerIndentProps extends DrawerComponentProps<DrawerIndentState> {}

// #endregion

/**
 * a wrapper element for your main UI that receives state when a drawer is open.
 * applies `data-active` when the drawer is open and `data-inactive` when closed.
 * receives `--drawer-scroll-progress` as an inline style (0 = dismissed, 1 = fully open).
 * renders a `<div>` element.
 */
export function DrawerIndent(props: DrawerIndentProps) {
	const { className: classNameProp, style: styleProp, render, ref: userRef, ...rest } = props;

	const store = useDrawerStore();
	const open = store.useState('open');

	const ref = useMergedRefs(store.context.indentRef, userRef);

	const state: DrawerIndentState = { open };

	const className = typeof classNameProp === 'function' ? classNameProp(state) : classNameProp;
	const userStyle = typeof styleProp === 'function' ? styleProp(state) : styleProp;

	return useRender({
		defaultTagName: 'div',
		render,
		ref,
		state,
		stateAttributesMapping: indentStateMapping,
		props: {
			className,
			style: userStyle,
			...rest,
		},
	});
}

export declare namespace DrawerIndent {
	type State = DrawerIndentState;
	type Props = DrawerIndentProps;
}
