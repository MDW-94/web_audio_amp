const volume = document.getElementById("volume");
const bass = document.getElementById("bass");
const mid = document.getElementById("mid");
const treble = document.getElementById("treble");
const visualiser = document.getElementById("visualiser");

const context = new AudioContext();
const analyserNode = new AnalyserNode(context, { fftSize: 128 });

function getGuitar() {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      autoGainControl: false,
      noiseSuppresion: false,
      latency: 0,
    },
  });
}

async function setupContext() {
  const guitar = await getGuitar();
  if (context.state === "suspended") {
    await context.resume();
  }
  const source = context.createMediaStreamSource(guitar);
  source.connect(analyserNode).connect(context.destination);
}

function drawVisualiser() {
  requestAnimationFrame(drawVisualiser);

  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNode.getByteFrequencyData(dataArray);
  const width = visualiser.width;
  const height = visualiser.height;
  const barWidth = width / bufferLength;
  const canvasContext = visualiser.getContext("2d");
  canvasContext.clearRect(0, 0, width, height);
  dataArray.forEach((item, index) => {
    const y = ((item / 255) * height) / 2;
    const x = barWidth * index;

    canvasContext.fillStyle = `hsl(${(y / height) * 400}, 100%, 50%)`;
    canvasContext.fillRect(x, height - y, barWidth, y);
  });
}

function resize() {
  visualiser.width = visualiser.clientWidth * window.devicePixelRatio;
  visualiser.height = visualiser.clientHeight * window.devicePixelRatio;
}

resize();
setupContext();
drawVisualiser();
