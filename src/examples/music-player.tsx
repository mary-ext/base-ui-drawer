import {
	ChevronDown,
	Disc3,
	EllipsisVertical,
	Heart,
	ListMusic,
	Mic2,
	MonitorSpeaker,
	Pause,
	Play,
	Plus,
	Repeat,
	Share2,
	Shuffle,
	SkipBack,
	SkipForward,
	Timer,
	X,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { Drawer, type DrawerRootActions } from '../drawer/drawer';

// #region data

interface Track {
	title: string;
	artist: string;
	album: string;
	color: string;
	duration?: string;
}

const nowPlaying: Track & { duration: string; position: string } = {
	title: 'soft crash',
	artist: 'melo park',
	album: 'still rendering',
	color: 'oklch(0.55 0.12 300)',
	duration: '3:42',
	position: '1:16',
};

const queueTracks: Track[] = [
	{ title: 'neon therapy', artist: 'melo park', album: 'still rendering', color: 'oklch(0.55 0.12 300)' },
	{ title: '2am bias', artist: 'yeji nova', album: 'ULTRAVIOLET', color: 'oklch(0.5 0.15 270)' },
	{ title: 'sugar architecture', artist: 'the daylights', album: 'golden hour', color: 'oklch(0.6 0.1 80)' },
	{ title: 'POLLEN', artist: 'kira oku', album: 'pollen season', color: 'oklch(0.55 0.1 130)' },
	{ title: 'backlit', artist: 'melo park', album: 'still rendering', color: 'oklch(0.55 0.12 300)' },
];

const recentRotation: Track[] = [
	nowPlaying,
	{ title: 'POLLEN', artist: 'kira oku', album: 'pollen season', color: 'oklch(0.55 0.1 130)' },
	{ title: 'sugar architecture', artist: 'the daylights', album: 'golden hour', color: 'oklch(0.6 0.1 80)' },
];

const recentAlbums = [
	{ title: 'still rendering', artist: 'melo park', color: 'oklch(0.55 0.12 300)' },
	{ title: 'ULTRAVIOLET', artist: 'yeji nova', color: 'oklch(0.5 0.15 270)' },
	{ title: 'Liked Songs', artist: '', color: 'oklch(0.5 0.2 280)' },
	{ title: 'pollen season', artist: 'kira oku', color: 'oklch(0.55 0.1 130)' },
];

const exploreCards = ['Songs by melo park', 'Similar to melo park', 'Similar to still rendering'];

const credits = [
	{ name: 'melo park', role: 'Main Artist · Producer' },
	{ name: 'Ari Holden', role: 'Songwriter · Keys' },
	{ name: 'Jesse Murakami', role: 'Mixing Engineer' },
];

const sleepTimerOptions = [
	'5 minutes',
	'10 minutes',
	'15 minutes',
	'30 minutes',
	'45 minutes',
	'1 hour',
	'End of track',
];

const moreActions = [
	{ label: 'Share', icon: <Share2 size={20} /> },
	{ label: 'Add to playlist', icon: <Plus size={20} /> },
	{ label: 'Add to queue', icon: <ListMusic size={20} /> },
	{ label: 'Go to album', icon: <Disc3 size={20} /> },
	{ label: 'Go to artist', icon: <Mic2 size={20} /> },
	{ label: 'View credits', icon: <MonitorSpeaker size={20} /> },
];

// #endregion

// #region album art placeholder

function AlbumArt({ color, size }: { color: string; size: 'sm' | 'lg' }) {
	const dim = size === 'sm' ? 'h-10 w-10 shrink-0 rounded-md' : 'h-[100cqmin] w-[100cqmin] max-h-96 max-w-96 rounded-xl';
	return (
		<div
			className={`${dim} flex items-center justify-center`}
			style={{ background: `linear-gradient(135deg, ${color}, oklch(0.3 0.05 300))` }}
		>
			<Disc3 size={size === 'sm' ? 18 : 48} className="text-white/40" />
		</div>
	);
}

// #endregion

// #region collapse button

function CollapseButton({ actionsRef }: { actionsRef: React.RefObject<DrawerRootActions | null> }) {
	return (
		<button
			type="button"
			onClick={() => actionsRef.current?.collapse()}
			className="cursor-pointer border-0 bg-transparent p-1 text-white/50 hover:text-white"
		>
			<ChevronDown size={20} />
		</button>
	);
}

// #endregion

// #region mini player bar

function MiniPlayerBar({
	playing,
	onToggle,
	actionsRef,
}: {
	playing: boolean;
	onToggle: () => void;
	actionsRef: React.RefObject<DrawerRootActions | null>;
}) {
	return (
		<div
			role="button"
			tabIndex={0}
			onClick={() => actionsRef.current?.expand()}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					actionsRef.current?.expand();
				}
			}}
			className="flex h-18 shrink-0 cursor-pointer items-center gap-3 px-4"
		>
			<AlbumArt color={nowPlaying.color} size="sm" />
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-sm font-medium text-white">{nowPlaying.title}</span>
				<span className="truncate text-xs text-white/60">{nowPlaying.artist}</span>
			</div>
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onToggle();
				}}
				className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white/10 text-white hover:bg-white/20"
			>
				{playing ? <Pause size={16} /> : <Play size={16} />}
			</button>
		</div>
	);
}

// #endregion

// #region full player

function FullPlayer({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
	return (
		<div className="flex h-[calc(95svh-72px-32px)] shrink-0 flex-col items-center justify-between px-6 pt-4 pb-6">
			{/* album art — grows to fill available space */}
			<div className="w-full min-h-0 flex-1 py-4">
				<div className="flex h-full w-full items-center justify-center @container-[size]">
					<AlbumArt color={nowPlaying.color} size="lg" />
				</div>
			</div>

			{/* track info */}
			<div className="mt-4 flex w-full items-center justify-between">
				<div className="min-w-0 flex-1">
					<p className="truncate text-lg font-bold text-white">{nowPlaying.title}</p>
					<p className="truncate text-sm text-white/60">{nowPlaying.artist}</p>
				</div>
				<button
					type="button"
					className="cursor-pointer border-0 bg-transparent p-1 text-white/60 hover:text-white"
				>
					<Heart size={20} />
				</button>
			</div>

			{/* progress bar */}
			<div className="mt-4 flex w-full flex-col gap-1">
				<div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
					<div className="h-full w-[34%] rounded-full bg-white" />
				</div>
				<div className="flex justify-between text-xs text-white/50">
					<span>{nowPlaying.position}</span>
					<span>{nowPlaying.duration}</span>
				</div>
			</div>

			{/* playback controls */}
			<div className="mt-4 flex w-full items-center justify-between">
				<button
					type="button"
					className="cursor-pointer border-0 bg-transparent p-2 text-white/60 hover:text-white"
				>
					<Shuffle size={20} />
				</button>
				<button
					type="button"
					className="cursor-pointer border-0 bg-transparent p-2 text-white hover:text-white/80"
				>
					<SkipBack size={24} />
				</button>
				<button
					type="button"
					onClick={onToggle}
					className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-black hover:scale-105"
				>
					{playing ? <Pause size={28} /> : <Play size={28} className="ml-0.5" />}
				</button>
				<button
					type="button"
					className="cursor-pointer border-0 bg-transparent p-2 text-white hover:text-white/80"
				>
					<SkipForward size={24} />
				</button>
				<button
					type="button"
					className="cursor-pointer border-0 bg-transparent p-2 text-white/60 hover:text-white"
				>
					<Repeat size={20} />
				</button>
			</div>

			{/* action row */}
			<div className="mt-4 flex w-full items-center justify-between">
				<div className="flex items-center gap-2">
					<button
						type="button"
						className="cursor-pointer border-0 bg-transparent p-2 text-white/60 hover:text-white"
					>
						<Mic2 size={20} />
					</button>

					{/* sleep timer trigger */}
					<Drawer.Root>
						<Drawer.Trigger className="cursor-pointer border-0 bg-transparent p-2 text-white/60 hover:text-white">
							<Timer size={20} />
						</Drawer.Trigger>
						<SleepTimerDrawer />
					</Drawer.Root>
				</div>

				<div className="flex items-center gap-2">
					{/* share — dummy */}
					<button
						type="button"
						className="cursor-pointer border-0 bg-transparent p-2 text-white/60 hover:text-white"
					>
						<Share2 size={20} />
					</button>
					{/* queue — opens nested drawer */}
					<Drawer.Root>
						<Drawer.Trigger className="cursor-pointer border-0 bg-transparent p-2 text-white/60 hover:text-white">
							<ListMusic size={20} />
						</Drawer.Trigger>
						<QueueDrawer />
					</Drawer.Root>
				</div>
			</div>
		</div>
	);
}

// #endregion

// #region explore section (scrollable within expanded player)

function ExploreSection() {
	return (
		<div className="flex flex-col gap-6 border-t border-white/10 px-6 pt-6 pb-8">
			{/* explore artist */}
			<div className="flex flex-col gap-3">
				<h3 className="text-base font-bold text-white">Explore melo park</h3>
				<div className="flex gap-3 overflow-x-auto">
					{exploreCards.map((card) => (
						<div
							key={card}
							className="flex h-28 w-36 shrink-0 flex-col justify-end rounded-lg p-3"
							style={{ background: 'linear-gradient(135deg, oklch(0.4 0.08 300), oklch(0.25 0.04 280))' }}
						>
							<span className="text-xs font-medium text-white/80">{card}</span>
						</div>
					))}
				</div>
			</div>

			{/* credits */}
			<div className="flex flex-col gap-3">
				<h3 className="text-base font-bold text-white">Credits</h3>
				{credits.map((credit) => (
					<div key={credit.name} className="flex items-center justify-between">
						<div className="flex flex-col">
							<span className="text-sm font-medium text-white">{credit.name}</span>
							<span className="text-xs text-white/50">{credit.role}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// #endregion

// #region nested drawer shell

function NestedDrawerShell({
	title,
	description,
	children,
}: {
	title?: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<Drawer.Portal>
			<Drawer.Backdrop
				forceRender
				className="fixed inset-0 bg-black/30 transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0"
			/>
			<Drawer.Popup className="group transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-snap-dismissed:transition-none!">
				<Drawer.Content className="relative z-2 mx-auto flex h-full w-135 max-w-full flex-col overflow-clip rounded-t-2xl bg-[oklch(0.2_0.02_280)] pt-12 text-white transition-[translate] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-ending-style:translate-y-full group-data-starting-style:translate-y-full data-snap-dismissed:transition-none!">
					<Drawer.Handle className="absolute inset-x-0 top-0 z-5 flex flex-col items-center rounded-t-2xl bg-[oklch(0.2_0.02_280)] pt-2 pb-2 select-none">
						<span className="mb-2 h-1 w-9 cursor-grab rounded-full bg-white/20" />
						{title && (
							<div className="flex w-full items-center justify-between px-4">
								<Drawer.Title className="m-0 text-base font-bold">{title}</Drawer.Title>
								<Drawer.Close className="-mr-1 cursor-pointer border-0 bg-transparent p-1 text-white/60 hover:text-white">
									<X size={20} />
								</Drawer.Close>
							</div>
						)}
					</Drawer.Handle>
					<Drawer.Description className="sr-only">{description}</Drawer.Description>
					{children}
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Portal>
	);
}

// #endregion

// #region queue drawer (nested)

function QueueDrawer() {
	return (
		<NestedDrawerShell title="Queue" description="playback queue">
			<div className="flex flex-col overflow-y-auto">
				<span className="px-4 pt-2 pb-1 text-xs font-medium text-white/40">Now playing</span>
				<div className="flex items-center gap-3 px-4 py-2">
					<AlbumArt color={nowPlaying.color} size="sm" />
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium text-emerald-400">{nowPlaying.title}</p>
						<p className="truncate text-xs text-white/50">{nowPlaying.artist}</p>
					</div>
					<Pause size={16} className="shrink-0 text-white/60" />
				</div>

				<span className="px-4 pt-4 pb-1 text-xs font-medium text-white/40">Next in queue</span>
				{queueTracks.map((track) => (
					<div key={track.title} className="flex items-center gap-3 px-4 py-2">
						<AlbumArt color={track.color} size="sm" />
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-white">{track.title}</p>
							<p className="truncate text-xs text-white/50">{track.artist}</p>
						</div>
					</div>
				))}
			</div>
		</NestedDrawerShell>
	);
}

// #endregion

// #region sleep timer drawer (nested)

function SleepTimerDrawer() {
	return (
		<NestedDrawerShell title="Sleep timer" description="sleep timer options">
			<div className="flex flex-col p-4">
				{sleepTimerOptions.map((option) => (
					<Drawer.Close
						key={option}
						className="cursor-pointer rounded-lg border-0 bg-transparent px-4 py-3.5 text-left text-base text-white hover:bg-white/10"
					>
						{option}
					</Drawer.Close>
				))}
			</div>
		</NestedDrawerShell>
	);
}

// #endregion

// #region more actions drawer (nested)

function MoreActionsDrawer() {
	return (
		<NestedDrawerShell description="more actions">
			<div className="flex items-center gap-3 px-4 pb-4">
				<AlbumArt color={nowPlaying.color} size="sm" />
				<div className="min-w-0 flex-1">
					<Drawer.Title className="m-0 truncate text-sm font-medium">{nowPlaying.title}</Drawer.Title>
					<p className="truncate text-xs text-white/50">
						{nowPlaying.artist} · {nowPlaying.album}
					</p>
				</div>
			</div>

			<div className="flex flex-col border-t border-white/10 p-4">
				{moreActions.map((action) => (
					<Drawer.Close
						key={action.label}
						className="flex cursor-pointer items-center gap-4 rounded-lg border-0 bg-transparent px-4 py-3.5 text-left text-base text-white hover:bg-white/10"
					>
						<span className="text-white/60">{action.icon}</span>
						{action.label}
					</Drawer.Close>
				))}
			</div>
		</NestedDrawerShell>
	);
}

// #endregion

// #region home page

function HomePage() {
	return (
		<div className="flex flex-col gap-6 p-4 pb-24">
			<h1 className="text-2xl font-bold text-white">Good evening</h1>

			{/* your recent rotation */}
			<div className="flex flex-col gap-3">
				<h2 className="text-lg font-bold text-white">Your recent rotation</h2>
				{recentRotation.map((track) => (
					<div key={track.title} className="flex items-center gap-3">
						<AlbumArt color={track.color} size="sm" />
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-white">{track.title}</p>
							<p className="truncate text-xs text-white/50">{track.artist}</p>
						</div>
						<button
							type="button"
							className="cursor-pointer border-0 bg-transparent p-1 text-white/40 hover:text-white"
						>
							<EllipsisVertical size={18} />
						</button>
					</div>
				))}
			</div>

			{/* recents */}
			<div className="flex flex-col gap-3">
				<h2 className="text-lg font-bold text-white">Recents</h2>
				<div className="flex gap-3 overflow-x-auto">
					{recentAlbums.map((album) => (
						<div key={album.title} className="flex w-32 shrink-0 flex-col gap-2">
							<div
								className="flex h-32 w-32 items-center justify-center rounded-lg"
								style={{ background: `linear-gradient(135deg, ${album.color}, oklch(0.25 0.04 280))` }}
							>
								<Disc3 size={32} className="text-white/30" />
							</div>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium text-white">{album.title}</p>
								{album.artist && <p className="truncate text-xs text-white/50">{album.artist}</p>}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// #endregion

// #region music player example

export function MusicPlayerExample() {
	const [playing, setPlaying] = useState(true);
	const actionsRef = useRef<DrawerRootActions>(null);

	return (
		<Drawer.Root
			open
			onOpenChange={() => {
				// keep drawer always open — swipe-to-dismiss bounces back
			}}
			snapPoints={['72px', 1]}
			defaultSnapPoint="72px"
			modal={false}
			actionsRef={actionsRef}
		>
			<Drawer.IndentBackground className="fixed inset-0 bg-black" />
			<Drawer.Indent className="relative min-h-svh w-full origin-[center_top] translate-y-0 scale-100 bg-[oklch(0.15_0.01_280)] duration-[calc(500ms*var(--t)),calc(250ms*var(--t))] will-change-transform [--p:clamp(0,calc((var(--drawer-scroll-progress,0)-0.12)/0.88),1)] [--r:calc(var(--radius-xl)*var(--p))] [--t:calc(1-clamp(0,calc((1-var(--p))*100000),1))] [transition:scale_0.5s_cubic-bezier(0.32,0.72,0,1),translate_0.5s_cubic-bezier(0.32,0.72,0,1),border-radius_0.25s_cubic-bezier(0.32,0.72,0,1)] data-active:translate-y-[calc(12px*var(--p))] data-active:scale-[calc(1-0.04*var(--p))] data-active:overflow-hidden data-active:rounded-(--r)">
				<HomePage />
			</Drawer.Indent>

			<Drawer.Portal>
				<Drawer.Backdrop className="pointer-events-none fixed inset-0 bg-black opacity-[calc(0.6*clamp(0,(var(--drawer-scroll-progress,0)-0.12)/0.88,1))] transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0" />
				<Drawer.Popup className="group transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-snap-dismissed:transition-none!">
					<Drawer.Content
						className="group/content relative z-2 mx-auto flex h-full w-135 max-w-full origin-bottom flex-col overflow-clip rounded-t-2xl text-white transition-[translate,scale,border-radius] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-ending-style:translate-y-full group-data-nested-dialog-open:scale-95 group-data-nested-dialog-open:overflow-hidden group-data-nested-dialog-open:rounded-t-xl group-data-starting-style:translate-y-full data-snap-dismissed:transition-none!"
						style={{ background: 'linear-gradient(to bottom, oklch(0.35 0.05 300), oklch(0.18 0.02 280))' }}
					>
						{/* handle — crossfades between mini-player (peek) and full header (expanded) */}
						<Drawer.Handle className="relative flex h-18 shrink-0 select-none">
							{/* mini-player bar — visible at peek, inert when expanded */}
							<div className="absolute inset-0 opacity-[clamp(0,calc(1.5-var(--drawer-scroll-progress,0)*5),1)] group-data-expanded/content:pointer-events-none">
								<MiniPlayerBar playing={playing} onToggle={() => setPlaying((p) => !p)} actionsRef={actionsRef} />
							</div>
							{/* full header — visible when expanded, inert at peek */}
							<div className="pointer-events-none absolute inset-0 flex flex-col items-center pt-2 pb-1 opacity-[clamp(0,calc(var(--drawer-scroll-progress,0)*5-1),1)] group-data-expanded/content:pointer-events-auto">
								<span className="mb-1 h-1 w-9 cursor-grab rounded-full bg-white/20" />
								<div className="flex w-full items-center justify-between px-4 py-1">
									<CollapseButton actionsRef={actionsRef} />
									<div className="flex flex-col items-center">
										<span className="text-[10px] font-medium tracking-wider text-white/50 uppercase">
											Playing from album
										</span>

										<span className="text-xs font-medium text-white">{nowPlaying.album}</span>
									</div>

									<Drawer.Root>
										<Drawer.Trigger className="cursor-pointer border-0 bg-transparent p-1 text-white/50 hover:text-white">
											<EllipsisVertical size={20} />
										</Drawer.Trigger>
										<MoreActionsDrawer />
									</Drawer.Root>
								</div>
							</div>
						</Drawer.Handle>

						<Drawer.Title className="sr-only">{nowPlaying.title}</Drawer.Title>
						<Drawer.Description className="sr-only">music player</Drawer.Description>

						{/* full player + explore (scrollable when expanded) */}
						<div className="flex flex-col overflow-y-hidden group-data-expanded/content:overflow-y-auto">
							<FullPlayer playing={playing} onToggle={() => setPlaying((p) => !p)} />

							<ExploreSection />
						</div>
					</Drawer.Content>
				</Drawer.Popup>
			</Drawer.Portal>
		</Drawer.Root>
	);
}

// #endregion
