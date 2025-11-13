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

function LandingPage({ onYes, onDodge }) {
	const arenaRef = useRef(null);
	return (
		<div className="page">
			<h1 className="title">Will you go on a date with me?</h1>
			<p className="subtitle">I promise it will be adorable. Pinky swear.</p>
			<div className="button-arena" ref={arenaRef}>
				<button className="btn btn-yes" onClick={onYes} aria-label="Yes">
					Yes 💖
				</button>
				<DodgingNoButton arenaRef={arenaRef} onDodge={onDodge} />
			</div>
			<footer className="note"></footer>
		</div>
	);
}

function DodgingNoButton({ arenaRef, onDodge }) {
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
		if (typeof onDodge === 'function') onDodge();
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
				e.stopPropagation();
				moveRandomly();
			}}
			onMouseDown={e => {
				e.preventDefault();
				e.stopPropagation();
			}}
			onMouseUp={e => {
				e.preventDefault();
				e.stopPropagation();
			}}
			onClick={e => {
				e.preventDefault();
				e.stopPropagation();
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

// --- E2E Secret share helpers (no backend) ---
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bufToB64(buffer) {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary);
}

function b64ToBuf(b64) {
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes.buffer;
}

async function deriveAesKey(passphrase, saltBytes) {
	const keyMaterial = await crypto.subtle.importKey('raw', textEncoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
	return crypto.subtle.deriveKey(
		{ name: 'PBKDF2', salt: saltBytes, iterations: 100000, hash: 'SHA-256' },
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

async function encryptSelectionsE2E(payloadObj, passphrase) {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await deriveAesKey(passphrase, salt);
	const data = textEncoder.encode(JSON.stringify(payloadObj));
	const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
	return `v1.${bufToB64(salt)}.${bufToB64(iv)}.${bufToB64(cipher)}`;
}

async function decryptSelectionsE2E(secret, passphrase) {
	try {
		const [ver, saltB64, ivB64, ctB64] = secret.split('.');
		if (ver !== 'v1') throw new Error('bad version');
		const salt = new Uint8Array(b64ToBuf(saltB64));
		const iv = new Uint8Array(b64ToBuf(ivB64));
		const ct = b64ToBuf(ctB64);
		const key = await deriveAesKey(passphrase, salt);
		const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
		const json = textDecoder.decode(plainBuf);
		return JSON.parse(json);
	} catch (e) {
		return null;
	}
}

// --- Friendly path helpers for logging ---
const allowedTypes = new Set(['hiking', 'movie', 'coffee', 'dinner']);
const scheduleSlugMap = [
	{ text: 'Friday 7:00 PM', slugs: ['friday-7pm', 'fri-7pm', 'friday7pm'] },
	{ text: 'Saturday 10:00 AM', slugs: ['saturday-10am', 'sat-10am', 'saturday10am'] },
	{ text: 'Saturday 6:30 PM', slugs: ['saturday-630pm', 'sat-630pm', 'saturday6:30pm', 'saturday6-30pm', 'sat-6-30pm'] },
	{ text: 'Sunday 3:00 PM', slugs: ['sunday-3pm', 'sun-3pm', 'sunday3pm'] }
];

function toScheduleSlug(text) {
	switch (text) {
		case 'Friday 7:00 PM': return 'friday-7pm';
		case 'Saturday 10:00 AM': return 'saturday-10am';
		case 'Saturday 6:30 PM': return 'saturday-630pm';
		case 'Sunday 3:00 PM': return 'sunday-3pm';
		default: return '';
	}
}

function fromScheduleSlug(slug) {
	if (!slug) return '';
	const norm = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
	for (const m of scheduleSlugMap) {
		if (m.slugs.includes(norm)) return m.text;
	}
	return '';
}

function buildFriendlyResultsPath(types, when) {
	const typeTokens = (types || []).map(t => String(t).toLowerCase()).filter(t => allowedTypes.has(t));
	const scheduleSlug = toScheduleSlug(when);
	if (!scheduleSlug) return '/results';
	const typesPart = typeTokens.length ? typeTokens.join('-') : 'surprise';
	return `/results_${typesPart}_${scheduleSlug}`;
}

function parseFriendlyResultsPath(pathname) {
	let slug = null;
	if (pathname.startsWith('/results_')) {
		slug = pathname.slice('/results_'.length);
	} else if (pathname.startsWith('/results-')) {
		slug = pathname.slice('/results-'.length);
	} else if (pathname.startsWith('/r/')) {
		slug = pathname.slice('/r/'.length);
	}
	if (!slug) return null;
	const idx = slug.lastIndexOf('_');
	if (idx === -1) return null;
	const typesPart = slug.slice(0, idx);
	const schedPart = slug.slice(idx + 1);
	const schedule = fromScheduleSlug(schedPart);
	if (!schedule) return null;
	const types = typesPart.split(/[-+,\s]+/).map(s => s.trim().toLowerCase()).filter(s => allowedTypes.has(s));
	return { types, schedule };
}

function SecretShare({ types, schedule }) {
	const [pass, setPass] = React.useState('');
	const [code, setCode] = React.useState('');
	const [busy, setBusy] = React.useState(false);
	const hasData = Array.isArray(types) && types.length > 0 && typeof schedule === 'string' && schedule.length > 0;

	async function generate() {
		if (!hasData) return;
		if (!pass) return;
		setBusy(true);
		try {
			const secret = await encryptSelectionsE2E({ t: types, s: schedule }, pass);
			setCode(secret);
			try {
				await navigator.clipboard.writeText(secret);
			} catch {}
		} finally {
			setBusy(false);
		}
	}

	return (
		<div style={{ marginTop: 8 }}>
			<p className="subtitle">Prefer privacy? Create a secret code she can send you. Only your passphrase can decrypt it.</p>
			<div className="actions" style={{ gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
				<input
					type="password"
					placeholder="Passphrase"
					value={pass}
					onChange={e => setPass(e.target.value)}
					className="chip"
					style={{ padding: '10px 12px', minWidth: 220 }}
				/>
				<button className="btn btn-primary" disabled={!pass || !hasData || busy} onClick={generate}>
					{busy ? 'Generating…' : 'Generate secret code'}
				</button>
				<a className="btn btn-secondary" href="/decode">Open decoder</a>
			</div>
			{code && (
				<div className="actions" style={{ marginTop: 10, flexDirection: 'column' }}>
					<div className="subtitle">Share this code + your passphrase:</div>
					<div className="chip" style={{ wordBreak: 'break-all', background: '#fff' }}>{code}</div>
				</div>
			)}
		</div>
	);
}

function ResultsPage({ savedTypes, savedSchedule, onRestart }) {
	// Prefer querystring if present for sharing across devices
	const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
	const queryTypes = params.get('t') ? params.get('t').split(',').filter(Boolean) : [];
	const querySchedule = params.get('s') || '';
	const effectiveTypes = queryTypes.length ? queryTypes : savedTypes;
	const effectiveSchedule = querySchedule || savedSchedule;
	const hasData = Array.isArray(effectiveTypes) && effectiveTypes.length > 0 && typeof effectiveSchedule === 'string' && effectiveSchedule.length > 0;
	return (
		<div className="app">
			<HeartsBackground />
			<div className="card">
				{hasData ? (
					<>
						<ConfirmationPage types={effectiveTypes} schedule={effectiveSchedule} onRestart={onRestart} />
						<SecretShare types={effectiveTypes} schedule={effectiveSchedule} />
					</>
				) : (
					<div className="page confirm">
						<div className="big-emoji">🫶</div>
						<h1 className="title">No saved selections yet</h1>
						<p className="subtitle">Pick your date preferences first, then come back to <strong>/results</strong>.</p>
						<div className="actions" style={{ marginTop: 10 }}>
							<a className="btn btn-secondary" href="/">Back home</a>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function DecodePage() {
	const [code, setCode] = React.useState('');
	const [pass, setPass] = React.useState('');
	const [result, setResult] = React.useState(null);
	const [error, setError] = React.useState('');

	async function onDecode() {
		setError('');
		setResult(null);
		if (!code || !pass) return;
		const data = await decryptSelectionsE2E(code.trim(), pass);
		if (!data || !Array.isArray(data.t) || !data.s) {
			setError('Could not decrypt. Check code or passphrase.');
			return;
		}
		setResult({ types: data.t, schedule: data.s });
	}

	return (
		<div className="app">
			<HeartsBackground />
			<div className="card">
				<div className="page">
					<h1 className="title">Decode Choices</h1>
					<p className="subtitle">Paste the secret code and enter the passphrase.</p>
					<div className="actions" style={{ gap: 8, flexDirection: 'column', alignItems: 'stretch' }}>
						<textarea
							placeholder="Secret code"
							value={code}
							onChange={e => setCode(e.target.value)}
							className="chip"
							style={{ minHeight: 80 }}
						/>
						<input
							type="password"
							placeholder="Passphrase"
							value={pass}
							onChange={e => setPass(e.target.value)}
							className="chip"
						/>
						<div className="actions" style={{ justifyContent: 'center' }}>
							<button className="btn btn-primary" onClick={onDecode} disabled={!code || !pass}>Decode</button>
							<a className="btn btn-secondary" href="/">Home</a>
						</div>
						{error && <div className="subtitle" style={{ color: '#f43f5e' }}>{error}</div>}
					</div>
					{result && (
						<div style={{ marginTop: 12 }}>
							<ConfirmationPage
								types={result.types}
								schedule={result.schedule}
								onRestart={() => {
									setResult(null);
									setCode('');
									setPass('');
								}}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function App() {
	const [step, setStep] = useState(0);
	const [dateTypes, setDateTypes] = useState([]);
	const [schedule, setSchedule] = useState('');
	const [route, setRoute] = useState(window.location.pathname);
	const [justDodgedAt, setJustDodgedAt] = useState(0);

	// Load any saved selections (for /results deep link)
	useEffect(() => {
		try {
			const raw = localStorage.getItem('dateAppSelections');
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed?.dateTypes)) setDateTypes(parsed.dateTypes);
				if (typeof parsed?.schedule === 'string') setSchedule(parsed.schedule);
			}
		} catch {
			// ignore
		}
	}, []);

	// Persist selections
	useEffect(() => {
		try {
			localStorage.setItem('dateAppSelections', JSON.stringify({ dateTypes, schedule }));
		} catch {
			// ignore
		}
	}, [dateTypes, schedule]);

	// Simple client-side routing
	useEffect(() => {
		function onPop() {
			setRoute(window.location.pathname);
		}
		window.addEventListener('popstate', onPop);
		return () => window.removeEventListener('popstate', onPop);
	}, []);

	function navigate(path) {
		if (path !== window.location.pathname) {
			window.history.pushState({}, '', path);
			setRoute(path);
		}
	}

	function toggleType(type) {
		setDateTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
	}

	function buildResultsPath(types, when) {
		const sp = new URLSearchParams();
		if (types?.length) sp.set('t', types.join(','));
		if (when) sp.set('s', when);
		const qs = sp.toString();
		return '/results' + (qs ? `?${qs}` : '');
	}

	// If user lands on /results directly, render results page
	const friendly = parseFriendlyResultsPath(route);
	if (friendly) {
		return (
			<ResultsPage
				savedTypes={friendly.types}
				savedSchedule={friendly.schedule}
				onRestart={() => {
					setDateTypes([]);
					setSchedule('');
					navigate('/');
					setStep(0);
				}}
			/>
		);
	}
	if (route === '/results') {
		return (
			<ResultsPage
				savedTypes={dateTypes}
				savedSchedule={schedule}
				onRestart={() => {
					setDateTypes([]);
					setSchedule('');
					navigate('/');
					setStep(0);
				}}
			/>
		);
	}
	if (route === '/decode') {
		return <DecodePage />;
	}

	return (
		<div className="app">
			<HeartsBackground />
			<div className="card" key={step}>
				{step === 0 && (
					<LandingPage
						onYes={() => {
							// Guard against accidental Yes right after a dodge
							if (Date.now() - justDodgedAt < 350) return;
							setStep(1);
						}}
						onDodge={() => setJustDodgedAt(Date.now())}
					/>
				)}
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
						onNext={() => {
							setStep(3);
							navigate(buildFriendlyResultsPath(dateTypes, schedule));
						}}
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
							navigate('/');
						}}
					/>
				)}
			</div>
		</div>
	);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


