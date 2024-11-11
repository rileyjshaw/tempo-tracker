import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import LineGraph from '@/components/line-graph';
import TempoIcon from '@/assets/tempo.svg?react';
import { cn, useStickyState } from '@/lib/utils';

function App() {
	const [taps, setTaps] = useState<number[]>([]);
	const [tempoHistory, setTempoHistory] = useState<number[]>([]);
	const [stickyWindowSize, setWindowSize] = useStickyState(8, 'window-size');
	const [stickyReferenceTempo, setReferenceTempo] = useStickyState(120, 'reference-tempo');

	const windowSize = stickyWindowSize ?? 8;
	const referenceTempo = stickyReferenceTempo ?? 120;

	const addTap = useCallback(() => {
		const now = Date.now();
		setTaps(prevTaps => [...prevTaps, now]);
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === ' ' || event.key === 'Enter') {
				event.preventDefault();
				addTap();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [addTap]);

	useEffect(() => {
		if (taps.length < windowSize) return;

		const actualWindowSize = Math.min(windowSize, taps.length);
		const windowDuration = taps[taps.length - 1] - taps[taps.length - actualWindowSize];
		const tempo = Math.round((60000 * (actualWindowSize - 1)) / windowDuration);
		setTempoHistory(history => [...history, tempo]);
	}, [taps, windowSize]);

	const nTempos = tempoHistory.length;
	const tempo = tempoHistory[nTempos - 1];
	const averageTempo =
		taps.length > 1 ? Math.round((60000 * (taps.length - 1)) / (taps[taps.length - 1] - taps[0])) : undefined;

	return (
		<div className="flex flex-col p-8 gap-8 min-h-dvh w-dvw">
			<div className="flex flex-wrap gap-8">
				<Card className="grow basis-0">
					<CardContent className="flex flex-col gap-6">
						<div className="flex flex-col gap-2">
							<h1 className="text-6xl font-bold">Tempo tracker</h1>
							<p className="text-sm text-muted-foreground text-balance">
								Tap the button or space bar to the beat. Current and average BPM are displayed, with
								tempo drift shown in the chart below.
							</p>
						</div>
						<div className="w-full max-w-xs">
							<label
								htmlFor="window-size"
								className="block text-sm font-medium text-gray-700 mb-2 tabular-nums"
							>
								Rolling Average Window: {windowSize} beats
							</label>
							<Slider
								id="window-size"
								min={2}
								max={16}
								step={1}
								value={[windowSize]}
								onValueChange={value => setWindowSize(value[0])}
							/>
						</div>
						<div className="w-full max-w-xs">
							<label
								htmlFor="window-size"
								className="block text-sm font-medium text-gray-700 mb-2 tabular-nums"
							>
								Reference tempo: {referenceTempo ? `${referenceTempo} BPM` : 'None'}
							</label>
							<Slider
								id="reference-tempo"
								min={0}
								max={300}
								step={1}
								value={[referenceTempo]}
								onValueChange={value => setReferenceTempo(value[0])}
							/>
						</div>
					</CardContent>
				</Card>
				<Card className="basis-0 grow">
					<CardContent className="flex flex-col items-center gap-6">
						<Button size="lg" className="w-48 h-48 text-4xl rounded-full" onClick={addTap}>
							{!!taps.length && (
								<TempoIcon className={cn('!size-12', taps.length % 2 && '-scale-x-100')} />
							)}
							<span className={cn('font-bold', taps.length && 'sr-only')}>TAP</span>
						</Button>
						<div className="text-center">
							<div className="text-6xl mb-0 font-bold tabular-nums">{tempo || '--'} BPM</div>
							<div className="text-xl mt-0 tabular-nums">{`${averageTempo || '--'} BPM average`}</div>
						</div>
					</CardContent>
				</Card>
			</div>
			<div className="grow grid min-h-60">
				<LineGraph data={tempoHistory} referenceValue={referenceTempo} />
			</div>
		</div>
	);
}

export default App;
