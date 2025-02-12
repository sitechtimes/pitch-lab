const NOTES = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];

// A4 is the reference note with a frequency of 440 Hz
const A4_FREQUENCY = 440;

// Calculate the frequency of a note given its index relative to A4
function getFrequency(noteIndex) {
    return A4_FREQUENCY * Math.pow(2, noteIndex / 12);
}

// Get the closest note and its frequency from a given frequency
export function getNoteFromFrequency(frequency) {
    const noteIndex = Math.round(12 * Math.log2(frequency / A4_FREQUENCY));
    const note = NOTES[(noteIndex + 9) % 12]; // Adjust for A4 being the 9th note
    const octave = Math.floor((noteIndex + 9) / 12) - 1;
    return { note: `${note}${octave}`, frequency: getFrequency(noteIndex) };
}

// Calculate how many cents off the detected frequency is from the target note
export function getCentsOff(detectedFrequency, targetFrequency) {
    return 1200 * Math.log2(detectedFrequency / targetFrequency);
}