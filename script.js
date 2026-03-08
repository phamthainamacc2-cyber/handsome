/* ============================================
   BeautyScan AI — script.js
   Camera + Face Detection + Beauty Scoring
   ============================================ */
'use strict';

// ── DOM refs ─────────────────────────────────
const $ = id => document.getElementById(id);
const welcomeScreen = $('welcomeScreen');
const cameraScreen  = $('cameraScreen');
const resultScreen  = $('resultScreen');
const video         = $('video');
const overlay       = $('overlay');
const startCameraBtn= $('startCameraBtn');
const scanBtn       = $('scanBtn');
const backBtn       = $('backBtn');
const rescanBtn     = $('rescanBtn');
const shareBtn      = $('shareBtn');
const statusLabel   = $('statusLabel');
const faceCountEl   = $('faceCount');
const hudRes        = $('hudRes');
const hudConf       = $('hudConf');
const scanBeam      = $('scanBeam');
const scanVfx       = $('scanVfx');
const vfxText       = $('vfxText');
const scoreArc      = $('scoreArc');
const scoreNum      = $('scoreNum');
const gradeBadge    = $('gradeBadge');
const gradeEmoji    = $('gradeEmoji');
const gradeText     = $('gradeText');
const resultComment = $('resultComment');
const statsGrid     = $('statsGrid');
const particles     = $('particles');

let stream = null;
let detectionInterval = null;
let faceDetected = false;
let modelsLoaded = false;

// ── Toast ─────────────────────────────────────
let _tt = null;
function toast(msg, ms = 2800) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => el.classList.remove('show'), ms);
}

// ── Screen transitions ────────────────────────
function showScreen(name) {
  [welcomeScreen, cameraScreen, resultScreen].forEach(s => s.classList.remove('active'));
  if (name === 'welcome') welcomeScreen.classList.add('active');
  if (name === 'camera')  cameraScreen.classList.add('active');
  if (name === 'result')  resultScreen.classList.add('active');
}

// ── Load face-api models ──────────────────────
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model/';

async function loadModels() {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log('[BeautyScan] Models loaded ✓');
  } catch (e) {
    console.warn('[BeautyScan] Face-api model load failed, using fallback mode:', e.message);
    modelsLoaded = false;
  }
}

// Preload models silently
loadModels();

// ── Start camera ──────────────────────────────
startCameraBtn.addEventListener('click', async () => {
  startCameraBtn.disabled = true;
  startCameraBtn.textContent = 'Đang kết nối...';

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    video.srcObject = stream;
    await new Promise(r => video.onloadedmetadata = r);
    video.play();

    // Set overlay canvas size
    overlay.width  = video.videoWidth;
    overlay.height = video.videoHeight;
    hudRes.textContent = `${video.videoWidth}×${video.videoHeight}`;

    showScreen('camera');
    startDetection();
  } catch (err) {
    console.error(err);
    startCameraBtn.disabled = false;
    startCameraBtn.innerHTML = '<span class="btn-icon">📷</span><span>Bật Camera</span><div class="btn-glow"></div>';
    if (err.name === 'NotAllowedError') {
      toast('🚫 Vui lòng cho phép truy cập camera');
    } else {
      toast('❌ Không thể mở camera: ' + err.message);
    }
  }
});

// ── Face detection loop ───────────────────────
async function startDetection() {
  if (detectionInterval) clearInterval(detectionInterval);

  // Enable scan button after 1.5s regardless
  setTimeout(() => {
    scanBtn.disabled = false;
    if (!faceDetected) {
      statusLabel.textContent = 'Camera sẵn sàng — Nhấn quét!';
      $('sbDot') && ($('sbDot').classList.add('active'));
    }
  }, 1500);

  if (!modelsLoaded) {
    // Fallback: no real detection, just fake confidence
    statusLabel.textContent = 'Camera sẵn sàng — Nhấn quét!';
    $('statusLabel').previousElementSibling.classList.add('active');
    faceDetected = true;
    hudConf.textContent = 'N/A';
    faceCountEl.textContent = '— face';
    return;
  }

  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 });

  detectionInterval = setInterval(async () => {
    if (video.paused || video.ended) return;
    try {
      const result = await faceapi.detectSingleFace(video, options).withFaceLandmarks(true);
      const ctx = overlay.getContext('2d');
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      if (result) {
        faceDetected = true;
        scanBtn.disabled = false;
        statusLabel.textContent = 'Phát hiện khuôn mặt ✓';
        document.querySelector('.sb-dot').classList.add('active');
        faceCountEl.textContent = '1 face';
        hudConf.textContent = (result.detection.score * 100).toFixed(0) + '%';

        // Draw face box
        const box = result.detection.box;
        const scaleX = overlay.width  / video.videoWidth;
        const scaleY = overlay.height / video.videoHeight;
        ctx.strokeStyle = 'rgba(0,229,255,0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          box.x * scaleX, box.y * scaleY,
          box.width * scaleX, box.height * scaleY
        );

        // Draw landmarks dots
        if (result.landmarks) {
          ctx.fillStyle = 'rgba(255,45,120,0.7)';
          result.landmarks.positions.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x * scaleX, pt.y * scaleY, 1.5, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      } else {
        faceDetected = false;
        document.querySelector('.sb-dot').classList.remove('active');
        statusLabel.textContent = 'Hướng camera về phía khuôn mặt';
        faceCountEl.textContent = '0 face';
        hudConf.textContent = '0%';
      }
    } catch (e) {
      // Silently ignore detection errors
    }
  }, 250);
}

// ── Back button ───────────────────────────────
backBtn.addEventListener('click', () => {
  stopCamera();
  showScreen('welcome');
  startCameraBtn.disabled = false;
  startCameraBtn.innerHTML = '<span class="btn-icon">📷</span><span>Bật Camera</span><div class="btn-glow"></div>';
});

function stopCamera() {
  if (detectionInterval) { clearInterval(detectionInterval); detectionInterval = null; }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
}

// ── SCAN ─────────────────────────────────────
const SCAN_MSGS = [
  'DETECTING FACIAL GEOMETRY...',
  'ANALYZING SYMMETRY...',
  'COMPUTING BEAUTY VECTORS...',
  'CROSS-REFERENCING DATABASE...',
  'FINALIZING SCORE...',
];

const COMMENTS = [
  { min: 90, texts: [
    'Nhan sắc vượt trội — AI phải tính toán lại công thức 🤩',
    'Khuôn mặt cân đối hoàn hảo, hiếm thấy trong dữ liệu của chúng tôi.',
    'Thần thái tỏa sáng ngay cả qua màn hình camera!',
    'Top 1% trong cơ sở dữ liệu phân tích của AI.',
  ]},
  { min: 75, texts: [
    'Gương mặt rất sáng và thân thiện, tạo thiện cảm ngay từ cái nhìn đầu tiên.',
    'Phong thái giống người nổi tiếng — rất có khí chất.',
    'Nụ cười rất thu hút, AI phát hiện chỉ số charisma cao.',
    'Gương mặt có thần thái, ánh mắt cuốn hút đặc biệt.',
  ]},
  { min: 60, texts: [
    'Dáng vẻ rất giống bác sĩ — toát lên sự trưởng thành và đáng tin.',
    'Khuôn mặt thể hiện sự thông minh và bản lĩnh rõ ràng.',
    'AI nhận diện đặc điểm của một người có tố chất lãnh đạo.',
    'Vẻ ngoài cuốn hút theo phong cách riêng, khó quên.',
  ]},
  { min: 45, texts: [
    'Khuôn mặt mang nét cá tính độc đáo, khó lẫn với ai.',
    'AI phát hiện nét duyên ẩn — cần góc chụp tốt hơn để thể hiện!',
    'Phong thái bình dị nhưng ấm áp, gần gũi.',
    'Gương mặt thể hiện sự chân thành — điểm cộng lớn!',
  ]},
  { min: 0, texts: [
    'AI đang gặp khó khăn với ánh sáng — hãy thử lại ở nơi sáng hơn nhé! 😄',
    'Khuôn mặt có nhiều bí ẩn mà AI chưa giải mã được hết.',
    'Vẻ đẹp thật sự nằm ở bên trong — AI chỉ quét bề mặt thôi!',
    'Điểm số chỉ là con số — nụ cười của bạn mới là điều quan trọng nhất.',
  ]},
];

const STAT_LABELS = ['ĐỐI XỨNG', 'ĐỘ SÁNG', 'NÉT MẶT', 'ÁNH MẮT', 'NỤ CƯỜI', 'THẦN THÁI'];

function getGrade(score) {
  if (score >= 90) return { emoji: '💎', text: 'LEGENDARY', color: '#ffd700', glow: 'rgba(255,215,0,0.4)' };
  if (score >= 75) return { emoji: '🌟', text: 'STUNNING',  color: '#00e5ff', glow: 'rgba(0,229,255,0.4)' };
  if (score >= 60) return { emoji: '✨', text: 'CHARMING',  color: '#c084fc', glow: 'rgba(192,132,252,0.4)' };
  if (score >= 45) return { emoji: '🙂', text: 'PLEASANT',  color: '#4ade80', glow: 'rgba(74,222,128,0.4)' };
  return               { emoji: '😄', text: 'UNIQUE',    color: '#fb923c', glow: 'rgba(251,146,60,0.4)' };
}

function getComment(score) {
  const group = COMMENTS.find(g => score >= g.min);
  const arr = group ? group.texts : COMMENTS[COMMENTS.length-1].texts;
  return arr[Math.floor(Math.random() * arr.length)];
}

function spawnParticles(score) {
  particles.innerHTML = '';
  const count = Math.floor(score / 5) + 8;
  const colors = ['#00e5ff','#ff2d78','#ffd700','#c084fc','#4ade80'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = Math.random() * 360;
    const dist  = 60 + Math.random() * 80;
    const tx = Math.cos(angle * Math.PI/180) * dist;
    const ty = Math.sin(angle * Math.PI/180) * dist;
    p.style.cssText = `
      left: 50%; top: 50%;
      background: ${colors[Math.floor(Math.random()*colors.length)]};
      --tx: ${tx}px; --ty: ${ty}px;
      animation-delay: ${Math.random()*0.5}s;
      animation-duration: ${0.8 + Math.random()*0.8}s;
    `;
    particles.appendChild(p);
  }
}

function animateScore(target) {
  const circumference = 2 * Math.PI * 95; // r=95
  let current = 0;
  const step = target / 60; // ~60 frames
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    scoreNum.textContent = Math.round(current);
    // Arc: dashoffset goes from circumference (empty) to circumference*(1-pct)
    const offset = circumference * (1 - current / 100);
    scoreArc.style.strokeDashoffset = offset;
    if (current >= target) clearInterval(interval);
  }, 16);
}

function buildStats() {
  statsGrid.innerHTML = '';
  STAT_LABELS.forEach(label => {
    const val = 40 + Math.floor(Math.random() * 58);
    const cell = document.createElement('div');
    cell.className = 'stat-cell';
    cell.innerHTML = `
      <span class="stat-label">${label}</span>
      <span class="stat-val">${val}</span>
      <div class="stat-bar"><div class="stat-bar-fill" style="width:0%"></div></div>
    `;
    statsGrid.appendChild(cell);
    // Animate bar after paint
    setTimeout(() => {
      cell.querySelector('.stat-bar-fill').style.width = val + '%';
    }, 300);
  });
}

let msgIdx = 0;
let msgInterval = null;

scanBtn.addEventListener('click', async () => {
  scanBtn.disabled = true;

  // Start scan VFX
  scanBeam.classList.add('active');
  scanVfx.classList.add('active');
  msgIdx = 0;
  vfxText.textContent = SCAN_MSGS[0];
  msgInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % SCAN_MSGS.length;
    vfxText.textContent = SCAN_MSGS[msgIdx];
  }, 600);

  // Wait 3 seconds for dramatic effect
  await new Promise(r => setTimeout(r, 3200));

  // Generate score
  const score = 38 + Math.floor(Math.random() * 61); // 38–98 range (always looks good)

  // Stop VFX
  clearInterval(msgInterval);
  scanBeam.classList.remove('active');
  scanVfx.classList.remove('active');

  // Stop detection
  stopCamera();

  // Show result
  showScreen('result');
  resultScreen.scrollTop = 0;

  // Apply grade
  const grade = getGrade(score);
  gradeBadge.style.borderColor = grade.color;
  gradeBadge.style.boxShadow   = `0 0 20px ${grade.glow}`;
  gradeBadge.style.color       = grade.color;
  gradeEmoji.textContent       = grade.emoji;
  gradeText.textContent        = grade.text;

  // Comment
  resultComment.textContent = getComment(score);

  // Stats
  buildStats();

  // Animate score after small delay
  setTimeout(() => {
    animateScore(score);
    spawnParticles(score);
  }, 300);
});

// ── Rescan ────────────────────────────────────
rescanBtn.addEventListener('click', async () => {
  showScreen('camera');
  scanBtn.disabled = false;
  scoreArc.style.strokeDashoffset = 597;
  scoreNum.textContent = '0';

  // Restart camera
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    video.srcObject = stream;
    await new Promise(r => video.onloadedmetadata = r);
    video.play();
    overlay.width  = video.videoWidth;
    overlay.height = video.videoHeight;
    startDetection();
  } catch (e) {
    toast('❌ Không thể mở camera');
    showScreen('welcome');
  }
});

// ── Share ─────────────────────────────────────
shareBtn.addEventListener('click', async () => {
  const score = scoreNum.textContent;
  const text = `Điểm Beauty Score của tôi: ${score}/100 ✨\nKiểm tra nhan sắc tại: ${location.href}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'BeautyScan AI', text });
    } catch {}
  } else {
    await navigator.clipboard.writeText(text);
    toast('✅ Đã sao chép link chia sẻ!');
  }
});

// ── HUD fake flicker ──────────────────────────
setInterval(() => {
  if (!stream) return;
  hudRes.style.opacity = Math.random() > 0.95 ? '0.3' : '1';
}, 200);
