const { useEffect, useMemo, useRef, useState } = React;

function HeartsBackground() {
	const containerRef = useRef(null);
	const hearts = useMemo(() => {
		return Array.from({ length: 14 }, (_, i) => ({
			id: i,
			left: Math.random() * 100,
			size: 16 + Math.random() * 24,
			duration: 6 + Math.random() * 6,
			delay: Math.random() * 4
		}));
	}, []);

	return (
		<div className="hearts-bg" ref={containerRef} aria-hidden>
			{hearts.map(h => (
				<span
					key={h.id}
					style={{
						left: `${h.left}%`,
						bottom: `${-10 - Math.random() * 20}px`,
						fontSize: `${h.size}px`,
						animationDuration: `${h.duration}s`,
						animationDelay: `${h.delay}s`
					}}
				>
					❤️
				</span>
			))}
		</div>
	);
}

function LandingPage({ onYes }) {
	const arenaRef = useRef(null);
	return (
		<div className="page">
			<h1 className="title">Will you go on a date with me?</h1>
			<p className="subtitle">I promise it will be adorable. Pinky swear.</p>
			<div className="button-arena" ref={arenaRef}>
				<button className="btn btn-yes" onClick={onYes} aria-label="Yes">
					Yes 💖
				</button>
				<DodgingNoButton arenaRef={arenaRef} />
			</div>
			<footer className="note"></footer>
		</div>
	);
}

function DodgingNoButton({ arenaRef }) {
	const btnRef = useRef(null);
	const [pos, setPos] = useState({ xPct: 20, yPct: 50 });

	function moveRandomly() {
		const arena = arenaRef.current;
		const btn = btnRef.current;
		if (!arena || !btn) return;
		const arenaRect = arena.getBoundingClientRect();
		const btnRect = btn.getBoundingClientRect();
		const maxX = Math.max(0, arenaRect.width - btnRect.width);
		const maxY = Math.max(0, arenaRect.height - btnRect.height);
		const x = Math.random() * maxX;
		const y = Math.random() * maxY;
		const xPct = (x / arenaRect.width) * 100;
		const yPct = (y / arenaRect.height) * 100;
		setPos({ xPct, yPct });
	}

	// Nudge on pointer proximity as well
	useEffect(() => {
		const arena = arenaRef.current;
		if (!arena) return;
		function onMove(e) {
			const btn = btnRef.current;
			if (!btn) return;
			const b = btn.getBoundingClientRect();
			const proximity = 60; // px
			const dx = Math.max(0, Math.max(b.left - e.clientX, e.clientX - b.right));
			const dy = Math.max(0, Math.max(b.top - e.clientY, e.clientY - b.bottom));
			const near = dx < proximity && dy < proximity;
			if (near) moveRandomly();
		}
		arena.addEventListener('pointermove', onMove, { passive: true });
		return () => arena.removeEventListener('pointermove', onMove);
	}, [arenaRef]);

	return (
		<button
			ref={btnRef}
			className="btn btn-no"
			style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%`, transform: 'translate(-50%, -50%)' }}
			onMouseEnter={moveRandomly}
			onPointerDown={e => {
				e.preventDefault();
				moveRandomly();
			}}
			onClick={e => {
				e.preventDefault();
				moveRandomly();
			}}
			aria-label="No"
			tabIndex={-1}
		>
			No 😅
		</button>
	);
}

function PreferencesPage({ selections, onToggle, onNext, onBack }) {
	const options = ['Hiking', 'Movie', 'Coffee', 'Dinner'];
	return (
		<div className="page">
			<h1 className="title">What kind of date do you want?</h1>
			<p className="subtitle">Pick as many as you like — I’m flexible!</p>
			<div className="options">
				{options.map(opt => {
					const selected = selections.includes(opt);
					return (
						<div
							key={opt}
							className={`chip ${selected ? 'selected' : ''}`}
							role="button"
							aria-pressed={selected}
							onClick={() => onToggle(opt)}
						>
							{opt}
						</div>
					);
				})}
			</div>
			<div className="actions">
				<button className="btn btn-secondary" onClick={onBack}>Back</button>
				<button className="btn btn-primary" onClick={onNext}>Next</button>
			</div>
		</div>
	);
}

function SchedulePage({ selected, onSelect, onNext, onBack }) {
	const choices = [
		'Friday 7:00 PM',
		'Saturday 10:00 AM',
		'Saturday 6:30 PM',
		'Sunday 3:00 PM'
	];
	return (
		<div className="page">
			<h1 className="title">What day and time works best?</h1>
			<p className="subtitle">Choose one perfect moment ✨</p>
			<div className="schedule">
				{choices.map(c => {
					const isSel = selected === c;
					return (
						<div
							key={c}
							className={`radio ${isSel ? 'selected' : ''}`}
							role="button"
							aria-pressed={isSel}
							onClick={() => onSelect(c)}
						>
							{c}
						</div>
					);
				})}
			</div>
			<div className="actions">
				<button className="btn btn-secondary" onClick={onBack}>Back</button>
				<button className="btn btn-primary" onClick={onNext} disabled={!selected}>Confirm</button>
			</div>
		</div>
	);
}

function ConfirmationPage({ types, schedule, onRestart }) {
	useEffect(() => {
		if (window.confetti) {
			const burst = () => window.confetti({
				particleCount: 120,
				spread: 70,
				origin: { y: 0.7 }
			});
			burst();
			setTimeout(burst, 300);
			setTimeout(burst, 700);
		}
	}, []);

	const typesText = types.length ? types.join(' + ') : 'surprise';

	return (
		<div className="page confirm">
			<div className="big-emoji">🎉</div>
			<h1 className="title">Yay!</h1>
			<p className="subtitle">
				I can’t wait for our <strong>{typesText}</strong> date on <strong>{schedule}</strong>! 💖
			</p>
			<div className="actions" style={{ marginTop: 10 }}>
				<button className="btn btn-secondary" onClick={onRestart}>Change your mind?</button>
			</div>
		</div>
	);
}

function App() {
	const [step, setStep] = useState(0);
	const [dateTypes, setDateTypes] = useState([]);
	const [schedule, setSchedule] = useState('');

	function toggleType(type) {
		setDateTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
	}

	return (
		<div className="app">
			<HeartsBackground />
			<div className="card" key={step}>
				{step === 0 && <LandingPage onYes={() => setStep(1)} />}
				{step === 1 && (
					<PreferencesPage
						selections={dateTypes}
						onToggle={toggleType}
						onNext={() => setStep(2)}
						onBack={() => setStep(0)}
					/>
				)}
				{step === 2 && (
					<SchedulePage
						selected={schedule}
						onSelect={setSchedule}
						onNext={() => setStep(3)}
						onBack={() => setStep(1)}
					/>
				)}
				{step === 3 && (
					<ConfirmationPage
						types={dateTypes}
						schedule={schedule}
						onRestart={() => {
							setDateTypes([]);
							setSchedule('');
							setStep(0);
						}}
					/>
				)}
			</div>
		</div>
	);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


