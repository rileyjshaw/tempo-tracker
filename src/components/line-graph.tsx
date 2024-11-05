import { useState, useEffect } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExplicitHeight from './explicit-height';

interface LineGraphProps {
	data: number[];
	referenceValue?: number;
	title?: string;
	description?: string;
}

function LineGraph({ data = [], referenceValue, title, description }: LineGraphProps) {
	const [chartData, setChartData] = useState<Array<{ index: number; value: number }>>([]);
	const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([90, 150]);

	useEffect(() => {
		// Transform the data array into the format expected by Recharts
		const transformedData = data.map((value, index) => ({ index, value }));
		setChartData(transformedData);

		// Calculate Y-axis domain
		// const minValue = Math.min(...data, referenceValue || Infinity);
		const maxValue = Math.max(...data, referenceValue || -Infinity);
		const minYLabel = 0; //Math.floor(Math.max(minValue - 30, 0) / 10) * 10;
		const maxYLabel = Math.ceil((maxValue + 30) / 10) * 10;
		setYAxisDomain([minYLabel, maxYLabel]);
	}, [data, referenceValue]);

	return (
		<Card className="h-full">
			{(title || description) && (
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
			)}
			<CardContent className="pb-0 pl-0">
				<ExplicitHeight>
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="index" tick={false} />
							<YAxis domain={yAxisDomain} />
							<Tooltip />
							{typeof referenceValue === 'number' && (
								<ReferenceLine
									y={referenceValue}
									stroke="hsl(var(--destructive))"
									strokeWidth={2}
									label={{
										value: 'Reference',
										position: 'right',
										fill: 'hsl(var(--destructive))',
									}}
								/>
							)}
							<Line
								isAnimationActive={false}
								type="monotone"
								dataKey="value"
								stroke="hsl(var(--foreground))"
								strokeWidth={2}
								dot={false}
								name="Value"
							/>
						</LineChart>
					</ResponsiveContainer>
				</ExplicitHeight>
			</CardContent>
		</Card>
	);
}

export default LineGraph;
