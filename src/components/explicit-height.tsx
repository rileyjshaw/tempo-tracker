import { useState, useEffect, useRef } from 'react';

function ExplicitHeight({ children }: { children: React.ReactNode }) {
	const [height, setHeight] = useState(0);
	const outerDivRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleResize = () => {
			if (outerDivRef.current) {
				setHeight(outerDivRef.current.clientHeight);
			}
		};

		handleResize();
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return (
		<div ref={outerDivRef} style={{ height: '100%' }}>
			<div style={{ height }}>{children}</div>
		</div>
	);
}

export default ExplicitHeight;
