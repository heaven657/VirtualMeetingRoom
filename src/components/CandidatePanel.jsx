import { useEffect, useState } from 'react';
import { gatherCandidates } from '../lib/gatherCandidates';

// If your lab file already has CONFIGS, use that one instead of this.
const CONFIGS = {
    none: [],
    stun: [{ urls: 'stun:stun.l.google.com:19302' }],
    wrong: [{ urls: 'stun:192.0.2.1:3478' }],
};

const ROW_COLOURS = {
    host: '#dbeafe', // blue
    srflx: '#dcfce7', // green
};

export default function CandidatePanel() {
    const [config, setConfig] = useState('stun');
    const [candidates, setCandidates] = useState([]);
    const [gatheringState, setGatheringState] = useState('new');
    const [elapsed, setElapsed] = useState(null);

    const iceServers = CONFIGS[config]; // stable reference per config

    useEffect(() => {
        let active = true;
        const start = performance.now();

        // fresh run: empty the table
        setCandidates([]);
        setGatheringState('new');
        setElapsed(null);

        const stop = gatherCandidates({
            iceServers,
            onCandidate: (c) => {
                if (!active) return;
                setCandidates((prev) => [
                    ...prev,
                    {
                        type: c.type,
                        protocol: c.protocol,
                        address: c.address,
                        port: c.port,
                        priority: c.priority,
                        foundation: c.foundation,
                    },
                ]);
            },
            onDone: () => {
                if (active) setElapsed(Math.round(performance.now() - start));
            },
            onStateChange: (s) => {
                if (active) setGatheringState(s);
            },
        });

        return () => {
            active = false;
            stop();
        };
    }, [iceServers]);

    const sorted = [...candidates].sort((a, b) => b.priority - a.priority);

    return (
        <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
            <h2>Candidate Gathering</h2>

            <div style={{ marginBottom: 12 }}>
                {Object.keys(CONFIGS).map((name) => (
                    <button
                        key={name}
                        onClick={() => setConfig(name)}
                        style={{ marginRight: 8, fontWeight: config === name ? 'bold' : 'normal' }}
                    >
                        {name}
                    </button>
                ))}
            </div>

            <p>
                Gathering state: <b>{gatheringState}</b> | Gathering time:{' '}
                <b>{elapsed === null ? '...' : `${elapsed} ms`}</b>
            </p>

            <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>type</th>
                        <th>protocol</th>
                        <th>address : port</th>
                        <th>priority</th>
                        <th>foundation</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((c) => (
                        <tr
                            key={`${c.foundation}-${c.protocol}-${c.address}-${c.port}`}
                            style={{ background: ROW_COLOURS[c.type] }}
                        >
                            <td>{c.type}</td>
                            <td>{c.protocol}</td>
                            <td>{c.address}:{c.port}</td>
                            <td>{c.priority}</td>
                            <td>{c.foundation}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}