import { CreditCard, MessageSquare } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { CommentsExample } from './examples/comments';
import { PaymentExample } from './examples/payment';

// #region routes

const routes: Record<string, { name: string; icon: React.ReactNode; component: React.ComponentType }> = {
	comments: {
		name: 'comments',
		icon: <MessageSquare size={20} />,
		component: CommentsExample,
	},
	payment: {
		name: 'payment',
		icon: <CreditCard size={20} />,
		component: PaymentExample,
	},
};

// #endregion

// #region hash router

function getHash(): string {
	return window.location.hash.replace('#', '') || '';
}

function useHash(): string {
	return useSyncExternalStore(
		(cb) => {
			window.addEventListener('hashchange', cb);
			return () => window.removeEventListener('hashchange', cb);
		},
		getHash,
		() => '',
	);
}

// #endregion

// #region home

function Home() {
	return (
		<div className="grid min-h-svh place-items-center content-center gap-8 bg-background p-8">
			<div className="text-center">
				<h1 className="text-5xl font-bold sm:text-7xl">drawer</h1>
				<p className="mt-3 text-lg text-muted-foreground">examples</p>
			</div>
			<div className="flex flex-wrap justify-center gap-3">
				{Object.entries(routes).map(([key, route]) => (
					<a
						key={key}
						href={`#${key}`}
						className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-foreground no-underline hover:bg-accent"
					>
						{route.icon}
						{route.name}
					</a>
				))}
			</div>
		</div>
	);
}

// #endregion

// #region app

function App() {
	const hash = useHash();
	const route = routes[hash];

	if (!route) {
		return <Home />;
	}

	return <route.component />;
}

export default App;

// #endregion
