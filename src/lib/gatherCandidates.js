// Plain JavaScript, no React.
export function gatherCandidates({ iceServers, onCandidate, onDone, onStateChange }) {
    const pc = new RTCPeerConnection({ iceServers });
    pc.createDataChannel('probe');

    pc.addEventListener('icegatheringstatechange', () => {
        if (onStateChange) onStateChange(pc.iceGatheringState);
    });

    pc.addEventListener('icecandidate', (event) => {
        if (event.candidate) onCandidate(event.candidate);
        else onDone(); // null candidate = gathering finished
    });

    pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((err) => console.error('offer failed', err));

    return () => pc.close();
}