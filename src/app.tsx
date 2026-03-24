import { ArrowDownWideNarrow, ChevronDown, Heart, ThumbsDown, User, X } from 'lucide-react';
import { useState } from 'react';

import { Drawer } from './drawer/drawer';

interface Comment {
	id: string;
	name: string;
	avatar: string;
	text: string;
	time: string;
	likes: number;
	liked: boolean;
	replies?: Comment[];
}

const initialComments: Comment[] = [
	{
		id: '1',
		name: 'noodleking42',
		avatar: '🍜',
		text: 'bro really said "meal prep" and then ate the whole thing in one sitting 💀',
		time: '03-14',
		likes: 8364,
		liked: true,
		replies: [
			{
				id: '1a',
				name: 'carbloadqueen',
				avatar: '🍝',
				text: 'yes, make the food and eat it all right away',
				time: '03-14',
				likes: 216,
				liked: false,
			},
			{
				id: '1b',
				name: 'xion',
				avatar: '🗡️',
				text: 'prepping meals',
				time: '03-14',
				likes: 13,
				liked: false,
			},
		],
	},
	{
		id: '2',
		name: 'KVCHAM',
		avatar: '🌿',
		text: 'so you can add food dye but seasoning is too much?',
		time: '03-14',
		likes: 5091,
		liked: false,
		replies: [
			{
				id: '2a',
				name: 'spicelordd',
				avatar: '🌶️',
				text: 'the garlic powder was RIGHT THERE',
				time: '03-14',
				likes: 892,
				liked: false,
			},
		],
	},
	{
		id: '3',
		name: 'rj',
		avatar: '🐸',
		text: '"is that cooked" it looks disgusting bro 😭',
		time: '03-14',
		likes: 2074,
		liked: false,
		replies: [
			{
				id: '3a',
				name: 'gordonramsey_fan',
				avatar: '👨‍🍳',
				text: 'gordon would have a heart attack',
				time: '03-15',
				likes: 445,
				liked: false,
			},
		],
	},
	{
		id: '4',
		name: 'jannai 🤍',
		avatar: '🦋',
		text: 'so did we just make a meal instead of meal prepping?',
		time: '03-14',
		likes: 1832,
		liked: false,
	},
	{
		id: '5',
		name: 'thatveganteacher_hater',
		avatar: '🥩',
		text: 'this is what happens when you learn to cook from tiktok',
		time: '03-14',
		likes: 967,
		liked: false,
	},
	{
		id: '6',
		name: 'chefboyar_dont',
		avatar: '🍳',
		text: 'the way he confidently plated that like it was fine dining 😭😭',
		time: '03-15',
		likes: 743,
		liked: false,
	},
	{
		id: '7',
		name: 'protein.princess',
		avatar: '💪',
		text: "at least he's eating protein I guess",
		time: '03-15',
		likes: 521,
		liked: false,
	},
	{
		id: '8',
		name: 'midwestmom_cooks',
		avatar: '🏠',
		text: "sweetie that's not meal prep that's just making dinner with extra steps",
		time: '03-15',
		likes: 1204,
		liked: false,
	},
	{
		id: '9',
		name: 'food.crimes.daily',
		avatar: '🚨',
		text: 'reporting this to the authorities',
		time: '03-15',
		likes: 3891,
		liked: false,
	},
	{
		id: '10',
		name: 'struggle_meals',
		avatar: '😤',
		text: "I feel personally attacked by this video and I haven't even watched it yet",
		time: '03-16',
		likes: 287,
		liked: false,
	},
];

function formatLikes(n: number): string {
	if (n >= 1000) {
		return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
	}
	return String(n);
}

function CommentItem({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) {
	const [showReplies, setShowReplies] = useState(false);

	return (
		<>
			<div className={`flex gap-3 px-4 py-3 ${isReply ? 'pl-14' : ''}`}>
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm">
					{comment.avatar}
				</div>
				<div className="flex min-w-0 flex-1 flex-col gap-0.5">
					<span className="text-base font-medium text-muted-foreground">{comment.name}</span>
					<p className="text-base text-foreground">{comment.text}</p>

					<div className="flex items-center gap-4 pt-1">
						<span className="text-sm text-muted-foreground/75">{comment.time}</span>
						<button
							type="button"
							className="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-muted-foreground hover:text-foreground"
						>
							Reply
						</button>

						<div className="ml-auto flex items-center gap-4">
							<button
								type="button"
								className="flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-muted-foreground hover:text-foreground"
							>
								{comment.liked ? (
									<Heart size={16} className="fill-destructive stroke-none" />
								) : (
									<Heart size={16} />
								)}
								<span className={`text-sm ${comment.liked ? 'text-destructive' : 'text-muted-foreground'}`}>
									{formatLikes(comment.likes)}
								</span>
							</button>

							<button
								type="button"
								className="cursor-pointer border-0 bg-transparent p-0 text-muted-foreground hover:text-foreground"
							>
								<ThumbsDown size={16} />
							</button>
						</div>
					</div>

					{comment.replies && comment.replies.length > 0 && !isReply && (
						<button
							type="button"
							onClick={() => setShowReplies((v) => !v)}
							className="mt-2 flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-sm font-medium text-muted-foreground hover:text-foreground"
						>
							<span className="inline-block h-px w-6 bg-muted-foreground/50" />
							<span>
								{showReplies
									? 'Hide'
									: `View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
							</span>
							<ChevronDown size={10} className={`transition-transform ${showReplies ? 'rotate-180' : ''}`} />
						</button>
					)}
				</div>
			</div>

			{showReplies && comment.replies?.map((reply) => <CommentItem key={reply.id} comment={reply} isReply />)}
		</>
	);
}

function App() {
	const commentCount = initialComments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);

	return (
		<Drawer.Root snapPoints={[0.4, 0.95]}>
			<Drawer.IndentBackground className="fixed inset-0 bg-black" />
			<Drawer.Indent className="relative grid min-h-svh w-full origin-[center_top] transform-[scale(1)_translateY(0)] place-items-center content-center gap-4 bg-background duration-[calc(500ms*var(--t)),calc(250ms*var(--t))] will-change-transform [--p:var(--drawer-scroll-progress)] [--radius:calc(var(--radius-xl)*var(--p))] [--t:calc(1-clamp(0,calc((1-var(--p))*100000),1))] [transition:transform_0.5s_cubic-bezier(0.32,0.72,0,1),border-radius_0.25s_cubic-bezier(0.32,0.72,0,1)] data-active:transform-[scale(calc(1-0.04*var(--p)))_translateY(calc(12px*var(--p)))] data-active:overflow-hidden data-active:rounded-(--radius)">
				<h1 className="text-5xl font-bold sm:text-7xl">drawer</h1>
				<Drawer.Trigger className="cursor-pointer rounded-lg border border-border bg-transparent px-8 py-4 text-foreground hover:bg-accent">
					💬 {commentCount} comments
				</Drawer.Trigger>
			</Drawer.Indent>

			<Drawer.Portal>
				<Drawer.Backdrop className="fixed inset-0 bg-black opacity-[calc(0.5*var(--drawer-scroll-progress))] transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0" />
				<Drawer.Popup className="group transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-snap-dismissed:transition-none!">
					<Drawer.Content className="relative z-2 mx-auto flex h-full w-135 max-w-full origin-bottom flex-col overflow-clip rounded-t-2xl bg-card pt-14.5 text-card-foreground transition-[translate,scale,border-radius] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-ending-style:translate-y-full group-data-nested-dialog-open:scale-95 group-data-nested-dialog-open:overflow-hidden group-data-nested-dialog-open:rounded-t-xl group-data-starting-style:translate-y-full data-snap-dismissed:transition-none!">
						{/* header — absolute so sticky footer resolves against outer scroller */}
						<Drawer.Handle className="absolute inset-x-0 top-0 z-5 flex shrink-0 flex-col items-center rounded-t-2xl bg-card pt-2 pb-2 select-none">
							<span className="mb-2 h-1 w-9 cursor-grab rounded-full bg-muted-foreground/30" />
							<div className="flex w-full items-center justify-between px-4">
								<Drawer.Title className="m-0 text-base font-semibold">{commentCount} comments</Drawer.Title>
								<div className="flex items-center gap-2">
									{/* nested drawer for sort options */}
									<Drawer.Root>
										<Drawer.Trigger className="cursor-pointer border-0 bg-transparent p-1 text-muted-foreground hover:text-foreground">
											<ArrowDownWideNarrow size={22} />
										</Drawer.Trigger>
										<Drawer.Portal>
											<Drawer.Backdrop
												forceRender
												className="fixed inset-0 bg-black/30 transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0"
											/>
											<Drawer.Popup className="group transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-snap-dismissed:transition-none!">
												<Drawer.Content className="relative z-2 mx-auto flex h-full w-135 max-w-full flex-col overflow-clip rounded-t-2xl bg-card pt-12 text-card-foreground transition-[translate] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-ending-style:translate-y-full group-data-starting-style:translate-y-full data-snap-dismissed:transition-none!">
													<Drawer.Handle className="absolute inset-x-0 top-0 z-5 flex flex-col items-center rounded-t-2xl bg-card pt-2 pb-2 select-none">
														<span className="mb-2 h-1 w-9 cursor-grab rounded-full bg-muted-foreground/30" />
														<div className="flex w-full items-center justify-between px-4">
															<Drawer.Title className="m-0 text-base font-semibold">
																Sort comments by
															</Drawer.Title>
															<Drawer.Close className="cursor-pointer border-0 bg-transparent p-1 text-muted-foreground hover:text-foreground">
																<X size={22} />
															</Drawer.Close>
														</div>
													</Drawer.Handle>
													<Drawer.Description className="sr-only">sort options</Drawer.Description>
													<div className="flex flex-col gap-1 p-4">
														{['Top comments', 'Newest first', 'All comments'].map((option) => (
															<Drawer.Close
																key={option}
																className="cursor-pointer rounded-lg border-0 bg-transparent px-4 py-3 text-left text-base text-foreground hover:bg-accent"
															>
																{option}
															</Drawer.Close>
														))}
													</div>
												</Drawer.Content>
											</Drawer.Popup>
										</Drawer.Portal>
									</Drawer.Root>
									<Drawer.Close className="cursor-pointer border-0 bg-transparent p-1 text-muted-foreground hover:text-foreground">
										<X size={22} />
									</Drawer.Close>
								</div>
							</div>
						</Drawer.Handle>

						{/* scrollable comment list */}
						<div className="flex flex-col overflow-y-auto">
							<Drawer.Description className="sr-only">comment section</Drawer.Description>
							{initialComments.map((comment) => (
								<CommentItem key={comment.id} comment={comment} />
							))}
						</div>

						{/* comment input — sticky to outer scroller, gets pushed when drawer is small */}
						<div className="sticky bottom-0 flex shrink-0 items-center gap-3 border-t border-border bg-card px-4 py-2.5">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm text-muted-foreground">
								<User size={18} />
							</div>
							<label className="sr-only">comment</label>
							<input
								type="text"
								className="flex-1 rounded-full border-0 bg-input px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:bg-accent focus:outline-none"
								autoComplete="off"
								placeholder="Add comment..."
							/>
						</div>
					</Drawer.Content>
				</Drawer.Popup>
			</Drawer.Portal>
		</Drawer.Root>
	);
}

export default App;
