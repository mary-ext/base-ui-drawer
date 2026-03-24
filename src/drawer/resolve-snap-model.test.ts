import { describe, expect, test } from 'vitest';

import { resolveSnapModel, chooseSnapTarget } from './resolve-snap-model';

describe('resolveSnapModel', () => {
	test('falls back to maxScrollTop when no snap points provided', () => {
		const model = resolveSnapModel(1000, 800);
		expect(model.restingTops).toEqual([800]);
		expect(model.defaultTop).toBe(800);
	});

	test('resolves fractional snap points to pixel values', () => {
		const model = resolveSnapModel(1000, 950, [0.3, 0.6]);
		expect(model.restingTops).toEqual([300, 600]);
	});

	test('defaults to smallest snap point when defaultSnapPoint is omitted', () => {
		const model = resolveSnapModel(1000, 950, [0.3, 0.6]);
		expect(model.defaultTop).toBe(300);
	});

	test('respects explicit defaultSnapPoint', () => {
		const model = resolveSnapModel(1000, 950, [0.3, 0.6], 0.6);
		expect(model.defaultTop).toBe(600);
	});

	test('clamps snap points that exceed maxScrollTop', () => {
		const model = resolveSnapModel(1000, 800, [0.5, 0.95]);
		expect(model.restingTops).toEqual([500, 800]);
	});

	test('deduplicates snap points that clamp to the same value', () => {
		const model = resolveSnapModel(1000, 500, [0.8, 0.95]);
		// both clamp to 500
		expect(model.restingTops).toEqual([500]);
	});

	test('filters out zero and negative snap points', () => {
		const model = resolveSnapModel(1000, 800, [0, -0.5, 0.5]);
		expect(model.restingTops).toEqual([500]);
	});

	test('snaps defaultSnapPoint to nearest valid resting position', () => {
		const model = resolveSnapModel(1000, 950, [0.3, 0.6], 0.5);
		// 0.5 * 1000 = 500, nearest is 600 (distance 100) vs 300 (distance 200)
		expect(model.defaultTop).toBe(600);
	});
});

describe('chooseSnapTarget', () => {
	const candidates = [0, 300, 600];

	test('snaps to nearest candidate with zero velocity', () => {
		expect(chooseSnapTarget(280, 0, candidates, 600)).toBe(300);
		expect(chooseSnapTarget(100, 0, candidates, 600)).toBe(0);
		expect(chooseSnapTarget(500, 0, candidates, 600)).toBe(600);
	});

	test('velocity biases toward the direction of movement', () => {
		// at 280, without velocity nearest is 300
		// with strong downward velocity (negative), projects to 280 + (-2 * 140) = 0
		expect(chooseSnapTarget(280, -2, candidates, 600)).toBe(0);
	});

	test('clamps projected position to valid range', () => {
		// extreme positive velocity shouldn't project beyond maxScrollTop
		expect(chooseSnapTarget(100, 10, candidates, 600)).toBe(600);
		// extreme negative velocity shouldn't project below 0
		expect(chooseSnapTarget(100, -10, candidates, 600)).toBe(0);
	});
});
