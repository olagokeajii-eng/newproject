/**
 * Main Express Backend Server
 * AI Study Buddy AGENT for JAMB / WAEC Students
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const db = require('./backend/db');
const { searchRAG } = require('./backend/rag');
const { processStudentQuery } = require('./backend/aiAgent');
const { reviewTopic, getDueTopics } = require('./backend/spacedRep');
const { generateQuiz, evaluateQuizSubmission } = require('./backend/quizGen');
const { generatePersonalizedTimetable, logStudySession } = require('./backend/timetable');
const { generateParentReport } = require('./backend/parentReport');
const { sendDailyRevision, handleWhatsAppReply } = require('./backend/whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for photos & voice notes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || (file.mimetype.includes('audio') ? '.webm' : '.jpg');
    cb(null, `${file.fieldname}_${Date.now()}_${Math.round(Math.random() * 1e5)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve frontend static assets
app.use(express.static(__dirname));

/* =====================================================================
   REST API ENDPOINTS
   ===================================================================== */

// 1. Health check & diagnostic status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    agent: 'JAMB / WAEC AI Study Buddy AGENT',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
    features: [
      'GPT-4o Vision & OCR for question photos',
      'Voice note speech-to-text solver',
      'RAG knowledge base on official JAMB/WAEC syllabus',
      'SuperMemo SM-2 spaced repetition scheduler',
      'Instant comprehension quiz generator',
      'Personalized study timetable generator',
      'Parent progress report card generator',
      'WhatsApp daily revision dispatcher & simulator'
    ]
  });
});

// 2. Chat with AI Study Buddy (Text, Follow-ups)
app.post('/api/chat', async (req, res) => {
  try {
    const { studentId = 'std_001', message, subjectHint } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Save student message in DB
    db.addChatMessage({
      student_id: studentId,
      role: 'student',
      content: message,
      subject: subjectHint
    });

    const result = await processStudentQuery({
      studentId,
      message,
      subjectHint
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process question: ' + err.message });
  }
});

// 3. Photo Upload for Question (Vision OCR)
app.post('/api/upload/image', upload.single('photo'), async (req, res) => {
  try {
    const studentId = req.body.studentId || 'std_001';
    const note = req.body.note || '';
    const subjectHint = req.body.subjectHint || null;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Record student upload message
    db.addChatMessage({
      student_id: studentId,
      role: 'student',
      content: note || '📷 Uploaded question photo for step-by-step solution',
      mediaUrl: imageUrl,
      mediaType: 'image'
    });

    const result = await processStudentQuery({
      studentId,
      message: note,
      imageUrl: path.join(UPLOADS_DIR, req.file.filename),
      subjectHint
    });

    res.json({
      success: true,
      imageUrl,
      ...result
    });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Failed to process question photo: ' + err.message });
  }
});

// 4. Voice Note Upload (Audio Speech to Solution)
app.post('/api/upload/audio', upload.single('audio'), async (req, res) => {
  try {
    const studentId = req.body.studentId || 'std_001';
    const note = req.body.transcript || req.body.note || '';
    const subjectHint = req.body.subjectHint || null;

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const audioUrl = `/uploads/${req.file.filename}`;

    // Record student voice message
    db.addChatMessage({
      student_id: studentId,
      role: 'student',
      content: note || '🎙️ Recorded voice note question',
      mediaUrl: audioUrl,
      mediaType: 'audio'
    });

    const result = await processStudentQuery({
      studentId,
      message: note,
      audioUrl: path.join(UPLOADS_DIR, req.file.filename),
      subjectHint
    });

    res.json({
      success: true,
      audioUrl,
      ...result
    });
  } catch (err) {
    console.error('Audio upload error:', err);
    res.status(500).json({ error: 'Failed to process voice note: ' + err.message });
  }
});

// 5. Chat History
app.get('/api/chat/history', (req, res) => {
  const studentId = req.query.studentId || 'std_001';
  const history = db.getChatMessages(studentId);
  res.json({ success: true, history });
});

app.post('/api/chat/clear', (req, res) => {
  const studentId = req.body.studentId || 'std_001';
  db.clearChat(studentId);
  res.json({ success: true, message: 'Chat cleared' });
});

// 6. RAG Syllabus Search
app.get('/api/rag/search', (req, res) => {
  const { query, subject } = req.query;
  const results = searchRAG(query || '', subject || null, 5);
  res.json({ success: true, query, results });
});

// 7. Weak Topics Dashboard & Radar
app.get('/api/weak-topics', (req, res) => {
  const studentId = req.query.studentId || 'std_001';
  const weakTopics = db.getWeakTopics(studentId);

  // Group by status
  const critical = weakTopics.filter(t => t.status === 'critical');
  const developing = weakTopics.filter(t => t.status === 'developing');
  const mastered = weakTopics.filter(t => t.status === 'mastered');

  res.json({
    success: true,
    weakTopics,
    summary: {
      total: weakTopics.length,
      criticalCount: critical.length,
      developingCount: developing.length,
      masteredCount: mastered.length
    }
  });
});

// 8. Spaced Repetition Due Topics
app.get('/api/spaced-repetition/due', (req, res) => {
  const studentId = req.query.studentId || 'std_001';
  const due = getDueTopics(studentId);
  res.json({ success: true, count: due.length, dueTopics: due });
});

// 9. Review a Topic via Spaced Repetition
app.post('/api/spaced-repetition/review', (req, res) => {
  const { topicId, isCorrect, timeTakenSeconds } = req.body;
  if (!topicId) return res.status(400).json({ error: 'topicId is required' });

  const result = reviewTopic(topicId, Boolean(isCorrect), timeTakenSeconds || 30);
  if (!result) return res.status(404).json({ error: 'Topic not found' });

  res.json({ success: true, ...result });
});

// 10. Generate Instant Quiz
app.post('/api/quiz/generate', (req, res) => {
  const { topicName = 'Calculus', count = 2 } = req.body;
  const questions = generateQuiz(topicName, parseInt(count, 10) || 2);
  res.json({ success: true, topicName, questions });
});

// 11. Submit Quiz & Evaluate
app.post('/api/quiz/submit', (req, res) => {
  const { studentId = 'std_001', topicId = null, answers = [] } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Answers array cannot be empty' });
  }

  const result = evaluateQuizSubmission(studentId, topicId, answers);
  res.json({ success: true, ...result });
});

// 12. Personalized Timetable
app.get('/api/timetable', (req, res) => {
  const studentId = req.query.studentId || 'std_001';
  let plans = db.getStudyPlans(studentId);
  if (plans.length === 0) {
    plans = generatePersonalizedTimetable(studentId);
  }
  res.json({ success: true, studyPlans: plans });
});

app.post('/api/timetable/generate', (req, res) => {
  const studentId = req.body.studentId || 'std_001';
  const plans = generatePersonalizedTimetable(studentId);
  res.json({ success: true, studyPlans: plans });
});

app.post('/api/timetable/toggle', (req, res) => {
  const { id, completed } = req.body;
  if (!id) return res.status(400).json({ error: 'Session ID is required' });

  const updated = db.updateStudyPlan(id, { completed: Boolean(completed) });
  res.json({ success: true, updated });
});

// 13. Streak & Study Session Logging (Pomodoro)
app.get('/api/streak', (req, res) => {
  const studentId = req.query.studentId || 'std_001';
  const student = db.getStudent(studentId);
  res.json({
    success: true,
    currentStreak: student.current_streak || 1,
    highestStreak: student.highest_streak || 1,
    totalStudyMinutes: student.total_study_minutes || 0,
    xp: student.xp || 0
  });
});

app.post('/api/streak/checkin', (req, res) => {
  const { studentId = 'std_001', durationMinutes = 25, subject = 'General' } = req.body;
  const result = logStudySession(studentId, durationMinutes, subject);
  res.json({ success: true, ...result });
});

// 14. Parent Progress Report
app.get('/api/parent-report', (req, res) => {
  const studentId = req.query.studentId || 'std_001';
  const report = generateParentReport(studentId);
  res.json({ success: true, report });
});

// 15. WhatsApp Daily Revision Dispatcher
app.post('/api/whatsapp/send-daily', async (req, res) => {
  try {
    const { studentId = 'std_001', phone = null } = req.body;
    const result = await sendDailyRevision(studentId, phone);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('WhatsApp send error:', err);
    res.status(500).json({ error: 'Failed to dispatch WhatsApp lesson: ' + err.message });
  }
});

// 16. WhatsApp Interactive Simulator Reply
app.post('/api/whatsapp/reply', (req, res) => {
  const { studentId = 'std_001', reply = 'A', questionId = null } = req.body;
  const result = handleWhatsAppReply(studentId, reply, questionId);
  res.json({ success: true, ...result });
});

// 17. WhatsApp Logs
app.get('/api/whatsapp/logs', (req, res) => {
  const studentId = req.query.studentId || 'std_001';
  const logs = db.getWhatsAppLogs(studentId);
  res.json({ success: true, logs });
});

// 18. Student Profile & Settings
app.get('/api/students/profile', (req, res) => {
  const studentId = req.query.studentId || 'std_001';
  const student = db.getStudent(studentId);
  res.json({ success: true, student });
});

app.post('/api/students/profile', (req, res) => {
  const studentId = req.body.studentId || 'std_001';
  const updates = req.body;
  delete updates.id;
  const updated = db.updateStudent(studentId, updates);
  res.json({ success: true, student: updated });
});

// Fallback to index.html for single-page routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 JAMB / WAEC AI Study Buddy AGENT Server Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📚 Combined with Online CBT Exam Practice Platform`);
  console.log(`⚡ API Health: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
