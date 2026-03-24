/** tolerance in pixels for scroll position comparisons */
export const SCROLL_EPSILON = 1;

export interface SnapModel {
	/** scroller.scrollHeight - scroller.clientHeight */
	maxScrollTop: number;
	/** valid resting scrollTop values (excludes dismiss=0), sorted ascending */
	restingTops: number[];
	/** scrollTop to scroll to on open */
	defaultTop: number;
}

/**
 * resolves fractional snap points (0-1 of viewport) into concrete pixel
 * scrollTop targets. when no snap points are provided, falls back to a
 * single resting position at maxScrollTop (fully open).
 *
 * @param viewportHeight the scroller's clientHeight
 * @param maxScrollTop scroller.scrollHeight - scroller.clientHeight
 * @param snapPoints fractions of viewport height (0-1)
 * @param defaultSnapPoint fraction to open to initially
 * @returns resolved snap model
 */
export function resolveSnapModel(
	viewportHeight: number,
	maxScrollTop: number,
	snapPoints?: number[],
	defaultSnapPoint?: number,
): SnapModel {
	const requested = (snapPoints ?? [])
		.filter((n) => n > 0)
		.map((n) => Math.min(Math.round(n * viewportHeight), maxScrollTop))
		.filter((top) => top > 0);

	const restingTops = [...new Set(requested)].sort((a, b) => a - b);

	if (restingTops.length === 0) {
		return { maxScrollTop, restingTops: [maxScrollTop], defaultTop: maxScrollTop };
	}

	const rawDefault =
		defaultSnapPoint != null
			? Math.min(Math.max(Math.round(defaultSnapPoint * viewportHeight), 0), maxScrollTop)
			: restingTops[0];

	// snap defaultTop to the nearest valid resting position
	const defaultTop = restingTops.reduce((best, top) =>
		Math.abs(top - rawDefault) < Math.abs(best - rawDefault) ? top : best,
	);

	return { maxScrollTop, restingTops, defaultTop };
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
