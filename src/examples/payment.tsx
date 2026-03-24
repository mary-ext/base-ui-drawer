import { CircleCheck, CreditCard, LoaderCircle, ShoppingBag, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Drawer } from '../drawer/drawer';

// #region data

interface CartItem {
	emoji: string;
	name: string;
	price: number;
	qty: number;
}

const cartItems: CartItem[] = [
	{ emoji: '🎧', name: 'Wireless Headphones', price: 79.99, qty: 1 },
	{ emoji: '🔌', name: 'USB-C Cable', price: 12.99, qty: 2 },
	{ emoji: '📱', name: 'Phone Case', price: 24.99, qty: 1 },
];

const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
const shipping = 5.99;
const tax = +(subtotal * 0.0835).toFixed(2);
const total = +(subtotal + shipping + tax).toFixed(2);

function formatPrice(n: number): string {
	return `$${n.toFixed(2)}`;
}

const breakdown = [
	{ label: 'Subtotal', value: subtotal },
	{ label: 'Shipping', value: shipping },
	{ label: 'Tax', value: tax },
];

// #endregion

type Status = 'idle' | 'processing' | 'success';

function CartItemRow({ item, detail }: { item: CartItem; detail: string }) {
	return (
		<div className="flex items-center gap-3">
			<span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
				{item.emoji}
			</span>
			<div className="flex flex-1 flex-col">
				<span className="text-sm font-medium">{item.name}</span>
				<span className="text-sm text-muted-foreground">{detail}</span>
			</div>
			<span className="text-sm font-medium">{formatPrice(item.price * item.qty)}</span>
		</div>
	);
}

// #region payment example

export function PaymentExample() {
	const [open, setOpen] = useState(false);
	const [status, setStatus] = useState<Status>('idle');
	const timerRef = useRef(0);

	const handlePay = () => {
		setStatus('processing');
		timerRef.current = window.setTimeout(() => {
			setStatus('success');
			timerRef.current = window.setTimeout(() => {
				setOpen(false);
			}, 1500);
		}, 2500);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen && status === 'processing') {
			return;
		}
		setOpen(nextOpen);
	};

	const handleOpenChangeComplete = (nextOpen: boolean) => {
		if (!nextOpen) {
			// reset after close animation finishes
			window.clearTimeout(timerRef.current);
			setStatus('idle');
		}
	};

	return (
		<Drawer.Root
			open={open}
			onOpenChange={handleOpenChange}
			onOpenChangeComplete={handleOpenChangeComplete}
			snapPoints={[0.4, 0.85]}
			locked={status === 'processing'}
		>
			<Drawer.IndentBackground className="fixed inset-0 bg-black" />
			<Drawer.Indent className="relative grid min-h-svh w-full origin-[center_top] translate-y-0 scale-100 place-items-center content-center gap-8 bg-background p-8 duration-[calc(500ms*var(--t)),calc(250ms*var(--t))] will-change-transform [--p:var(--drawer-scroll-progress)] [--r:calc(var(--radius-xl)*var(--p))] [--t:calc(1-clamp(0,calc((1-var(--p))*100000),1))] [transition:scale_0.5s_cubic-bezier(0.32,0.72,0,1),translate_0.5s_cubic-bezier(0.32,0.72,0,1),border-radius_0.25s_cubic-bezier(0.32,0.72,0,1)] data-active:translate-y-[calc(12px*var(--p))] data-active:scale-[calc(1-0.04*var(--p))] data-active:overflow-hidden data-active:rounded-(--r)">
				<div className="flex flex-col items-center gap-2">
					<h1 className="text-5xl font-bold sm:text-7xl">payment</h1>
					<p className="text-lg text-muted-foreground">locked drawer during checkout</p>
				</div>

				{/* cart preview */}
				<div className="flex w-full max-w-sm flex-col gap-4">
					<div className="flex flex-col gap-3 rounded-xl border border-border p-4">
						{cartItems.map((item) => (
							<CartItemRow key={item.name} item={item} detail={`${formatPrice(item.price)} × ${item.qty}`} />
						))}
					</div>

					<Drawer.Trigger className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-foreground px-8 py-4 text-background hover:opacity-90">
						<ShoppingBag size={20} />
						Checkout {formatPrice(total)}
					</Drawer.Trigger>
				</div>
			</Drawer.Indent>

			<Drawer.Portal>
				<Drawer.Backdrop className="fixed inset-0 bg-black opacity-[calc(0.5*var(--drawer-scroll-progress))] transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0" />
				<Drawer.Popup className="group transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-snap-dismissed:transition-none!">
					<Drawer.Content className="relative z-2 mx-auto flex h-full w-135 max-w-full flex-col overflow-clip rounded-t-2xl bg-card pt-14 text-card-foreground transition-[translate] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-ending-style:translate-y-full group-data-starting-style:translate-y-full data-snap-dismissed:transition-none!">
						{/* handle */}
						<Drawer.Handle className="absolute inset-x-0 top-0 z-5 flex shrink-0 flex-col items-center rounded-t-2xl bg-card pt-2 pb-2 select-none">
							<span className="mb-2 h-1 w-9 cursor-grab rounded-full bg-muted-foreground/30" />
							<div className="flex w-full items-center justify-between px-4">
								<Drawer.Title className="m-0 text-base font-semibold">Checkout</Drawer.Title>
								<Drawer.Close
									className={`-mr-1 cursor-pointer border-0 bg-transparent p-1 text-muted-foreground hover:text-foreground ${status !== 'idle' ? 'invisible' : ''}`}
								>
									<X size={20} />
								</Drawer.Close>
							</div>
						</Drawer.Handle>

						<Drawer.Description className="sr-only">order checkout</Drawer.Description>

						{/* order items */}
						<div className="flex flex-col gap-3 px-4 pb-4">
							{cartItems.map((item) => (
								<CartItemRow key={item.name} item={item} detail={`Qty: ${item.qty}`} />
							))}
						</div>

						{/* breakdown */}
						<div className="flex flex-col gap-2 border-t border-border px-4 pt-4 pb-4">
							{breakdown.map((row) => (
								<div key={row.label} className="flex justify-between text-sm text-muted-foreground">
									<span>{row.label}</span>
									<span>{formatPrice(row.value)}</span>
								</div>
							))}
						</div>

						{/* payment method */}
						<div className="flex items-center gap-3 border-t border-border px-4 pt-4 pb-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
								<CreditCard size={20} className="text-muted-foreground" />
							</div>
							<div className="flex flex-1 flex-col">
								<span className="text-sm font-medium">Visa ending in 4242</span>
								<span className="text-sm text-muted-foreground">Expires 12/27</span>
							</div>
						</div>

						{/* total + pay button */}
						<div className="sticky bottom-0 flex flex-col gap-3 border-t border-border bg-card px-4 pt-4 pb-4">
							<div className="flex justify-between text-base font-semibold">
								<span>Total</span>
								<span>{formatPrice(total)}</span>
							</div>
							<button
								type="button"
								onClick={handlePay}
								disabled={status !== 'idle'}
								className="w-full cursor-pointer rounded-lg bg-foreground py-3.5 text-base font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
							>
								Pay {formatPrice(total)}
							</button>
						</div>

						{/* processing / success overlay */}
						{status !== 'idle' && (
							<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-t-2xl bg-card/95 opacity-100 transition-opacity duration-300 starting:opacity-0">
								{status === 'processing' && (
									<>
										<LoaderCircle size={48} className="animate-spin text-foreground" />
										<p className="text-lg font-medium">Processing payment...</p>
										<p className="text-sm text-muted-foreground">Do not close this screen</p>
									</>
								)}
								{status === 'success' && (
									<>
										<CircleCheck size={48} className="text-emerald-500" />
										<p className="text-lg font-medium">Payment complete!</p>
										<p className="text-sm text-muted-foreground">Thank you for your order</p>
									</>
								)}
							</div>
						)}
					</Drawer.Content>
				</Drawer.Popup>
			</Drawer.Portal>
		</Drawer.Root>
	);
}

// #endregion
