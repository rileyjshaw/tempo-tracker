import { useCallback, useEffect, useState } from 'react';
import cnz from 'cnz';
import { twMerge } from 'tailwind-merge';

type CnzInputs = Parameters<typeof cnz>;

export function cn(...inputs: CnzInputs) {
	return twMerge(cnz(...inputs));
}

// Note: returns `null` or `serverState` for SSR'd components.
export function useStickyState<T>(
	defaultValue: T | (() => T),
	key: string,
	{
		scope = 'local',
		version = 'default',
		serverState = null,
	}: {
		scope?: 'local' | 'session';
		version?: string;
		serverState?: T | null;
	} = {}
): [T | null, (value: T | ((prev: T) => T)) => void] {
	const [{ initialized, value }, setValue] = useState<{
		initialized: boolean;
		value: T | null;
	}>({
		initialized: false,
		value: serverState,
	});

	// Basically setValue, but adds `initialized: true` for the client.
	const setInitializedValue = useCallback(
		(newValue: T | ((prev: T) => T)) =>
			setValue(({ value: oldValue }) => ({
				initialized: true,
				value: typeof newValue === 'function' ? (newValue as (prev: T) => T)(oldValue as T) : newValue,
			})),
		[]
	);

	// On the client, check if there's a preexisting value and apply that.
	// Otherwise, apply the default value.
	useEffect(() => {
		const storedValue = window[`${scope}Storage`].getItem(key);
		const stickyValue =
			storedValue === null ? storedValue : (JSON.parse(storedValue) as { value: T; version: string });

		if (stickyValue && stickyValue.hasOwnProperty?.('value') && stickyValue.version === version) {
			setInitializedValue(stickyValue.value);
		} else {
			const evaluatedDefault = typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
			setInitializedValue(evaluatedDefault);
		}
	}, []);

	// Keep (local|session)Storage in sync on the client.
	useEffect(() => {
		if (initialized) {
			window[`${scope}Storage`].setItem(key, JSON.stringify({ value, version }));
		}
	}, [initialized, key, value, version]);

	// If the value changes in a different tab, update it in this tab.
	useEffect(() => {
		function updateValue(e: StorageEvent) {
			if (!e.newValue) return;
			const newValue = JSON.parse(e.newValue) as { value: T; version: string };
			if (e.key === key && newValue.version === version) {
				setInitializedValue(newValue.value);
			}
		}
		window.addEventListener('storage', updateValue);
		return () => window.removeEventListener('storage', updateValue);
	}, [key, version]);
	return [value, setInitializedValue];
}
