// #region content

export const DrawerContentDataAttributes = {
	/** present when the drawer is open */
	open: 'data-open',
	/** present when the drawer is closed */
	closed: 'data-closed',
	/** present when the user is dragging the drawer */
	dragging: 'data-dragging',
	/** present when the drawer is at its last (largest) snap point */
	expanded: 'data-expanded',
	/** present when the close was initiated by scroll snap */
	snapDismissed: 'data-snap-dismissed',
	/** marker attribute identifying the content element */
	drawerContent: 'data-drawer-content',
} as const;

// #endregion

// #region handle

export const DrawerHandleDataAttributes = {
	/** present when the user is dragging the drawer */
	dragging: 'data-dragging',
	/** present when the drawer is at its last (largest) snap point */
	expanded: 'data-expanded',
} as const;

// #endregion

// #region indent

export const DrawerIndentDataAttributes = {
	/** present when the drawer is open */
	active: 'data-active',
	/** present when the drawer is closed */
	inactive: 'data-inactive',
} as const;

const INDENT_ACTIVE_HOOK = { [DrawerIndentDataAttributes.active]: '' };
const INDENT_INACTIVE_HOOK = { [DrawerIndentDataAttributes.inactive]: '' };

/** shared state→data-attr mapping for indent and indent-background */
export const indentStateMapping = {
	open(value: boolean) {
		if (value) {
			return INDENT_ACTIVE_HOOK;
		}
		return INDENT_INACTIVE_HOOK;
	},
};

// #endregion
