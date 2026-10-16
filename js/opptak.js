// Lydopptak for «Si det høyt». Bruker MediaRecorder når den finnes,
// ellers getUserMedia + Web Audio som lager en WAV-fil.
// Mikrofonen slås av etter hvert opptak, slik at avspillingen får full lyd
// og den røde mikrofon-indikatoren forsvinner.

export function kanTaOpp() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function stoppStrom(strom) {
  strom.getTracks().forEach((t) => t.stop());
}

export async function startOpptak() {
  const strom = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true }
  });
  try {
    return window.MediaRecorder ? medRecorder(strom) : medWebAudio(strom);
  } catch (e) {
    // Noen versjoner har MediaRecorder, men feiler likevel.
    try {
      return medWebAudio(strom);
    } catch (e2) {
      stoppStrom(strom);
      throw e2;
    }
  }
}

function medRecorder(strom) {
  const typer = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
  const type = MediaRecorder.isTypeSupported ? typer.find((t) => MediaRecorder.isTypeSupported(t)) : null;
  const rec = type ? new MediaRecorder(strom, { mimeType: type }) : new MediaRecorder(strom);
  const biter = [];
  rec.ondataavailable = (e) => { if (e.data && e.data.size) biter.push(e.data); };
  rec.start();
  let stoppet = null;
  return {
    stopp() {
      if (stoppet) return stoppet;
      stoppet = new Promise((resolve) => {
        rec.onstop = () => {
          stoppStrom(strom);
          const blob = new Blob(biter, { type: rec.mimeType || type || 'audio/mp4' });
          resolve(URL.createObjectURL(blob));
        };
        if (rec.state === 'inactive') rec.onstop();
        else rec.stop();
      });
      return stoppet;
    }
  };
}

function medWebAudio(strom) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const kilde = ctx.createMediaStreamSource(strom);
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const biter = [];
  proc.onaudioprocess = (e) => biter.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  kilde.connect(proc);
  proc.connect(ctx.destination);
  let stoppet = null;
  return {
    stopp() {
      if (stoppet) return stoppet;
      proc.disconnect();
      kilde.disconnect();
      stoppStrom(strom);
      const rate = ctx.sampleRate;
      ctx.close();
      stoppet = Promise.resolve(URL.createObjectURL(lagWav(biter, rate)));
      return stoppet;
    }
  };
}

function lagWav(biter, rate) {
  const lengde = biter.reduce((s, b) => s + b.length, 0);
  const buf = new ArrayBuffer(44 + lengde * 2);
  const v = new DataView(buf);
  const skriv = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  skriv(0, 'RIFF');
  v.setUint32(4, 36 + lengde * 2, true);
  skriv(8, 'WAVE');
  skriv(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  skriv(36, 'data');
  v.setUint32(40, lengde * 2, true);
  let o = 44;
  for (const b of biter) {
    for (let i = 0; i < b.length; i++) {
      const s = Math.max(-1, Math.min(1, b[i]));
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([buf], { type: 'audio/wav' });
}
