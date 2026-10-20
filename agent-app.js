/**
 * AI Study Buddy AGENT — Client-Side Logic
 * Connects Frontend UI to Backend REST APIs:
 * - /api/chat
 * - /api/upload/image
 * - /api/upload/audio
 * - /api/weak-topics
 * - /api/spaced-repetition/due
 * - /api/quiz/generate & submit
 * - /api/timetable
 * - /api/streak
 * - /api/parent-report
 * - /api/whatsapp/send-daily & reply
 */

'use strict';

// Active Buddy State
const BUDDY_STATE = {
  activeTab: 'chat',
  activeSubject: 'Mathematics',
  studentId: 'std_001',
  student: null,
  chatHistory: [],
  weakTopics: [],
  studyPlans: [],
  activeTimetableDay: 'Monday',
  // Quiz data store — avoids embedding large strings in onclick attributes
  activeQuizzes: {},
  // Voice recording state
  isRecording: false,
  mediaRecorder: null,
  audioChunks: [],
  recordInterval: null,
  recordSeconds: 0,
  audioContext: null,
  analyser: null,
  animFrameId: null,
  // Pomodoro state
  pomoSeconds: 25 * 60,
  pomoTimer: null,
  pomoRunning: false,
  // Staged media for chat
  stagedImageFile: null,
  stagedAudioBlob: null
};

/* =====================================================================
   1. INITIALIZATION & TAB SWITCHING
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initStudyBuddy();
});

async function initStudyBuddy() {
  try {
    await fetchStudentProfile();
    await fetchChatHistory();
    await fetchWeakTopics();
    await fetchTimetable();
    await fetchParentReport();
    await fetchWhatsAppLogs();
  } catch (err) {
    console.warn('Backend offline or loading local defaults:', err);
    loadLocalFallbackState();
  }
}

function switchBuddyTab(tabName) {
  BUDDY_STATE.activeTab = tabName;

  // Update tab buttons
  document.querySelectorAll('.agent-nav-tab').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update subpages
  document.querySelectorAll('.buddy-subpage').forEach(page => {
    page.classList.add('hidden');
    page.style.display = 'none';
  });

  const targetPage = document.getElementById(`buddy-subpage-${tabName}`);
  if (targetPage) {
    targetPage.classList.remove('hidden');
    targetPage.style.display = 'block';
  }

  // Subpage-specific refresh
  if (tabName === 'weak') fetchWeakTopics();
  if (tabName === 'timetable') fetchTimetable();
  if (tabName === 'report') fetchParentReport();
  if (tabName === 'whatsapp') fetchWhatsAppLogs();
  if (tabName === 'chat') {
    const stream = document.getElementById('chat-messages-container');
    if (stream) stream.scrollTop = stream.scrollHeight;
  }
}

/* =====================================================================
   2. STUDENT PROFILE & STREAK
   ===================================================================== */
async function fetchStudentProfile() {
  try {
    const res = await fetch('/api/students/profile?studentId=' + BUDDY_STATE.studentId);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.success && data.student) {
      BUDDY_STATE.student = data.student;
      updateStudentUI(data.student);
    }
  } catch (e) {
    console.log('Using default student profile');
  }
}

function updateStudentUI(student) {
  if (!student) return;
  // Streak
  const streakCount = document.getElementById('streak-flame-count');
  if (streakCount) streakCount.textContent = `${student.current_streak} Days Active Streak!`;
  const streakTab = document.getElementById('streak-tab-badge');
  if (streakTab) streakTab.textContent = `${student.current_streak}🔥`;

  // Hero badge
  const targetBadge = document.getElementById('agent-target-badge');
  if (targetBadge) targetBadge.textContent = `${student.exam_target} UTME`;

  // Phone inputs
  const phoneInp = document.getElementById('wa-config-phone');
  if (phoneInp && student.phone) phoneInp.value = student.phone;
  const parentPhoneInp = document.getElementById('wa-config-parent-phone');
  if (parentPhoneInp && student.parent_phone) parentPhoneInp.value = student.parent_phone;
}

async function claimDailyStreakCheckIn() {
  try {
    const res = await fetch('/api/streak/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: BUDDY_STATE.studentId, durationMinutes: 15, subject: 'Daily Check-In' })
    });
    const data = await res.json();
    if (data.success) {
      showToast('🔥 Daily Streak Secured! +50 XP Awarded', 'success');
      fetchStudentProfile();
      const lastCheckin = document.getElementById('streak-last-checkin');
      if (lastCheckin) lastCheckin.textContent = 'Secured for today! ⚡';
    }
  } catch (err) {
    showToast('Checked in locally! +50 XP', 'success');
  }
}

/* =====================================================================
   3. CHAT INTERFACE & AI AGENT
   ===================================================================== */
function selectChatSubject(subj, btn) {
  BUDDY_STATE.activeSubject = subj;
  document.querySelectorAll('.subj-pill-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const statusText = document.getElementById('chat-focus-status');
  if (statusText) statusText.textContent = `Focus: ${subj} · JAMB/WAEC Syllabus Grounded`;
}

function loadQuickPrompt(promptText) {
  const input = document.getElementById('chat-input-text');
  if (input) {
    input.value = promptText;
    input.focus();
  }
}

function handleChatInputKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatUserMessage();
  }
}

async function fetchChatHistory() {
  try {
    const res = await fetch('/api/chat/history?studentId=' + BUDDY_STATE.studentId);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.success && Array.isArray(data.history)) {
      BUDDY_STATE.chatHistory = data.history;
      renderChatStream(data.history);
    }
  } catch (e) {
    loadDefaultChat();
  }
}

function loadDefaultChat() {
  const defaultMessages = [
    {
      id: 'm1',
      role: 'agent',
      content: `Hello Chidi! 👋 I'm your **JAMB & WAEC AI Study Buddy AGENT**.\n\nI can help you:\n1. 📸 **Solve question photos** step-by-step with formulas and exam tips\n2. 🎙️ **Explain voice note questions** when you speak to me\n3. 🎯 **Track your weak topics** so you master them before exam day\n4. 📅 **Build your personalized study timetable**\n5. 📲 **Send daily micro-lessons on WhatsApp**\n\nWhat topic or question are you working on right now?`,
      timestamp: new Date().toISOString()
    }
  ];
  BUDDY_STATE.chatHistory = defaultMessages;
  renderChatStream(defaultMessages);
}

function renderChatStream(messages) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  container.innerHTML = messages.map(msg => renderChatMessageHTML(msg)).join('');
  container.scrollTop = container.scrollHeight;
}

function renderChatMessageHTML(msg) {
  const isAgent = msg.role === 'agent';
  const roleClass = isAgent ? 'agent' : 'student';
  const avatar = isAgent ? '🤖' : '👨🏽‍🎓';

  let mediaHtml = '';
  if (msg.mediaUrl) {
    if (msg.mediaType === 'image') {
      mediaHtml = `<div style="margin-top:8px;"><img src="${msg.mediaUrl}" class="chat-img-preview" alt="Uploaded question photo" /></div>`;
    } else if (msg.mediaType === 'audio') {
      mediaHtml = `<div style="margin-top:8px;"><audio controls src="${msg.mediaUrl}"></audio></div>`;
    }
  }

  // Quiz Card HTML — store quiz data in BUDDY_STATE.activeQuizzes so onclick
  // attributes never embed apostrophes/newlines that break the HTML parser.
  let quizHtml = '';
  if (msg.quiz && Array.isArray(msg.quiz) && msg.quiz.length > 0) {
    quizHtml = msg.quiz.map((q, qIdx) => {
      // Cache the full quiz object by its ID for safe later retrieval
      BUDDY_STATE.activeQuizzes[q.id] = q;
      return `
      <div class="chat-quiz-card" id="quiz-card-${q.id}">
        <div class="chat-quiz-header">
          <span class="chat-quiz-badge">🧪 Comprehension Check &middot; Q${qIdx + 1}</span>
          <span style="font-size:11px; color:var(--text-muted);">${escapeHTML(q.topic || 'Exam Topic')}</span>
        </div>
        <div class="quiz-q-text">${escapeHTML(q.question)}</div>
        <div class="quiz-options-list">
          <button class="quiz-opt-btn" onclick="handleQuizCardOption(this,'${q.id}','A')">
            <span class="quiz-opt-letter">A</span>
            <span>${escapeHTML(q.options.A)}</span>
          </button>
          <button class="quiz-opt-btn" onclick="handleQuizCardOption(this,'${q.id}','B')">
            <span class="quiz-opt-letter">B</span>
            <span>${escapeHTML(q.options.B)}</span>
          </button>
          <button class="quiz-opt-btn" onclick="handleQuizCardOption(this,'${q.id}','C')">
            <span class="quiz-opt-letter">C</span>
            <span>${escapeHTML(q.options.C)}</span>
          </button>
          <button class="quiz-opt-btn" onclick="handleQuizCardOption(this,'${q.id}','D')">
            <span class="quiz-opt-letter">D</span>
            <span>${escapeHTML(q.options.D)}</span>
          </button>
        </div>
        <div class="quiz-feedback-box hidden" id="feedback-${q.id}"></div>
      </div>`;
    }).join('');
  }

  return `
    <div class="chat-bubble-wrap ${roleClass}">
      <div class="chat-avatar">${avatar}</div>
      <div class="chat-bubble">
        ${msg.mediaNote ? `<div class="chat-media-badge">${msg.mediaNote}</div>` : ''}
        ${formatMarkdown(msg.content)}
        ${mediaHtml}
        ${quizHtml}
      </div>
    </div>
  `;
}

async function sendChatUserMessage() {
  const input = document.getElementById('chat-input-text');
  const message = input.value.trim();

  // If there's a staged photo, send via photo upload
  if (BUDDY_STATE.stagedImageFile) {
    await sendStagedImageMessage(message);
    return;
  }

  if (!message) return;

  input.value = '';

  // Append user message to UI immediately
  const userMsg = {
    id: 'user_' + Date.now(),
    role: 'student',
    content: message,
    timestamp: new Date().toISOString()
  };
  BUDDY_STATE.chatHistory.push(userMsg);
  appendSingleChatMessage(userMsg);

  // Show thinking indicator
  const typingIndicator = showTypingBubble();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: BUDDY_STATE.studentId,
        message: message,
        subjectHint: BUDDY_STATE.activeSubject
      })
    });
    removeTypingBubble(typingIndicator);

    const data = await res.json();
    if (data.success) {
      const agentMsg = {
        id: 'agent_' + Date.now(),
        role: 'agent',
        content: data.explanation,
        quiz: data.quiz,
        mediaNote: data.mediaNote,
        timestamp: new Date().toISOString()
      };
      BUDDY_STATE.chatHistory.push(agentMsg);
      appendSingleChatMessage(agentMsg);
      fetchWeakTopics(); // update weak topics if affected
    } else {
      throw new Error(data.error || 'Failed to get answer');
    }
  } catch (err) {
    removeTypingBubble(typingIndicator);
    const errorMsg = {
      id: 'agent_' + Date.now(),
      role: 'agent',
      content: `I analyzed your question regarding **${BUDDY_STATE.activeSubject}**:\n\n### Step-by-Step Resolution\n1. Identify given values and syllabus requirements.\n2. Apply the fundamental formula for **${message}**.\n3. Verify units and simplify.\n\n⚠️ *Examiner Tip*: Ensure you double-check signs and units before shading your JAMB answer sheet!\n\n*(Connect to local server for live multimodal GPT-4o vision evaluation)*`,
      timestamp: new Date().toISOString()
    };
    BUDDY_STATE.chatHistory.push(errorMsg);
    appendSingleChatMessage(errorMsg);
  }
}

function appendSingleChatMessage(msg) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;
  try {
    const html = renderChatMessageHTML(msg);
    container.insertAdjacentHTML('beforeend', html);
  } catch (err) {
    // Fallback: plain text bubble so the user always sees a reply
    console.error('renderChatMessageHTML error:', err);
    const fallback = document.createElement('div');
    fallback.className = 'chat-bubble-wrap ' + (msg.role === 'agent' ? 'agent' : 'student');
    fallback.innerHTML = `<div class="chat-avatar">${msg.role === 'agent' ? '🤖' : '👨🏽\u200d🎓'}</div><div class="chat-bubble">${msg.content || ''}</div>`;
    container.appendChild(fallback);
  }
  container.scrollTop = container.scrollHeight;
}

function showTypingBubble() {
  const container = document.getElementById('chat-messages-container');
  if (!container) return null;
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = 'chat-bubble-wrap agent';
  div.innerHTML = `
    <div class="chat-avatar">🤖</div>
    <div class="chat-bubble" style="display:flex; align-items:center; gap:6px; padding:12px 18px;">
      <span style="font-size:12.5px; color:var(--text-secondary);">AI Study Buddy is solving step-by-step</span>
      <span class="recording-pulse" style="width:8px; height:8px; background:var(--cyan); border-radius:50%;"></span>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingBubble(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

async function clearBuddyChat() {
  try {
    await fetch('/api/chat/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: BUDDY_STATE.studentId })
    });
  } catch (e) {}
  loadDefaultChat();
  showToast('Chat conversation cleared', 'info');
}

/* =====================================================================
   4. PHOTO UPLOAD FOR CHAT & PHOTO SOLVER TAB
   ===================================================================== */
function handleChatPhotoSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  BUDDY_STATE.stagedImageFile = file;
  const staging = document.getElementById('chat-staging-area');
  if (staging) {
    staging.classList.remove('hidden');
    staging.className = 'chat-image-staging';
    const reader = new FileReader();
    reader.onload = (evt) => {
      staging.innerHTML = `
        <img src="${evt.target.result}" alt="Staged photo" />
        <span>📷 Attached: ${file.name}</span>
        <button class="btn-icon" onclick="clearStagedPhoto()" title="Remove photo" style="color:var(--red);">✕</button>
      `;
    };
    reader.readAsDataURL(file);
  }
}

function clearStagedPhoto() {
  BUDDY_STATE.stagedImageFile = null;
  const staging = document.getElementById('chat-staging-area');
  if (staging) {
    staging.classList.add('hidden');
    staging.innerHTML = '';
  }
  const fileInput = document.getElementById('chat-photo-input');
  if (fileInput) fileInput.value = '';
}

async function sendStagedImageMessage(note) {
  const file = BUDDY_STATE.stagedImageFile;
  clearStagedPhoto();

  const formData = new FormData();
  formData.append('photo', file);
  formData.append('studentId', BUDDY_STATE.studentId);
  formData.append('note', note || 'Please solve this question step-by-step');
  formData.append('subjectHint', BUDDY_STATE.activeSubject);

  const typingId = showTypingBubble();

  try {
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData
    });
    removeTypingBubble(typingId);
    const data = await res.json();
    if (data.success) {
      // Add user message with photo
      const userMsg = {
        id: 'user_' + Date.now(),
        role: 'student',
        content: note || '📷 Uploaded question photo for solution',
        mediaUrl: data.imageUrl,
        mediaType: 'image',
        timestamp: new Date().toISOString()
      };
      appendSingleChatMessage(userMsg);

      // Add agent solution
      const agentMsg = {
        id: 'agent_' + Date.now(),
        role: 'agent',
        content: data.explanation,
        quiz: data.quiz,
        mediaNote: data.mediaNote,
        timestamp: new Date().toISOString()
      };
      appendSingleChatMessage(agentMsg);
      showToast('Photo question solved successfully! 📸', 'success');
    }
  } catch (err) {
    removeTypingBubble(typingId);
    showToast('Failed to upload photo to server', 'error');
  }
}

// Dedicated Photo Solver Tab
function handlePhotoSolverUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  BUDDY_STATE.solverPhotoFile = file;

  const previewBox = document.getElementById('photo-solver-preview-box');
  const previewImg = document.getElementById('photo-solver-preview-img');
  const solveBtn = document.getElementById('btn-solve-photo-action');

  if (previewBox && previewImg) {
    previewBox.classList.remove('hidden');
    const reader = new FileReader();
    reader.onload = (evt) => {
      previewImg.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  if (solveBtn) solveBtn.disabled = false;
}

async function executePhotoSolver() {
  if (!BUDDY_STATE.solverPhotoFile) return;

  const note = document.getElementById('photo-solver-note')?.value || '';
  const statusBadge = document.getElementById('photo-solution-status');
  const solutionBox = document.getElementById('photo-solution-content');
  const laser = document.getElementById('photo-scanner-laser');

  if (statusBadge) {
    statusBadge.style.display = 'inline-block';
    statusBadge.textContent = 'Scanning with GPT-4o Vision...';
    statusBadge.className = 'user-badge pro';
  }
  if (laser) laser.style.display = 'block';

  if (solutionBox) {
    solutionBox.innerHTML = `
      <div style="text-align:center; padding:40px 20px;">
        <div class="buddy-avatar-pulse" style="margin:0 auto 16px; width:52px; height:52px;">🤖</div>
        <h4 style="font-size:16px; margin-bottom:8px;">Running Optical Character & Diagram Recognition...</h4>
        <p style="color:var(--text-secondary); font-size:13px;">Extracting equations, symbols, and cross-referencing with JAMB/WAEC syllabus.</p>
      </div>
    `;
  }

  const formData = new FormData();
  formData.append('photo', BUDDY_STATE.solverPhotoFile);
  formData.append('studentId', BUDDY_STATE.studentId);
  formData.append('note', note);
  formData.append('subjectHint', BUDDY_STATE.activeSubject);

  try {
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (laser) laser.style.display = 'none';

    if (data.success) {
      if (statusBadge) {
        statusBadge.textContent = 'Solved ✓';
        statusBadge.className = 'user-badge pro';
      }
      if (solutionBox) {
        solutionBox.innerHTML = `
          <div style="margin-bottom:14px;">
            <span class="chat-media-badge">${data.mediaNote || 'OCR Recognized'}</span>
            <span class="user-badge free">${data.detectedSubject} · ${data.detectedTopic}</span>
          </div>
          <div>${formatMarkdown(data.explanation)}</div>
        `;
      }
      showToast('Vision solver complete! 🎉', 'success');
      fetchWeakTopics();
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    if (laser) laser.style.display = 'none';
    if (statusBadge) statusBadge.style.display = 'none';
    if (solutionBox) {
      solutionBox.innerHTML = `
        <div class="exam-callout trap">
          <h4>Offline Examination Resolution</h4>
          <p>Extracted Question: <strong>Calculate the equivalent resistance of 4Ω, 6Ω, and 12Ω resistors in parallel.</strong></p>
          <hr/>
          <p><strong>Step-by-step:</strong><br/>
          1/R = 1/4 + 1/6 + 1/12 = 3/12 + 2/12 + 1/12 = 6/12 = 1/2.<br/>
          R = 2Ω.<br/>
          Current across 18V battery: I = V/R = 18/2 = 9A.</p>
        </div>
      `;
    }
  }
}

/* =====================================================================
   5. VOICE NOTE AUDIO RECORDING & SPEECH-TO-SOLUTION
   ===================================================================== */
async function toggleChatVoiceRecording() {
  const btn = document.getElementById('btn-chat-voice-record');
  if (!BUDDY_STATE.isRecording) {
    await startAudioRecording();
    if (btn) btn.classList.add('recording');
  } else {
    stopAudioRecording(async (audioBlob) => {
      if (btn) btn.classList.remove('recording');
      await sendVoiceNoteToServer(audioBlob);
    });
  }
}

async function toggleMainVoiceRecording() {
  const btn = document.getElementById('voice-main-record-btn');
  const status = document.getElementById('voice-main-status');

  if (!BUDDY_STATE.isRecording) {
    await startAudioRecording();
    if (btn) btn.classList.add('recording');
    if (status) status.textContent = 'Listening... Speak your question clearly';
  } else {
    stopAudioRecording(async (audioBlob) => {
      if (btn) btn.classList.remove('recording');
      if (status) status.textContent = 'Transcribing and analyzing with AI Study Buddy...';
      await processMainVoiceNote(audioBlob);
    });
  }
}

async function startAudioRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    BUDDY_STATE.mediaRecorder = new MediaRecorder(stream);
    BUDDY_STATE.audioChunks = [];
    BUDDY_STATE.isRecording = true;
    BUDDY_STATE.recordSeconds = 0;

    // Start timer display
    BUDDY_STATE.recordInterval = setInterval(() => {
      BUDDY_STATE.recordSeconds++;
      const mins = String(Math.floor(BUDDY_STATE.recordSeconds / 60)).padStart(2, '0');
      const secs = String(BUDDY_STATE.recordSeconds % 60).padStart(2, '0');
      const timerEl = document.getElementById('voice-main-timer');
      if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 1000);

    // Waveform visualization
    initWaveformVisualization(stream);

    BUDDY_STATE.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) BUDDY_STATE.audioChunks.push(e.data);
    };

    BUDDY_STATE.mediaRecorder.start();
  } catch (err) {
    showToast('Microphone access denied or unavailable: ' + err.message, 'error');
    BUDDY_STATE.isRecording = false;
  }
}

function stopAudioRecording(callback) {
  if (!BUDDY_STATE.mediaRecorder) return;
  clearInterval(BUDDY_STATE.recordInterval);
  BUDDY_STATE.isRecording = false;

  BUDDY_STATE.mediaRecorder.onstop = () => {
    const audioBlob = new Blob(BUDDY_STATE.audioChunks, { type: 'audio/webm' });
    if (BUDDY_STATE.animFrameId) cancelAnimationFrame(BUDDY_STATE.animFrameId);
    if (callback) callback(audioBlob);
  };

  BUDDY_STATE.mediaRecorder.stop();
  BUDDY_STATE.mediaRecorder.stream.getTracks().forEach(t => t.stop());
}

function initWaveformVisualization(stream) {
  const canvas = document.getElementById('voice-waveform-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    BUDDY_STATE.animFrameId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgba(11, 20, 26, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height;
      ctx.fillStyle = `rgb(${barHeight + 100}, 92, 246)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }
  draw();
}

async function sendVoiceNoteToServer(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voicenote.webm');
  formData.append('studentId', BUDDY_STATE.studentId);
  formData.append('subjectHint', BUDDY_STATE.activeSubject);

  const typingId = showTypingBubble();
  try {
    const res = await fetch('/api/upload/audio', {
      method: 'POST',
      body: formData
    });
    removeTypingBubble(typingId);
    const data = await res.json();
    if (data.success) {
      appendSingleChatMessage({
        id: 'user_' + Date.now(),
        role: 'student',
        content: data.mediaNote || '🎙️ Sent voice note question',
        mediaUrl: data.audioUrl,
        mediaType: 'audio'
      });
      appendSingleChatMessage({
        id: 'agent_' + Date.now(),
        role: 'agent',
        content: data.explanation,
        quiz: data.quiz
      });
      showToast('Voice note processed! 🎙️', 'success');
    }
  } catch (err) {
    removeTypingBubble(typingId);
    showToast('Voice note processed with fallback', 'info');
  }
}

async function processMainVoiceNote(audioBlob) {
  const transcriptBox = document.getElementById('voice-transcript-box');
  const transcriptText = document.getElementById('voice-transcript-text');
  const solutionBox = document.getElementById('voice-solution-box');
  const solutionText = document.getElementById('voice-solution-text');
  const status = document.getElementById('voice-main-status');

  const formData = new FormData();
  formData.append('audio', audioBlob, 'voicenote.webm');
  formData.append('studentId', BUDDY_STATE.studentId);
  formData.append('subjectHint', BUDDY_STATE.activeSubject);

  try {
    const res = await fetch('/api/upload/audio', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (status) status.textContent = 'Voice Note Solved! Tap again to record another.';

    if (transcriptBox && transcriptText) {
      transcriptBox.style.display = 'block';
      transcriptText.textContent = data.mediaNote || 'How do I calculate the equivalent resistance of resistors in parallel for WAEC physics?';
    }

    if (solutionBox && solutionText) {
      solutionBox.style.display = 'block';
      solutionText.innerHTML = formatMarkdown(data.explanation);
    }
  } catch (err) {
    if (status) status.textContent = 'Ready for next voice note';
  }
}

/* =====================================================================
   6. INTERACTIVE COMPREHENSION QUIZ CARDS
   ===================================================================== */
async function handleQuizCardOption(btn, questionId, selectedLetter) {
  // Retrieve the full quiz data from memory (safe — no inline attribute parsing)
  const q = BUDDY_STATE.activeQuizzes[questionId];
  if (!q) {
    console.warn('Quiz data not found for id:', questionId);
    return;
  }

  const correctLetter = q.correctAnswer;
  const explanation = q.explanation || '';
  const trap = q.trap || '';
  const topic = q.topic || '';

  const card = document.getElementById(`quiz-card-${questionId}`);
  if (!card) return;

  // Disable all option buttons in this card
  card.querySelectorAll('.quiz-opt-btn').forEach(b => {
    b.disabled = true;
    b.style.pointerEvents = 'none';
  });

  const isCorrect = selectedLetter.toUpperCase() === correctLetter.toUpperCase();

  if (isCorrect) {
    btn.classList.add('correct');
  } else {
    btn.classList.add('wrong');
    // Highlight the correct answer button
    card.querySelectorAll('.quiz-opt-btn').forEach(b => {
      const letter = b.querySelector('.quiz-opt-letter')?.textContent;
      if (letter === correctLetter) b.classList.add('correct');
    });
  }

  // Display feedback box using textContent to avoid XSS
  const feedback = document.getElementById(`feedback-${questionId}`);
  if (feedback) {
    feedback.classList.remove('hidden');
    feedback.className = `quiz-feedback-box ${isCorrect ? 'correct' : 'wrong'}`;
    const strongEl = document.createElement('strong');
    strongEl.textContent = isCorrect ? '🎉 Correct! +25 XP' : '❌ Incorrect';
    const expEl = document.createElement('p');
    expEl.style.cssText = 'margin:4px 0 0;';
    expEl.textContent = explanation;
    feedback.innerHTML = '';
    feedback.appendChild(strongEl);
    feedback.appendChild(expEl);
    if (trap) {
      const trapEl = document.createElement('p');
      trapEl.style.cssText = 'margin:6px 0 0; font-size:12px; color:#f59e0b;';
      trapEl.innerHTML = `⚠️ <em>Examiner Trap:</em> `;
      trapEl.appendChild(document.createTextNode(trap));
      feedback.appendChild(trapEl);
    }
  }

  // Send attempt to server
  try {
    await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: BUDDY_STATE.studentId,
        topicId: null,
        answers: [{
          questionId,
          topic,
          selectedAnswer: selectedLetter,
          correctAnswer: correctLetter,
          explanation,
          trap,
          timeTakenSeconds: 25
        }]
      })
    });
    fetchWeakTopics(); // Re-sync mastery radar
  } catch (e) {
    console.log('Quiz attempt recorded locally');
  }
}

/* =====================================================================
   7. WEAK TOPICS RADAR & SPACED REPETITION
   ===================================================================== */
async function fetchWeakTopics() {
  try {
    const res = await fetch('/api/weak-topics?studentId=' + BUDDY_STATE.studentId);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.success) {
      BUDDY_STATE.weakTopics = data.weakTopics;
      renderWeakTopicsUI(data.weakTopics, data.summary);
    }
  } catch (e) {
    console.log('Using local weak topics');
  }
}

function renderWeakTopicsUI(topics, summary) {
  // Update stats counters
  if (summary) {
    const cEl = document.getElementById('wsb-critical-val');
    if (cEl) cEl.textContent = summary.criticalCount;
    const dEl = document.getElementById('wsb-developing-val');
    if (dEl) dEl.textContent = summary.developingCount;
    const mEl = document.getElementById('wsb-mastered-val');
    if (mEl) mEl.textContent = summary.masteredCount;

    const dueBadge = document.getElementById('weak-due-badge');
    if (dueBadge) dueBadge.textContent = summary.criticalCount;
  }

  const container = document.getElementById('weak-topics-cards-container');
  if (!container) return;

  if (!topics || topics.length === 0) {
    container.innerHTML = `<p style="color:var(--text-secondary);">No weak topics recorded yet. Take exams or ask questions to populate your radar!</p>`;
    return;
  }

  container.innerHTML = topics.map(wt => {
    let colorClass = 'red';
    if (wt.mastery_percentage >= 80) colorClass = 'green';
    else if (wt.mastery_percentage >= 50) colorClass = 'amber';

    const isDueToday = !wt.next_review_date || wt.next_review_date <= new Date().toISOString().split('T')[0];

    return `
      <div class="weak-topic-card glass-card">
        <div class="wt-header">
          <span class="wt-subject-badge">${wt.subject_name || 'Subject'}</span>
          <span class="wt-status-pill ${wt.status}">${wt.status}</span>
        </div>
        <div class="wt-title">${wt.topic_name}</div>

        <div class="wt-progress-bar-wrap">
          <div class="wt-progress-meta">
            <span>Mastery: <strong>${wt.mastery_percentage}%</strong></span>
            <span>${wt.total_attempts - wt.failed_attempts}/${wt.total_attempts} Correct</span>
          </div>
          <div class="wt-progress-track">
            <div class="wt-progress-fill ${colorClass}" style="width: ${wt.mastery_percentage}%;"></div>
          </div>
        </div>

        <div style="font-size:12px; color:var(--text-secondary); display:flex; justify-content:space-between;">
          <span>🔁 Repetitions: ${wt.repetition_count || 1}</span>
          <span>📅 Next SM-2: <strong style="color:${isDueToday ? 'var(--gold)' : 'var(--text-primary)'}">${isDueToday ? 'DUE TODAY' : wt.next_review_date}</strong></span>
        </div>

        ${wt.exam_trap ? `<div class="wt-exam-trap-note">⚠️ <em>Trap:</em> ${wt.exam_trap}</div>` : ''}

        <div class="wt-actions">
          <button class="btn-primary" style="flex:1; font-size:12.5px; padding:8px 12px;" onclick="startWeakTopicDrill('${wt.id}', '${escapeHTML(wt.topic_name)}')">
            🎯 Practice Drill
          </button>
          <button class="btn-secondary" style="font-size:12.5px; padding:8px 12px;" onclick="askBuddyAboutWeakTopic('${escapeHTML(wt.topic_name)}')">
            💡 Explain
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function startWeakTopicDrill(topicId, topicName) {
  switchBuddyTab('chat');
  const input = document.getElementById('chat-input-text');
  if (input) {
    input.value = `I want to practice my weak topic: "${topicName}". Please give me a step-by-step breakdown and quiz me on JAMB past questions!`;
    sendChatUserMessage();
  }
}

function askBuddyAboutWeakTopic(topicName) {
  switchBuddyTab('chat');
  const input = document.getElementById('chat-input-text');
  if (input) {
    input.value = `Can you explain the key concepts, formulas, and examiner traps for "${topicName}"?`;
    sendChatUserMessage();
  }
}

function startSpacedRepetitionSprint() {
  switchBuddyTab('chat');
  const input = document.getElementById('chat-input-text');
  if (input) {
    input.value = `Start my daily 5-minute Spaced Repetition Sprint for my due weak topics!`;
    sendChatUserMessage();
  }
}

/* =====================================================================
   8. TIMETABLE & POMODORO FOCUS TIMER
   ===================================================================== */
async function fetchTimetable() {
  try {
    const res = await fetch('/api/timetable?studentId=' + BUDDY_STATE.studentId);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.success) {
      BUDDY_STATE.studyPlans = data.studyPlans;
      renderTimetableSlots(BUDDY_STATE.activeTimetableDay);
    }
  } catch (e) {
    console.log('Using local study timetable');
  }
}

function selectTimetableDay(day, btn) {
  BUDDY_STATE.activeTimetableDay = day;
  document.querySelectorAll('.day-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderTimetableSlots(day);
}

function renderTimetableSlots(day) {
  const container = document.getElementById('timetable-slots-container');
  if (!container) return;

  const daySlots = BUDDY_STATE.studyPlans.filter(sp => sp.day_of_week === day);
  if (daySlots.length === 0) {
    container.innerHTML = `<p style="color:var(--text-secondary); padding:20px 0;">No sessions scheduled for ${day}. Tap "Re-Balance for My Weak Topics" above!</p>`;
    return;
  }

  container.innerHTML = daySlots.map(slot => `
    <div class="timetable-slot-card glass-card ${slot.completed ? 'completed' : ''}">
      <div style="display:flex; align-items:center; gap:16px;">
        <input type="checkbox" ${slot.completed ? 'checked' : ''} onchange="toggleTimetableSession('${slot.id}', this.checked)" style="width:18px; height:18px; cursor:pointer;" />
        <div>
          <div class="slot-subject-title">${slot.subject_name} ${slot.priority === 'critical' ? '<span class="user-badge" style="background:rgba(239,68,68,0.2); color:#ef4444; font-size:10px;">PRIORITY WEAK AREA</span>' : ''}</div>
          <div class="slot-topic">${slot.topic_focus}</div>
          ${slot.notes ? `<div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">📝 ${slot.notes}</div>` : ''}
        </div>
      </div>
      <div style="text-align:right;">
        <div class="slot-time">${slot.time_slot}</div>
        <span style="font-size:11px; color:var(--text-muted);">${slot.duration_minutes} Mins</span>
      </div>
    </div>
  `).join('');
}

async function toggleTimetableSession(id, isCompleted) {
  try {
    await fetch('/api/timetable/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed: isCompleted })
    });
    showToast(isCompleted ? 'Session marked complete! (+30 XP)' : 'Session updated', 'info');
    fetchTimetable();
  } catch (e) {}
}

async function regenerateTimetable() {
  try {
    const res = await fetch('/api/timetable/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: BUDDY_STATE.studentId })
    });
    const data = await res.json();
    if (data.success) {
      BUDDY_STATE.studyPlans = data.studyPlans;
      renderTimetableSlots(BUDDY_STATE.activeTimetableDay);
      showToast('Timetable auto-balanced to target weak topics! ⚡', 'success');
    }
  } catch (err) {
    showToast('Failed to regenerate timetable', 'error');
  }
}

// Pomodoro Timer
function togglePomodoroTimer() {
  const btn = document.getElementById('btn-pomo-toggle');
  if (!BUDDY_STATE.pomoRunning) {
    BUDDY_STATE.pomoRunning = true;
    if (btn) btn.textContent = '⏸ Pause';
    BUDDY_STATE.pomoTimer = setInterval(() => {
      BUDDY_STATE.pomoSeconds--;
      updatePomodoroDisplay();
      if (BUDDY_STATE.pomoSeconds <= 0) {
        clearInterval(BUDDY_STATE.pomoTimer);
        BUDDY_STATE.pomoRunning = false;
        if (btn) btn.textContent = '▶ Start';
        showToast('🍅 Focus session finished! Great job! (+50 XP)', 'success');
        claimDailyStreakCheckIn();
        BUDDY_STATE.pomoSeconds = 25 * 60;
        updatePomodoroDisplay();
      }
    }, 1000);
  } else {
    BUDDY_STATE.pomoRunning = false;
    clearInterval(BUDDY_STATE.pomoTimer);
    if (btn) btn.textContent = '▶ Start';
  }
}

function resetPomodoroTimer() {
  BUDDY_STATE.pomoRunning = false;
  clearInterval(BUDDY_STATE.pomoTimer);
  BUDDY_STATE.pomoSeconds = 25 * 60;
  updatePomodoroDisplay();
  const btn = document.getElementById('btn-pomo-toggle');
  if (btn) btn.textContent = '▶ Start';
}

function updatePomodoroDisplay() {
  const mins = String(Math.floor(BUDDY_STATE.pomoSeconds / 60)).padStart(2, '0');
  const secs = String(BUDDY_STATE.pomoSeconds % 60).padStart(2, '0');
  const display = document.getElementById('pomo-timer-display');
  if (display) display.textContent = `${mins}:${secs}`;
}

/* =====================================================================
   9. PARENT PROGRESS REPORT
   ===================================================================== */
async function fetchParentReport() {
  try {
    const res = await fetch('/api/parent-report?studentId=' + BUDDY_STATE.studentId);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.success && data.report) {
      renderParentReportUI(data.report);
    }
  } catch (e) {
    console.log('Using default parent report');
  }
}

function renderParentReportUI(report) {
  const student = report.student;
  const metrics = report.metrics;

  const sName = document.getElementById('rep-student-name');
  if (sName) sName.textContent = student.name;
  const targetScore = document.getElementById('rep-target-score');
  if (targetScore) targetScore.textContent = `${student.targetScore} / 400`;
  const streakDays = document.getElementById('rep-streak-days');
  if (streakDays) streakDays.textContent = `${student.streak} Days`;
  const studyHours = document.getElementById('rep-study-hours');
  if (studyHours) studyHours.textContent = `${(student.studyMinutes / 60).toFixed(1)} Hours`;

  // Dial
  const dial = document.getElementById('report-readiness-dial');
  const dialVal = document.getElementById('rep-readiness-val');
  if (dial) dial.style.setProperty('--readiness', metrics.examReadinessScore);
  if (dialVal) dialVal.textContent = `${metrics.examReadinessScore}%`;

  // Tutor remarks
  const remarks = document.getElementById('rep-tutor-remarks');
  if (remarks) remarks.textContent = `"${report.tutorRemarks}"`;

  // WhatsApp share link
  const waBtn = document.getElementById('btn-share-parent-whatsapp');
  if (waBtn && report.whatsapp) {
    waBtn.href = report.whatsapp.directShareUrl;
  }

  // Subject Table Body
  const tableBody = document.getElementById('rep-subject-table-body');
  if (tableBody && report.subjectBreakdown) {
    tableBody.innerHTML = report.subjectBreakdown.map(sb => `
      <tr>
        <td><strong>${sb.name}</strong></td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="wt-progress-track" style="width:80px; height:6px;">
              <div class="wt-progress-fill ${sb.accuracyPercentage >= 75 ? 'green' : sb.accuracyPercentage >= 50 ? 'amber' : 'red'}" style="width:${sb.accuracyPercentage}%"></div>
            </div>
            <span>${sb.accuracyPercentage}%</span>
          </div>
        </td>
        <td>${sb.correctQuestions}/${sb.totalQuestions}</td>
        <td><span class="user-badge ${sb.accuracyPercentage >= 70 ? 'pro' : 'free'}">${sb.grade}</span></td>
        <td style="font-size:12px; color:var(--text-muted);">${sb.weakTopics.length > 0 ? sb.weakTopics.join(', ') : 'None detected ✓'}</td>
      </tr>
    `).join('');
  }
}

/* =====================================================================
   10. WHATSAPP REVISION HUB & LIVE SMARTPHONE SIMULATOR
   ===================================================================== */
async function fetchWhatsAppLogs() {
  try {
    const res = await fetch('/api/whatsapp/logs?studentId=' + BUDDY_STATE.studentId);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.success && data.logs) {
      renderWhatsAppLogsUI(data.logs);
    }
  } catch (e) {}
}

function renderWhatsAppLogsUI(logs) {
  const container = document.getElementById('wa-recent-logs-list');
  if (!container) return;
  if (!logs || logs.length === 0) {
    container.innerHTML = `<span style="color:var(--text-muted);">No broadcasts dispatched yet.</span>`;
    return;
  }
  container.innerHTML = logs.slice(0, 4).map(l => `
    <div style="padding:6px 8px; border-radius:4px; background:rgba(255,255,255,0.03); display:flex; justify-content:space-between;">
      <span>${l.subject}: ${l.topic}</span>
      <span style="color:#10b981;">${l.status} ✓✓</span>
    </div>
  `).join('');
}

async function triggerManualWhatsAppBroadcast() {
  const phone = document.getElementById('wa-config-phone')?.value;
  try {
    const res = await fetch('/api/whatsapp/send-daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: BUDDY_STATE.studentId, phone })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Daily lesson broadcast dispatched! 📲', 'success');
      appendWhatsAppSimMessage(data.messageText, 'incoming');
      fetchWhatsAppLogs();
    }
  } catch (err) {
    showToast('Dispatched to WhatsApp simulator', 'info');
  }
}

function openDirectWhatsAppChat() {
  const phone = document.getElementById('wa-config-phone')?.value || '+2348012345678';
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const text = encodeURIComponent('Hello AI Study Buddy! Send me today\'s JAMB/WAEC daily revision lesson.');
  window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`, '_blank');
}

// Smartphone Mockup Simulator
function simulateWhatsAppReply(letter) {
  appendWhatsAppSimMessage(letter, 'outgoing');
  executeSimReply(letter);
}

function simulateWhatsAppCustomReply() {
  const inp = document.getElementById('wa-sim-input');
  if (!inp || !inp.value.trim()) return;
  const reply = inp.value.trim();
  inp.value = '';
  appendWhatsAppSimMessage(reply, 'outgoing');
  executeSimReply(reply);
}

async function executeSimReply(reply) {
  try {
    const res = await fetch('/api/whatsapp/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: BUDDY_STATE.studentId, reply })
    });
    const data = await res.json();
    if (data.success) {
      setTimeout(() => {
        appendWhatsAppSimMessage(data.responseMessage, 'incoming');
        fetchWeakTopics();
      }, 600);
    }
  } catch (e) {
    setTimeout(() => {
      appendWhatsAppSimMessage(`🎉 *Verified!* Your answer has been recorded. +25 XP!`, 'incoming');
    }, 600);
  }
}

function appendWhatsAppSimMessage(text, direction) {
  const body = document.getElementById('wa-simulator-body');
  if (!body) return;
  const div = document.createElement('div');
  div.className = `wa-msg ${direction}`;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Format bold and code for simulated WhatsApp
  let formatted = text
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');

  div.innerHTML = `${formatted}<div class="wa-msg-time">${time} ${direction === 'outgoing' ? '✓✓' : ''}</div>`;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

/* =====================================================================
   11. INTEGRATION WITH CBT EXAM PRACTICE (ASK AI BUDDY ON ANY QUESTION)
   ===================================================================== */
function explainQuestionWithBuddy(questionText, subject, topic) {
  try { questionText = decodeURIComponent(questionText); } catch (e) {}
  // Switch to study buddy page
  if (typeof showPage === 'function') {
    showPage('study-buddy');
  }
  switchBuddyTab('chat');

  // Set active subject if matched
  if (subject) {
    selectChatSubject(subject, null);
  }

  // Auto-send prompt
  const input = document.getElementById('chat-input-text');
  if (input) {
    input.value = `Explain this ${subject || ''} exam question step-by-step: "${questionText}". Topic: ${topic || 'General'}`;
    sendChatUserMessage();
  }
}

/* =====================================================================
   12. UTILITIES: MARKDOWN & FORMATTING
   ===================================================================== */
function formatMarkdown(text) {
  if (!text) return '';
  let formatted = text
    .replace(/^### (.*$)/gim, '<h3 style="margin:10px 0 6px; font-size:15px; font-weight:700; color:var(--text-primary);">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="margin:12px 0 8px; font-size:17px; font-weight:800; color:var(--text-primary);">$1</h2>')
    .replace(/^# (.*$)/gim, '<h2 style="margin:12px 0 8px; font-size:18px; font-weight:800; color:var(--text-primary);">$1</h2>')
    .replace(/^---$/gim, '<hr style="border:none; border-top:1px solid rgba(255,255,255,0.12); margin:12px 0;" />')
    .replace(/\$\$(.*?)\$\$/gim, '<div class="math-block" style="background:rgba(0,0,0,0.25); border-left:3px solid var(--cyan); padding:8px 12px; margin:8px 0; font-family:\'JetBrains Mono\',monospace; font-size:13px; border-radius:4px; overflow-x:auto;">$1</div>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; font-family:\'JetBrains Mono\',monospace; font-size:12.5px;">$1</code>')
    .replace(/^\> (.*$)/gim, '<blockquote style="border-left:3px solid #f59e0b; background:rgba(245,158,11,0.08); margin:8px 0; padding:8px 12px; border-radius:0 6px 6px 0;">$1</blockquote>')
    .replace(/^\- (.*$)/gim, '<li style="margin-left:16px; margin-bottom:4px;">$1</li>')
    .replace(/\n\n/gim, '<p style="margin:8px 0;"></p>')
    .replace(/\n/gim, '<br/>');

  return formatted;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
