import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import { Drawer } from './drawer';

// #region test fixtures

function TestDrawer(props: {
	snapPoints?: number[];
	defaultSnapPoint?: number;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, event: { reason: string }) => void;
	onOpenChangeComplete?: (open: boolean) => void;
	onSnapPointChange?: (snapIndex: number) => void;
	contentHeight?: number;
}) {
	const { contentHeight = 800, ...rootProps } = props;

	return (
		<Drawer.Root {...rootProps}>
			<Drawer.Trigger data-testid="trigger">open</Drawer.Trigger>
			<Drawer.Portal>
				<Drawer.Backdrop data-testid="backdrop" />
				<Drawer.Popup data-testid="popup">
					<Drawer.Content data-testid="content">
						<Drawer.Handle data-testid="handle" />
						<Drawer.Title>title</Drawer.Title>
						<Drawer.Description>description</Drawer.Description>
						<div style={{ height: contentHeight }} />
						<Drawer.Close data-testid="close">close</Drawer.Close>
					</Drawer.Content>
				</Drawer.Popup>
			</Drawer.Portal>
		</Drawer.Root>
	);
}

// #endregion

// #region helpers

function getScroller(): HTMLElement {
	const el = document.querySelector('[data-testid="popup"]')?.firstElementChild;
	if (!(el instanceof HTMLElement)) {
		throw new Error('scroller not found — is the drawer open?');
	}
	return el;
}

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function waitForStableScroll(scroller: HTMLElement, timeout = 2000): Promise<number> {
	return new Promise((resolve, reject) => {
		const start = Date.now();
		let lastScrollTop = -1;
		let stableFrames = 0;
		const check = () => {
			if (Math.abs(scroller.scrollTop - lastScrollTop) <= 1) {
				stableFrames++;
			} else {
				stableFrames = 0;
			}
			lastScrollTop = scroller.scrollTop;
			if (stableFrames >= 5) {
				resolve(Math.round(scroller.scrollTop));
				return;
			}
			if (Date.now() - start > timeout) {
				reject(new Error(`scroll did not stabilize, last scrollTop: ${scroller.scrollTop}`));
				return;
			}
			requestAnimationFrame(check);
		};
		check();
	});
}

interface DragStep {
	type: 'down' | 'move' | 'up';
	y: number;
	delay?: number;
}

/**
 * simulates a timed pointer drag on the drawer handle. dispatches pointer
 * events with real inter-step delays so the velocity calculation in useDrag
 * sees accurate timestamps.
 *
 * @param handle the handle element (pointerdown target)
 * @param steps sequence of pointer events with optional delays between them
 */
async function simulateDrag(handle: HTMLElement, steps: DragStep[]) {
	const doc = handle.ownerDocument;

	for (const step of steps) {
		if (step.delay) {
			// oxlint-disable-next-line no-await-in-loop
			await wait(step.delay);
		}

		const eventType =
			step.type === 'down' ? 'pointerdown' : step.type === 'move' ? 'pointermove' : 'pointerup';
		const target = step.type === 'down' ? handle : doc;

		target.dispatchEvent(
			new PointerEvent(eventType, {
				clientX: 100,
				clientY: step.y,
				pointerId: 1,
				pointerType: 'mouse',
				bubbles: true,
				button: step.type === 'down' ? 0 : -1,
				buttons: step.type === 'up' ? 0 : 1,
			}),
		);
	}
}

// #endregion

describe('drawer', () => {
	test('opens on trigger click and closes on escape', async () => {
		render(<TestDrawer />);
		const trigger = page.getByTestId('trigger');

		await trigger.click();
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');

		await userEvent.keyboard('{Escape}');
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	test('opens with defaultOpen', async () => {
		render(<TestDrawer defaultOpen />);
		await expect.element(page.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'true');
	});

	test('closes via the Close button', async () => {
		render(<TestDrawer defaultOpen contentHeight={100} />);
		await expect.element(page.getByTestId('content')).toBeVisible();

		await page.getByTestId('close').click();
		await expect.element(page.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'false');
	});

	test('fires onOpenChange callback', async () => {
		const onOpenChange = vi.fn();
		render(<TestDrawer onOpenChange={onOpenChange} />);
		const trigger = page.getByTestId('trigger');

		await trigger.click();
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(onOpenChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: expect.any(String) }));

		await userEvent.keyboard('{Escape}');
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: expect.any(String) }));
	});

	test('opens on mount with controlled open={true}', async () => {
		render(<TestDrawer open snapPoints={[0.3, 0.6]} />);
		await expect.element(page.getByTestId('content')).toBeVisible();

		const scroller = getScroller();
		const scrollTop = await waitForStableScroll(scroller);
		const expected = Math.round(0.3 * scroller.clientHeight);

		expect(Math.abs(scrollTop - expected)).toBeLessThanOrEqual(2);
	});

	test('recovers from blocked dismiss when open is locked true', async () => {
		render(<TestDrawer open snapPoints={[0.3, 0.6]} />);
		await expect.element(page.getByTestId('content')).toBeVisible();

		const handle = document.querySelector('[data-testid="handle"]') as HTMLElement;
		const scroller = getScroller();
		await waitForStableScroll(scroller);

		const handleRect = handle.getBoundingClientRect();
		const startY = handleRect.top + handleRect.height / 2;

		// drag down far enough to dismiss
		const dragDistance = Math.round(0.3 * scroller.clientHeight * 0.7);
		await simulateDrag(handle, [
			{ type: 'down', y: startY },
			{ type: 'move', y: startY + 1, delay: 30 },
			{ type: 'move', y: startY + dragDistance, delay: 30 },
			{ type: 'up', y: startY + dragDistance, delay: 30 },
		]);

		// drawer should recover to the default snap point
		const scrollTop = await waitForStableScroll(scroller);
		const expected = Math.round(0.3 * scroller.clientHeight);
		expect(Math.abs(scrollTop - expected)).toBeLessThanOrEqual(2);

		// snapDismissed should be cleared
		const popup = document.querySelector('[data-testid="popup"]') as HTMLElement;
		expect(popup.hasAttribute('data-snap-dismissed')).toBe(false);
	});
});

describe('snap points', () => {
	test('opens at the smallest snap point by default', async () => {
		render(<TestDrawer snapPoints={[0.3, 0.6]} />);

		await page.getByTestId('trigger').click();
		await expect.element(page.getByTestId('content')).toBeVisible();

		const scroller = getScroller();
		const scrollTop = await waitForStableScroll(scroller);
		const expected = Math.round(0.3 * scroller.clientHeight);

		expect(Math.abs(scrollTop - expected)).toBeLessThanOrEqual(2);
	});

	test('opens at explicit defaultSnapPoint', async () => {
		render(<TestDrawer snapPoints={[0.3, 0.6]} defaultSnapPoint={0.6} />);

		await page.getByTestId('trigger').click();
		await expect.element(page.getByTestId('content')).toBeVisible();

		const scroller = getScroller();
		const scrollTop = await waitForStableScroll(scroller);
		const expected = Math.round(0.6 * scroller.clientHeight);

		expect(Math.abs(scrollTop - expected)).toBeLessThanOrEqual(2);
	});

	test('renders correct number of snap anchors', async () => {
		render(<TestDrawer snapPoints={[0.3, 0.6]} />);

		await page.getByTestId('trigger').click();
		await expect.element(page.getByTestId('content')).toBeVisible();

		const scroller = getScroller();
		const anchors = scroller.querySelectorAll('[style*="scroll-snap-align"]');
		// 1 dismiss anchor + 2 snap point anchors
		expect(anchors.length).toBe(3);
	});

	test('without snap points, opens at full height', async () => {
		render(<TestDrawer />);

		await page.getByTestId('trigger').click();
		await expect.element(page.getByTestId('content')).toBeVisible();

		const scroller = getScroller();
		const scrollTop = await waitForStableScroll(scroller);
		const slide = scroller.firstElementChild as HTMLElement;
		const maxScrollTop = Math.min(scroller.scrollHeight - scroller.clientHeight, slide.offsetHeight);

		expect(Math.abs(scrollTop - maxScrollTop)).toBeLessThanOrEqual(2);
	});

	test('clamps snap points that exceed max drawer height', async () => {
		render(<TestDrawer snapPoints={[0.3, 0.99]} defaultSnapPoint={0.99} />);

		await page.getByTestId('trigger').click();
		await expect.element(page.getByTestId('content')).toBeVisible();

		const scroller = getScroller();
		const scrollTop = await waitForStableScroll(scroller);
		const slide = scroller.firstElementChild as HTMLElement;
		const maxScrollTop = Math.min(scroller.scrollHeight - scroller.clientHeight, slide.offsetHeight);

		expect(Math.abs(scrollTop - maxScrollTop)).toBeLessThanOrEqual(2);
	});
});

describe('drag interactions', () => {
	test('sets data-dragging on handle during drag', async () => {
		render(<TestDrawer defaultOpen snapPoints={[0.4, 0.9]} />);
		await expect.element(page.getByTestId('content')).toBeVisible();

		const handle = document.querySelector('[data-testid="handle"]') as HTMLElement;
		const scroller = getScroller();
		await waitForStableScroll(scroller);

		expect(handle.hasAttribute('data-dragging')).toBe(false);

		await simulateDrag(handle, [{ type: 'down', y: 500 }]);
		await expect.poll(() => handle.hasAttribute('data-dragging')).toBe(true);

		await simulateDrag(handle, [{ type: 'up', y: 500 }]);
		await waitForStableScroll(scroller);
		expect(handle.hasAttribute('data-dragging')).toBe(false);
	});

	test('ignores touch pointer events (native scroll-snap handles those)', async () => {
		render(<TestDrawer defaultOpen snapPoints={[0.4, 0.9]} />);
		await expect.element(page.getByTestId('content')).toBeVisible();

		const handle = document.querySelector('[data-testid="handle"]') as HTMLElement;
		const scroller = getScroller();
		await waitForStableScroll(scroller);

		handle.dispatchEvent(
			new PointerEvent('pointerdown', {
				clientX: 100,
				clientY: 500,
				pointerId: 1,
				pointerType: 'touch',
				bubbles: true,
				button: 0,
				buttons: 1,
			}),
		);

		// touch should not trigger dragging state
		expect(handle.hasAttribute('data-dragging')).toBe(false);
	});

	test('drags from smaller snap point to larger snap point', async () => {
		render(<TestDrawer defaultOpen snapPoints={[0.3, 0.8]} />);
		await expect.element(page.getByTestId('content')).toBeVisible();

		const handle = document.querySelector('[data-testid="handle"]') as HTMLElement;
		const scroller = getScroller();
		const startScrollTop = await waitForStableScroll(scroller);
		const viewportHeight = scroller.clientHeight;
		const target08 = Math.round(0.8 * viewportHeight);

		// the handle is near the top of the visible drawer area
		const handleRect = handle.getBoundingClientRect();
		const startY = handleRect.top + handleRect.height / 2;

		// drag up by enough to cross the midpoint between 0.3 and 0.8
		const dragDistance = (target08 - startScrollTop) * 0.7;
		await simulateDrag(handle, [
			{ type: 'down', y: startY },
			{ type: 'move', y: startY - 1, delay: 30 },
			{ type: 'move', y: startY - dragDistance, delay: 30 },
			{ type: 'up', y: startY - dragDistance, delay: 30 },
		]);

		const finalScrollTop = await waitForStableScroll(scroller);
		expect(Math.abs(finalScrollTop - target08)).toBeLessThanOrEqual(2);
	});

	test('snaps back to current point on small drag', async () => {
		render(<TestDrawer defaultOpen snapPoints={[0.3, 0.8]} />);
		await expect.element(page.getByTestId('content')).toBeVisible();

		const handle = document.querySelector('[data-testid="handle"]') as HTMLElement;
		const scroller = getScroller();
		await waitForStableScroll(scroller);
		const target03 = Math.round(0.3 * scroller.clientHeight);

		const handleRect = handle.getBoundingClientRect();
		const startY = handleRect.top + handleRect.height / 2;

		// small drag that doesn't cross the midpoint — should snap back
		await simulateDrag(handle, [
			{ type: 'down', y: startY },
			{ type: 'move', y: startY - 1, delay: 50 },
			{ type: 'move', y: startY - 30, delay: 50 },
			{ type: 'up', y: startY - 30, delay: 50 },
		]);

		const finalScrollTop = await waitForStableScroll(scroller);
		expect(Math.abs(finalScrollTop - target03)).toBeLessThanOrEqual(2);
	});

	test('drag down from snap point dismisses the drawer', async () => {
		render(<TestDrawer snapPoints={[0.3, 0.8]} />);
		const trigger = page.getByTestId('trigger');

		await trigger.click();
		await expect.element(page.getByTestId('content')).toBeVisible();

		const handle = document.querySelector('[data-testid="handle"]') as HTMLElement;
		const scroller = getScroller();
		await waitForStableScroll(scroller);

		const handleRect = handle.getBoundingClientRect();
		const startY = handleRect.top + handleRect.height / 2;

		// drag down far enough to dismiss (past midpoint between 0.3 and 0)
		const dragDistance = Math.round(0.3 * scroller.clientHeight * 0.7);
		await simulateDrag(handle, [
			{ type: 'down', y: startY },
			{ type: 'move', y: startY + 1, delay: 30 },
			{ type: 'move', y: startY + dragDistance, delay: 30 },
			{ type: 'up', y: startY + dragDistance, delay: 30 },
		]);

		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	test('fast flick biases snap target in flick direction', async () => {
		render(<TestDrawer defaultOpen snapPoints={[0.3, 0.8]} />);
		await expect.element(page.getByTestId('content')).toBeVisible();

		const handle = document.querySelector('[data-testid="handle"]') as HTMLElement;
		const scroller = getScroller();
		await waitForStableScroll(scroller);
		const viewportHeight = scroller.clientHeight;
		const target08 = Math.round(0.8 * viewportHeight);

		const handleRect = handle.getBoundingClientRect();
		const startY = handleRect.top + handleRect.height / 2;

		// fast flick: small distance but very quick (high velocity)
		// even though distance is small, velocity should bias toward 0.8
		await simulateDrag(handle, [
			{ type: 'down', y: startY },
			{ type: 'move', y: startY - 1, delay: 5 },
			{ type: 'move', y: startY - 80, delay: 5 },
			{ type: 'up', y: startY - 80, delay: 5 },
		]);

		const finalScrollTop = await waitForStableScroll(scroller);
		expect(Math.abs(finalScrollTop - target08)).toBeLessThanOrEqual(2);
	});
});

describe('expanded state', () => {
	test('content does not have data-expanded at a smaller snap point', async () => {
		render(<TestDrawer snapPoints={[0.3, 0.8]} />);

		await page.getByTestId('trigger').click();
		await expect.element(page.getByTestId('content')).toBeVisible();

		const scroller = getScroller();
		await waitForStableScroll(scroller);

		const content = document.querySelector('[data-testid="content"]') as HTMLElement;
		expect(content.hasAttribute('data-expanded')).toBe(false);
	});

	test('content gets data-expanded at the last snap point', async () => {
		render(<TestDrawer defaultOpen snapPoints={[0.3, 0.8]} />);
		await expect.element(page.getByTestId('content')).toBeVisible();

		const handle = document.querySelector('[data-testid="handle"]') as HTMLElement;
		const scroller = getScroller();
		await waitForStableScroll(scroller);

		const handleRect = handle.getBoundingClientRect();
		const startY = handleRect.top + handleRect.height / 2;

		// fast flick up to expand
		await simulateDrag(handle, [
			{ type: 'down', y: startY },
			{ type: 'move', y: startY - 1, delay: 5 },
			{ type: 'move', y: startY - 80, delay: 5 },
			{ type: 'up', y: startY - 80, delay: 5 },
		]);

		await waitForStableScroll(scroller);

		const content = document.querySelector('[data-testid="content"]') as HTMLElement;
		await expect.poll(() => content.hasAttribute('data-expanded')).toBe(true);
	});

	test('without snap points, content always has data-expanded', async () => {
		render(<TestDrawer defaultOpen />);
		await expect.element(page.getByTestId('content')).toBeVisible();

		const scroller = getScroller();
		await waitForStableScroll(scroller);

		const content = document.querySelector('[data-testid="content"]') as HTMLElement;
		expect(content.hasAttribute('data-expanded')).toBe(true);
	});

	test('fires onSnapPointChange when snap index changes via drag', async () => {
		const onSnapPointChange = vi.fn();
		render(<TestDrawer defaultOpen snapPoints={[0.3, 0.8]} onSnapPointChange={onSnapPointChange} />);
		await expect.element(page.getByTestId('content')).toBeVisible();

		const handle = document.querySelector('[data-testid="handle"]') as HTMLElement;
		const scroller = getScroller();
		await waitForStableScroll(scroller);

		const handleRect = handle.getBoundingClientRect();
		const startY = handleRect.top + handleRect.height / 2;

		// fast flick up to expand to second snap point
		await simulateDrag(handle, [
			{ type: 'down', y: startY },
			{ type: 'move', y: startY - 1, delay: 5 },
			{ type: 'move', y: startY - 80, delay: 5 },
			{ type: 'up', y: startY - 80, delay: 5 },
		]);

		await waitForStableScroll(scroller);
		await expect.poll(() => onSnapPointChange.mock.calls.length).toBeGreaterThan(0);
		expect(onSnapPointChange).toHaveBeenCalledWith(1);
	});
});
