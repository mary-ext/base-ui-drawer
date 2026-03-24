import { useRender } from '@base-ui/react/use-render';
import { useRef } from 'react';

import { useDrawerStore } from './drawer-context';
import type { DrawerComponentProps } from './drawer-types';
import { useDrag } from './use-drag';

// #region state

export type DrawerHandleState = {
	/** whether the user is currently dragging the drawer */
	dragging: boolean;
	/** whether the drawer is at its last (largest) snap point */
	expanded: boolean;
};

// #endregion

// #region props

export interface DrawerHandleProps extends DrawerComponentProps<DrawerHandleState> {}

// #endregion

/**
 * designates a region of the drawer as the drag handle for mouse/pen users.
 * renders a `<div>` element with no visual styling — the grab bar or any
 * other affordance is up to the consumer.
 */
export function DrawerHandle(props: DrawerHandleProps) {
	const { className: classNameProp, style: styleProp, render, ref, ...rest } = props;

	const store = useDrawerStore();

	const dragging = store.useState('dragging');
	const expanded = store.useState('expanded');
	const open = store.useState('open');
	const setDragging = store.useStateSetter('dragging');

	const handleRef = useRef<HTMLDivElement>(null);

	useDrag({
		open,
		scrollerRef: store.context.scrollerRef,
		handleRef,
		snapModelRef: store.context.snapModelRef,
		setDragging,
	});

	const state: DrawerHandleState = { dragging, expanded };

	const className = typeof classNameProp === 'function' ? classNameProp(state) : classNameProp;
	const style = typeof styleProp === 'function' ? styleProp(state) : styleProp;

	return useRender({
		defaultTagName: 'div',
		render,
		ref: ref ? [handleRef, ref] : handleRef,
		state,
		props: { className, style, ...rest },
	});
}

export declare namespace DrawerHandle {
	type State = DrawerHandleState;
	type Props = DrawerHandleProps;
}
