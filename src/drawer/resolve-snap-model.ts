/** tolerance in pixels for scroll position comparisons */
export const SCROLL_EPSILON = 1;

/** a snap point value — number (0-1) for viewport fractions, string for CSS units like `'72px'` or `'4rem'` */
export type SnapPointValue = number | string;

export interface SnapModel {
	/** scroller.scrollHeight - scroller.clientHeight */
	maxScrollTop: number;
	/** valid resting scrollTop values (excludes dismiss=0), sorted ascending */
	restingTops: number[];
	/** scrollTop to scroll to on open */
	defaultTop: number;
}

/**
 * resolves a single snap point value to a pixel scrollTop target.
 * numbers 0-1 are treated as viewport fractions; strings are parsed as CSS units.
 *
 * @param value the snap point value
 * @param viewportHeight the scroller's clientHeight
 * @returns pixel value, or 0 if unparseable
 */
function resolveSnapValue(value: SnapPointValue, viewportHeight: number): number {
	if (typeof value === 'number') {
		return Math.round(value * viewportHeight);
	}

	const num = parseFloat(value);
	if (Number.isNaN(num)) {
		return 0;
	}

	if (value.endsWith('rem')) {
		const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
		return Math.round(num * fontSize);
	}

	// px, or bare number — treat as pixels
	return Math.round(num);
}

/**
 * resolves snap points into concrete pixel scrollTop targets.
 * accepts viewport fractions (0-1) and CSS unit strings (`'72px'`, `'4rem'`).
 * when no snap points are provided, falls back to a single resting position
 * at maxScrollTop (fully open).
 *
 * @param viewportHeight the scroller's clientHeight
 * @param maxScrollTop scroller.scrollHeight - scroller.clientHeight
 * @param snapPoints viewport fractions or CSS unit strings
 * @param defaultSnapPoint initial snap position
 * @returns resolved snap model
 */
export function resolveSnapModel(
	viewportHeight: number,
	maxScrollTop: number,
	snapPoints?: SnapPointValue[],
	defaultSnapPoint?: SnapPointValue,
): SnapModel {
	const requested = (snapPoints ?? [])
		.map((point) => Math.min(resolveSnapValue(point, viewportHeight), maxScrollTop))
		.filter((top) => top > 0);

	const restingTops = [...new Set(requested)].sort((a, b) => a - b);

	if (restingTops.length === 0) {
		return { maxScrollTop, restingTops: [maxScrollTop], defaultTop: maxScrollTop };
	}

	const rawDefault =
		defaultSnapPoint != null
			? Math.min(Math.max(resolveSnapValue(defaultSnapPoint, viewportHeight), 0), maxScrollTop)
			: restingTops[0];

	// snap defaultTop to the nearest valid resting position
	const defaultTop = restingTops.reduce((best, top) =>
		Math.abs(top - rawDefault) < Math.abs(best - rawDefault) ? top : best,
	);

	return { maxScrollTop, restingTops, defaultTop };
}

/**
 * finds the index of the resting position closest to a given scroll position.
 *
 * @param position current scrollTop
 * @param restingTops sorted array of valid resting positions
 * @returns index into restingTops
 */
export function findClosestSnapIndex(position: number, restingTops: number[]): number {
	let closest = 0;
	let closestDist = Math.abs(position - restingTops[0]);
	for (let i = 1; i < restingTops.length; i++) {
		const dist = Math.abs(position - restingTops[i]);
		if (dist < closestDist) {
			closest = i;
			closestDist = dist;
		}
	}
	return closest;
}

/**
 * chooses the best snap target after a drag release, factoring in velocity.
 * projects the current position forward using velocity, then picks the
 * nearest candidate.
 *
 * @param currentTop current scrollTop
 * @param velocityPxPerMs scroll velocity (positive = scrolling down / opening)
 * @param candidates all valid resting positions including 0 (dismiss)
 * @param maxScrollTop upper bound
 * @returns the scrollTop to snap to
 */
export function chooseSnapTarget(
	currentTop: number,
	velocityPxPerMs: number,
	candidates: number[],
	maxScrollTop: number,
): number {
	// project forward 140ms to bias toward the direction of movement
	const projected = Math.min(maxScrollTop, Math.max(0, currentTop + velocityPxPerMs * 140));

	return candidates.reduce((best, top) =>
		Math.abs(top - projected) < Math.abs(best - projected) ? top : best,
	);
}
