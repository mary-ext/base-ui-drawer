import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			exclude: ['**/node_modules/**', '**/.research/**'],
			projects: [
				{
					extends: true,
					test: {
						name: 'unit',
						include: ['src/**/*.test.ts'],
					},
				},
				{
					extends: true,
					test: {
						name: 'browser',
						include: ['src/**/*.test.tsx'],
						browser: {
							enabled: true,
							provider: playwright(),
							instances: [{ browser: 'chromium', headless: true }],
						},
					},
				},
			],
		},
	}),
);
