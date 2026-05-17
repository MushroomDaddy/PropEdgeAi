/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_CONVEX_URL: string;
	readonly VITE_IS_PREVIEW: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// Declare process.env for Convex server modules imported transitively via API types
declare const process: {
	env: Record<string, string | undefined>;
};
