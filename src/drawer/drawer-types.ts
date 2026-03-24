import type { useRender } from '@base-ui/react/use-render';

/**
 * base props type for drawer components that render a `<div>` element.
 * provides function-based `className`/`style` and the `render` prop,
 * matching Base UI's `BaseUIComponentProps` pattern.
 */
export type DrawerComponentProps<State> = Omit<React.ComponentPropsWithRef<'div'>, 'className' | 'style'> & {
	/** class name or a function that receives the component state and returns a class name */
	className?: string | ((state: State) => string | undefined);
	/** style object or a function that receives the component state and returns a style object */
	style?: React.CSSProperties | ((state: State) => React.CSSProperties | undefined);
	/**
	 * allows replacing the component's HTML element with a different tag,
	 * or composing it with another component.
	 *
	 * accepts a `ReactElement` or a function that returns the element to render.
	 */
	render?: useRender.RenderProp<State>;
};

/**
 * maps state properties to data-\* attributes.
 * mirrors Base UI's internal `StateAttributesMapping` which isn't publicly exported.
 */
export type StateAttributesMapping<State> = {
	[K in keyof State]?: (value: State[K]) => Record<string, string> | null;
};
