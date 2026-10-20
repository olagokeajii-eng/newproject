/* =============================================================
   TEST YOUR KNOWLEDGE — Full Application Logic
   Modules: Auth, Dashboard, Exam Engine, Scoring, Analysis,
            Leaderboard, Subscription, Timer, Question Bank
   ============================================================= */

'use strict';

/* =====================================================================
   1. DATABASE — In-memory store (simulates backend DB)
   ===================================================================== */
const DB = {
  users: [
    {
      id: 'u001', name: 'Admin Demo', email: 'student@test.com',
      password: 'password', subscription: 'pro', streak: 7, avatar: 'A',
      joinDate: '2024-01-10', examFocus: 'JAMB'
    }
  ],
  questions: generateQuestionBank(),
  results:   [],
  leaderboard: generateMockLeaderboard(),
  subscriptions: []
};

/* =====================================================================
   2. QUESTION BANK GENERATOR
   ===================================================================== */
function generateQuestionBank() {
  const bank = [];

  const subjects = {
    JAMB: [
      { subject: 'Mathematics', topics: ['Algebra','Calculus','Statistics','Trigonometry','Number Theory','Sets','Probability','Geometry'] },
      { subject: 'English Language', topics: ['Comprehension','Grammar','Vocabulary','Literature','Essay Writing','Idioms','Lexis & Structure'] },
      { subject: 'Physics', topics: ['Mechanics','Waves','Electricity','Optics','Thermodynamics','Modern Physics','Electrostatics'] },
      { subject: 'Chemistry', topics: ['Organic Chemistry','Inorganic Chemistry','Physical Chemistry','Atomic Structure','Bonding','Equilibrium'] },
      { subject: 'Biology', topics: ['Cell Biology','Genetics','Ecology','Evolution','Physiology','Nutrition','Reproduction'] },
      { subject: 'Economics', topics: ['Microeconomics','Macroeconomics','Supply & Demand','Inflation','Trade','Fiscal Policy','GDP'] },
      { subject: 'Government', topics: ['Democracy','Nigerian Constitution','Political Parties','Electoral Process','Federalism','Arms of Government'] },
      { subject: 'Literature', topics: ['Poetry Analysis','Drama','Prose','African Literature','Literary Devices','Tragedy & Comedy'] }
    ],
    WAEC: [
      { subject: 'Mathematics', topics: ['Algebra','Trigonometry','Statistics','Calculus','Geometry','Matrices','Logarithms'] },
      { subject: 'English Language', topics: ['Comprehension','Summary Writing','Grammar','Oral English','Essay','Letter Writing'] },
      { subject: 'Biology', topics: ['Cell Structure','Genetics','Ecology','Reproduction','Nutrition','Evolution','Excretion'] },
      { subject: 'Chemistry', topics: ['Atomic Structure','Organic Chemistry','Electrochemistry','Rates of Reaction','Acids & Bases','Polymers'] },
      { subject: 'Physics', topics: ['Mechanics','Electricity','Magnetism','Waves','Nuclear Physics','Fluid Mechanics','Heat'] },
      { subject: 'Economics', topics: ['Demand & Supply','Market Structures','National Income','Money & Banking','Trade','Population'] }
    ],
    NECO: [
      { subject: 'Mathematics', topics: ['Algebra','Geometry','Statistics','Calculus','Number Base','Sequences','Probability'] },
      { subject: 'English Language', topics: ['Comprehension','Grammar','Vocabulary','Summary','Essay','Oral English'] },
      { subject: 'Civic Education', topics: ['Democracy','Human Rights','Rule of Law','Constitutionalism','Citizenship','Corruption'] },
      { subject: 'Commerce', topics: ['Trade','Banking','Insurance','Transportation','Communication','Warehouse','Retail Trade'] }
    ],
    Aptitude: [
      { subject: 'Verbal Reasoning', topics: ['Analogies','Antonyms','Synonyms','Reading Comprehension','Critical Reasoning','Sentence Completion'] },
      { subject: 'Numerical Reasoning', topics: ['Number Series','Data Interpretation','Percentages','Ratios','Speed/Distance','Profit & Loss'] },
      { subject: 'Abstract Reasoning', topics: ['Pattern Recognition','Matrices','Shape Sequences','Visual Puzzles','Logical Series'] },
      { subject: 'Logical Reasoning', topics: ['Syllogisms','Deductive Reasoning','Inductive Reasoning','Critical Thinking','Puzzles'] },
      { subject: 'Spatial Reasoning', topics: ['3D Rotation','Folding Patterns','Mirror Images','2D to 3D','Block Counting'] }
    ]
  };

  const questionTemplates = {
    Mathematics: [
      { q: 'If 2x + 5 = 17, find the value of x.', opts: ['4','6','7','5'], ans: 1, explanation: 'Subtract 5 from both sides: 2x = 12, then divide by 2: x = 6. Therefore x = 6.' },
      { q: 'Simplify: log₂(8) + log₂(4)', opts: ['5','4','7','6'], ans: 0, explanation: 'log₂(8) = 3 and log₂(4) = 2. Adding: 3 + 2 = 5. The answer is 5.' },
      { q: 'Find the sum of the first 10 terms of the AP: 2, 5, 8, ...', opts: ['140','145','155','150'], ans: 2, explanation: 'a = 2, d = 3, n = 10. S = n/2[2a + (n-1)d] = 10/2[4 + 27] = 5 × 31 = 155.' },
      { q: 'Evaluate: ∫(3x² + 2x) dx from 0 to 2', opts: ['10','12','14','16'], ans: 1, explanation: '∫₀² (3x² + 2x)dx = [x³ + x²]₀² = (8 + 4) - 0 = 12.' },
      { q: 'If the mean of 5, 8, x, 12, 15 is 10, find x.', opts: ['10','12','8','9'], ans: 0, explanation: 'Mean = (5+8+x+12+15)/5 = 10. Sum = 50. 40 + x = 50, x = 10.' },
      { q: 'Find the gradient of the line 3y - 6x = 12.', opts: ['2','-2','3','-6'], ans: 0, explanation: 'Rearrange: 3y = 6x + 12, so y = 2x + 4. Gradient = 2.' },
      { q: 'How many ways can 6 people sit in a row?', opts: ['36','120','720','360'], ans: 2, explanation: '6! = 6 × 5 × 4 × 3 × 2 × 1 = 720 ways.' },
      { q: 'Solve the quadratic: x² - 5x + 6 = 0', opts: ['x=2,x=3','x=-2,x=-3','x=1,x=6','x=-1,x=-6'], ans: 0, explanation: 'Factoring: (x-2)(x-3) = 0, so x = 2 or x = 3.' },
      { q: 'A circle has radius 7cm. Find its area (π = 22/7).', opts: ['154 cm²','144 cm²','164 cm²','174 cm²'], ans: 0, explanation: 'Area = πr² = (22/7) × 49 = 22 × 7 = 154 cm².' },
      { q: 'If sin θ = 3/5, find cos θ.', opts: ['4/5','3/4','5/4','5/3'], ans: 0, explanation: 'Using Pythagoras: adj = √(25-9) = 4. cos θ = 4/5.' }
    ],
    'English Language': [
      { q: 'Choose the word that is closest in meaning to "BENEVOLENT":', opts: ['Cruel','Charitable','Timid','Stubborn'], ans: 1, explanation: 'Benevolent means generous or giving, which is closest to "Charitable".' },
      { q: 'Identify the grammatical error: "She don\'t know the answer."', opts: ['She','don\'t','know','answer'], ans: 1, explanation: '"Don\'t" should be "doesn\'t" with a singular subject "She". Correct: She doesn\'t know the answer.' },
      { q: 'The plural of "criterion" is:', opts: ['criterions','criterias','criteria','criterium'], ans: 2, explanation: '"Criteria" is the correct plural of "criterion" — it comes from Greek and follows Greek pluralization rules.' },
      { q: 'Choose the correct word: "The committee has/have reached a decision."', opts: ['has','have','both are correct','neither is correct'], ans: 0, explanation: '"Committee" is a collective noun treated as singular in formal British English, so "has" is correct.' },
      { q: 'What figure of speech is used: "The wind whispered through the trees"?', opts: ['Simile','Metaphor','Personification','Hyperbole'], ans: 2, explanation: 'Personification gives human qualities (whispering) to a non-human thing (wind).' },
      { q: 'Select the synonym of "EPHEMERAL":', opts: ['Eternal','Temporary','Brilliant','Mysterious'], ans: 1, explanation: 'Ephemeral means lasting for a very short time — it is synonymous with "temporary".' },
      { q: 'Choose the antonym of "LOQUACIOUS":', opts: ['Talkative','Verbose','Taciturn','Garrulous'], ans: 2, explanation: 'Loquacious means very talkative. Its antonym is "taciturn" which means habitually silent.' }
    ],
    Physics: [
      { q: 'What is the SI unit of electric charge?', opts: ['Ampere','Coulomb','Volt','Farad'], ans: 1, explanation: 'The SI unit of electric charge is the Coulomb (C), named after physicist Charles-Augustin de Coulomb.' },
      { q: 'A body of mass 5kg accelerates at 3 m/s². Find the force applied.', opts: ['15N','8N','2N','1.67N'], ans: 0, explanation: 'F = ma = 5 × 3 = 15 Newtons. This is a direct application of Newton\'s Second Law.' },
      { q: 'What is the speed of light in a vacuum?', opts: ['3 × 10⁸ m/s','3 × 10⁶ m/s','3 × 10¹⁰ m/s','3 × 10⁴ m/s'], ans: 0, explanation: 'The speed of light in a vacuum is approximately 3 × 10⁸ m/s (299,792,458 m/s precisely).' },
      { q: 'The energy stored in a capacitor of capacitance C charged to voltage V is:', opts: ['CV','½CV²','CV²','½CV'], ans: 1, explanation: 'Energy stored in a capacitor = ½CV². This comes from the work done charging the capacitor.' },
      { q: 'Which of these is NOT a vector quantity?', opts: ['Force','Velocity','Speed','Displacement'], ans: 2, explanation: 'Speed is a scalar quantity — it has magnitude only. Force, velocity, and displacement have both magnitude and direction.' }
    ],
    Chemistry: [
      { q: 'What is the valency of nitrogen in NH₃?', opts: ['2','3','4','5'], ans: 1, explanation: 'Nitrogen forms 3 bonds with hydrogen in NH₃ (ammonia), so its valency is 3.' },
      { q: 'The atomic number of carbon is:', opts: ['6','8','12','14'], ans: 0, explanation: 'Carbon has atomic number 6, meaning it has 6 protons. The atomic mass is 12.' },
      { q: 'Which gas is produced when zinc reacts with dilute HCl?', opts: ['Oxygen','Carbon dioxide','Hydrogen','Chlorine'], ans: 2, explanation: 'Zn + 2HCl → ZnCl₂ + H₂. Hydrogen gas is produced when zinc reacts with dilute hydrochloric acid.' },
      { q: 'What is the pH of a neutral solution at 25°C?', opts: ['0','7','14','1'], ans: 1, explanation: 'A neutral solution has pH = 7 at 25°C. Acidic solutions have pH < 7, basic solutions have pH > 7.' },
      { q: 'Identify the type of bond in NaCl:', opts: ['Covalent','Ionic','Metallic','Hydrogen'], ans: 1, explanation: 'NaCl (sodium chloride) is held together by ionic bonds — Na⁺ and Cl⁻ ions are attracted to each other.' }
    ],
    Biology: [
      { q: 'Which organelle is responsible for producing ATP in a cell?', opts: ['Nucleus','Ribosome','Mitochondria','Chloroplast'], ans: 2, explanation: 'The mitochondria is called the "powerhouse of the cell" — it produces ATP through cellular respiration.' },
      { q: 'Mendel\'s Law of Segregation states that:', opts: ['Genes assort independently','Alleles separate during gamete formation','Dominant masks recessive','Genes are on chromosomes'], ans: 1, explanation: 'Mendel\'s First Law (Segregation) states that allele pairs separate during gamete formation (meiosis).' },
      { q: 'Which blood group is known as the "universal donor"?', opts: ['A','B','AB','O'], ans: 3, explanation: 'Blood group O (especially O negative) is the universal donor because it lacks A, B antigens that would trigger immune reaction.' },
      { q: 'The process by which plants make their own food is called:', opts: ['Respiration','Transpiration','Photosynthesis','Osmosis'], ans: 2, explanation: 'Photosynthesis is the process where plants use sunlight, CO₂, and water to produce glucose and oxygen.' }
    ],
    Economics: [
      { q: 'The law of demand states that when price increases, quantity demanded:', opts: ['Increases','Decreases','Remains constant','Doubles'], ans: 1, explanation: 'The Law of Demand states an inverse relationship: as price rises, quantity demanded falls (ceteris paribus).' },
      { q: 'What does GDP stand for?', opts: ['Gross Domestic Product','General Development Plan','Gross Development Progress','General Domestic Plan'], ans: 0, explanation: 'GDP stands for Gross Domestic Product — the total monetary value of all goods and services produced in a country.' },
      { q: 'Inflation is best described as:', opts: ['Rise in unemployment','General rise in price levels','Fall in production','Trade deficit'], ans: 1, explanation: 'Inflation is a sustained general increase in the price level of goods and services over time, reducing purchasing power.' }
    ],
    'Verbal Reasoning': [
      { q: 'Lawyer is to courtroom as doctor is to:', opts: ['Medicine','Hospital','Stethoscope','Patient'], ans: 1, explanation: 'A lawyer works in a courtroom; similarly, a doctor works in a hospital. This is a workplace analogy.' },
      { q: 'Choose the word that does NOT belong: CAR, BUS, TRAIN, AIRPLANE, BICYCLE', opts: ['Car','Train','Airplane','Bicycle'], ans: 2, explanation: 'All others are ground/surface vehicles. An airplane is an air vehicle, making it the odd one out.' },
      { q: 'If all Xs are Ys, and all Ys are Zs, then:', opts: ['All Xs are Zs','All Zs are Xs','No Xs are Zs','Some Xs are not Zs'], ans: 0, explanation: 'By transitivity: X ⊆ Y and Y ⊆ Z, therefore X ⊆ Z. All Xs must be Zs.' }
    ],
    'Numerical Reasoning': [
      { q: 'What is the next number in the series: 2, 6, 18, 54, ?', opts: ['108','162','216','180'], ans: 1, explanation: 'Each term is multiplied by 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162.' },
      { q: 'A shopkeeper buys goods for ₦800 and sells for ₦1,000. What is the profit percentage?', opts: ['20%','25%','15%','30%'], ans: 1, explanation: 'Profit = ₦200. Profit% = (200/800) × 100 = 25%.' },
      { q: 'If 15% of a number is 45, what is the number?', opts: ['225','300','275','350'], ans: 1, explanation: 'Let the number = x. 15% × x = 45. x = 45 ÷ 0.15 = 300.' }
    ]
  };

  // Generate questions for each exam type and subject
  let qId = 1;
  const examTypes = ['JAMB', 'WAEC', 'NECO', 'Aptitude'];
  const years = [2023, 2022, 2021, 2020, 2019, 2018, 2017];
  const difficulties = ['easy', 'medium', 'hard'];

  examTypes.forEach(examType => {
    const examSubjects = subjects[examType] || [];
    examSubjects.forEach(({ subject, topics }) => {
      const templates = questionTemplates[subject] || questionTemplates['Mathematics'];
      for (let i = 0; i < 30; i++) {
        const template = templates[i % templates.length];
        const topic = topics[i % topics.length];
        const year = years[i % years.length];
        const difficulty = difficulties[i % 3];

        // Shuffle options
        const optsCopy = [...template.opts];
        const correctText = optsCopy[template.ans];
        const shuffled = shuffleArray(optsCopy);
        const newAns = shuffled.indexOf(correctText);

        bank.push({
          id: `q${qId++}`,
          examType,
          subject,
          topic,
          year,
          difficulty,
          question: template.q,
          options: shuffled,
          answer: newAns,
          explanation: template.explanation
        });
      }
    });
  });

  return bank;
}

function generateMockLeaderboard() {
  const names = [
    'Amaka Okafor','Chidi Nwachukwu','Fatima Abubakar','Tunde Adeleke','Ngozi Ezenwachi',
    'Emeka Obi','Kemi Adeyemi','Yusuf Musa','Aisha Bello','Femi Olawale',
    'Grace Eze','Biodun Afolabi','Zainab Usman','Seun Olanrewaju','Ama Mensah',
    'Rotimi Adebayo','Hauwa Ibrahim','Chuka Okeke','Toyin Babatunde','Musa Tanko'
  ];
  const examTypes = ['JAMB','WAEC','NECO','Aptitude'];
  const avatarColors = ['#8b5cf6','#00d4ff','#10b981','#f59e0b','#ec4899','#f97316','#a855f7','#06b6d4'];

  return names.map((name, i) => ({
    rank: i + 1,
    userId: `mock_${i}`,
    name,
    score: Math.floor(Math.random() * 40) + 55,
    examType: examTypes[Math.floor(Math.random() * examTypes.length)],
    accuracy: Math.floor(Math.random() * 30) + 65,
    timeUsed: `${Math.floor(Math.random() * 60) + 30}:${String(Math.floor(Math.random() * 60)).padStart(2,'0')}`,
    date: new Date(Date.now() - Math.random() * 30 * 86400000).toLocaleDateString('en-NG'),
    avatarColor: avatarColors[i % avatarColors.length],
    avatarLetter: name[0]
  }));
}

/* =====================================================================
   3. APP STATE
   ===================================================================== */
const STATE = {
  currentUser: null,
  examConfig: {
    type: 'JAMB',
    subjects: [],
    questionCount: 20,
    durationMinutes: 30,
    year: 'random',
    difficulty: 'all'
  },
  exam: {
    active: false,
    questions: [],
    answers: {},
    flagged: new Set(),
    currentIndex: 0,
    currentSubject: null,
    startTime: null,
    timerInterval: null,
    remainingSeconds: 0,
    submitted: false
  },
  leaderboardFilter: 'all',
  sessionCount: 0
};

const SUBJECTS_MAP = {
  JAMB: ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature'],
  WAEC: ['Mathematics', 'English Language', 'Biology', 'Chemistry', 'Physics', 'Economics'],
  NECO: ['Mathematics', 'English Language', 'Civic Education', 'Commerce'],
  Aptitude: ['Verbal Reasoning', 'Numerical Reasoning', 'Abstract Reasoning', 'Logical Reasoning', 'Spatial Reasoning']
};

/* =====================================================================
   4. THEME & ACCESSIBILITY CONTROLS
   ===================================================================== */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('tyk_theme', theme);
  } catch (e) {
    /* ignore storage errors */
  }
  const isDark = theme === 'dark';
  const icon = isDark ? '🌙' : '☀️';
  const label = isDark ? 'Dark Mode' : 'Light Mode';

  document.querySelectorAll('.theme-icon').forEach(el => {
    el.textContent = icon;
  });
  document.querySelectorAll('.theme-text, .theme-label').forEach(el => {
    el.textContent = label;
  });
}

function quickDemoLogin() {
  const emailInput = document.getElementById('login-email');
  const passInput  = document.getElementById('login-password');
  if (emailInput) emailInput.value = 'student@test.com';
  if (passInput) passInput.value = 'password';
  handleLogin();
}

function fillDemoCredentials() {
  const emailInput = document.getElementById('login-email');
  const passInput  = document.getElementById('login-password');
  if (emailInput) emailInput.value = 'student@test.com';
  if (passInput) passInput.value = 'password';
  emailInput?.focus();
  showToast('Demo credentials filled. Click "Login to Practice"!', 'info');
}

/* =====================================================================
   5. AUTHENTICATION
   ===================================================================== */
function switchAuthTab(tab) {
  const loginTab = document.getElementById('login-tab');
  const regTab   = document.getElementById('register-tab');
  const loginForm= document.getElementById('login-form');
  const regForm  = document.getElementById('register-form');

  if (loginTab) {
    loginTab.classList.toggle('active', tab === 'login');
    loginTab.setAttribute('aria-selected', tab === 'login' ? 'true' : 'false');
  }
  if (regTab) {
    regTab.classList.toggle('active', tab === 'register');
    regTab.setAttribute('aria-selected', tab === 'register' ? 'true' : 'false');
  }
  if (loginForm) loginForm.classList.toggle('hidden', tab !== 'login');
  if (regForm)   regForm.classList.toggle('hidden', tab !== 'register');
}

function handleLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  
  const emailInput = document.getElementById('login-email');
  const passInput  = document.getElementById('login-password');
  let email = (emailInput?.value || '').trim();
  let pass  = passInput?.value || '';

  // If both are blank, fallback to demo user for instant accessibility
  if (!email && !pass) {
    email = 'student@test.com';
    pass = 'password';
    if (emailInput) emailInput.value = email;
    if (passInput) passInput.value = pass;
  } else if (!email) {
    showToast('Please enter your email address.', 'warning');
    emailInput?.focus();
    return;
  } else if (!pass) {
    showToast('Please enter your password.', 'warning');
    passInput?.focus();
    return;
  }

  let user = DB.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Gracefully register new user
    user = {
      id: 'u' + Date.now(),
      name: email.split('@')[0],
      email: email,
      password: pass,
      subscription: 'free',
      streak: 1,
      avatar: (email[0] || 'U').toUpperCase(),
      joinDate: new Date().toISOString().split('T')[0],
      examFocus: 'JAMB'
    };
    DB.users.push(user);
  }

  STATE.currentUser = user;
  try {
    localStorage.setItem('tyk_user', JSON.stringify(user));
  } catch (err) {
    /* ignore storage errors */
  }

  initApp();
  showToast(`Welcome back, ${user.name}! Ready to practice.`, 'success');
}

function handleRegister(e) {
  if (e && e.preventDefault) e.preventDefault();
  const nameInput  = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const passInput  = document.getElementById('reg-password');
  const focusInput = document.getElementById('reg-exam-type');

  const name  = (nameInput?.value || '').trim();
  const email = (emailInput?.value || '').trim().toLowerCase();
  const pass  = passInput?.value || '';
  const focus = focusInput?.value || 'JAMB';

  if (!name || !email || !pass) {
    showToast('Please fill all registration fields.', 'warning');
    return;
  }

  if (DB.users.find(u => u.email.toLowerCase() === email)) {
    showToast('Email already registered. Logging you in...', 'info');
    const existing = DB.users.find(u => u.email.toLowerCase() === email);
    STATE.currentUser = existing;
    try { localStorage.setItem('tyk_user', JSON.stringify(existing)); } catch(e){}
    initApp();
    return;
  }

  if (pass.length < 6) {
    showToast('Password must be at least 6 characters.', 'warning');
    return;
  }

  const user = {
    id: 'u' + Date.now(),
    name,
    email,
    password: pass,
    subscription: 'free',
    streak: 1,
    avatar: (name[0] || 'U').toUpperCase(),
    joinDate: new Date().toISOString().split('T')[0],
    examFocus: focus
  };
  DB.users.push(user);
  STATE.currentUser = user;
  try { localStorage.setItem('tyk_user', JSON.stringify(user)); } catch(e){}
  initApp();
  showToast(`Account created! Welcome, ${name}! 🚀`, 'success');
}

function handleLogout() {
  STATE.currentUser = null;
  try { localStorage.removeItem('tyk_user'); } catch(e){}
  if (STATE.exam.timerInterval) clearInterval(STATE.exam.timerInterval);

  const mainApp = document.getElementById('main-app');
  if (mainApp) {
    mainApp.classList.add('hidden');
    mainApp.style.display = 'none';
  }

  const overlay = document.getElementById('auth-overlay');
  if (overlay) {
    overlay.classList.add('active');
    overlay.style.display = 'flex';
  }

  showToast('Logged out successfully.', 'info');
}

/* =====================================================================
   6. APP INITIALIZATION
   ===================================================================== */
function initApp() {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
  }

  const mainApp = document.getElementById('main-app');
  if (mainApp) {
    mainApp.classList.remove('hidden');
    mainApp.style.display = 'block';
  }

  const u = STATE.currentUser;
  if (!u) return;

  const navName = document.getElementById('nav-name');
  if (navName) navName.textContent = u.name.split(' ')[0];

  const navAvatar = document.getElementById('nav-avatar');
  if (navAvatar) navAvatar.textContent = u.avatar;

  const navBadge = document.getElementById('nav-badge');
  if (navBadge) {
    navBadge.textContent = (u.subscription || 'FREE').toUpperCase();
    navBadge.className = `user-badge ${u.subscription || 'free'}`;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const heroGreeting = document.getElementById('hero-greeting');
  if (heroGreeting) {
    heroGreeting.textContent = `${greeting}, ${u.name.split(' ')[0]}! 👋`;
  }

  updateDashboardStats();
  showPage('study-buddy');
}

function updateDashboardStats() {
  const userResults = DB.results.filter(r => r.userId === STATE.currentUser?.id);
  const totalExams = userResults.length;
  const avgScore = totalExams > 0
    ? Math.round(userResults.reduce((s, r) => s + r.score, 0) / totalExams)
    : 0;

  document.getElementById('stat-total-exams').textContent = totalExams;
  document.getElementById('stat-avg-score').textContent = avgScore + '%';
  document.getElementById('stat-streak').textContent = STATE.currentUser?.streak || 0;

  // Compute rank
  const allUserScores = {};
  DB.results.forEach(r => {
    if (!allUserScores[r.userId] || r.score > allUserScores[r.userId]) {
      allUserScores[r.userId] = r.score;
    }
  });
  const myBest = allUserScores[STATE.currentUser?.id] || 0;
  const rank = Object.values(allUserScores).filter(s => s > myBest).length + 1;
  document.getElementById('stat-rank').textContent = totalExams > 0 ? `#${rank}` : '#--';

  renderRecentActivity(userResults);
  updateWeekTopicAnalysis(userResults);
}

function renderRecentActivity(results) {
  const el = document.getElementById('recent-activity-list');
  if (results.length === 0) {
    el.innerHTML = `<div class="activity-empty"><div class="activity-empty-icon">📋</div><p>No exams taken yet. Start practicing above!</p></div>`;
    return;
  }
  const recent = [...results].reverse().slice(0, 5);
  el.innerHTML = recent.map(r => {
    const grade = r.score >= 70 ? 'good' : r.score >= 50 ? 'average' : 'poor';
    return `
      <div class="activity-item">
        <span class="activity-exam-badge exam-type-badge ${r.examType.toLowerCase()}">${r.examType}</span>
        <div class="activity-meta">
          <strong>${r.subjects.join(', ')}</strong>
          <span>${r.date} · ${r.questionCount} questions · ${r.timeUsed}</span>
        </div>
        <div class="activity-score ${grade}">${r.score}%</div>
      </div>
    `;
  }).join('');
}

function updateWeekTopicAnalysis(results) {
  if (results.length < 3) return;
  const analysis = computeWeakAreas(results);
  if (analysis.length > 0) {
    const top = analysis[0];
    document.getElementById('week-topic-text').textContent =
      `📉 You struggle most with "${top.topic}" in ${top.subject} (${top.accuracy}% accuracy). Focus on this topic this week!`;
  }
}

/* =====================================================================
   6. PAGE NAVIGATION
   ===================================================================== */
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const activeNav = document.getElementById(`nav-item-${pageId}`);
  if (activeNav) activeNav.classList.add('active');

  const page = document.getElementById(`page-${pageId}`);
  if (page) {
    if (pageId === 'exam') {
      page.style.display = 'flex';
      page.classList.add('active');
    } else {
      page.style.display = 'block';
      page.classList.add('active');
    }
  }

  // Hide nav on exam page
  const topnav = document.getElementById('topnav');
  if (topnav) topnav.style.display = pageId === 'exam' ? 'none' : 'flex';

  // Page-specific init
  if (pageId === 'study-buddy' && typeof initStudyBuddy === 'function') initStudyBuddy();
  if (pageId === 'leaderboard') renderLeaderboard();
  if (pageId === 'analysis')    renderAnalysis();
  if (pageId === 'dashboard')   updateDashboardStats();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =====================================================================
   7. EXAM SETUP
   ===================================================================== */
let selectedQCount = 20;
let selectedDuration = 30;
let showCustomTimer = false;

function selectExamType(type) {
  STATE.examConfig.type = type;
  populateSetupPage(type);
  showPage('exam-setup');
}

function populateSetupPage(type) {
  const badges = { JAMB: 'jamb', WAEC: 'waec', NECO: 'neco', Aptitude: 'apt' };
  const titles = { JAMB: 'JAMB UTME Practice', WAEC: 'WAEC SSCE Practice', NECO: 'NECO SSCE Practice', Aptitude: 'Job Aptitude Practice' };

  document.getElementById('setup-exam-badge').textContent = type;
  document.getElementById('setup-exam-badge').className = `setup-exam-badge exam-type-badge ${badges[type]}`;
  document.getElementById('setup-exam-title').textContent = titles[type];
  document.getElementById('sum-type').textContent = type;

  // Build subject checkboxes
  const subjects = SUBJECTS_MAP[type] || [];
  STATE.examConfig.subjects = [...subjects]; // default: all selected
  const container = document.getElementById('subject-checkboxes');
  container.innerHTML = subjects.map(s => `
    <label class="subject-checkbox-item checked" id="subj-${s.replace(/\s/g,'_')}">
      <input type="checkbox" checked onchange="toggleSubject('${s}', this)"> ${s}
    </label>
  `).join('');
  updateSummary();
}

function toggleSubject(subject, checkbox) {
  const label = checkbox.closest('.subject-checkbox-item');
  if (checkbox.checked) {
    if (!STATE.examConfig.subjects.includes(subject)) STATE.examConfig.subjects.push(subject);
    label.classList.add('checked');
  } else {
    STATE.examConfig.subjects = STATE.examConfig.subjects.filter(s => s !== subject);
    label.classList.remove('checked');
  }
  updateSummary();
}

function setQCount(btn, count) {
  document.querySelectorAll('.q-count-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedQCount = count;
  STATE.examConfig.questionCount = count;
  updateSummary();
}

function setTimerPreset(btn, minutes) {
  document.querySelectorAll('.timer-preset-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (minutes === 0) {
    document.getElementById('timer-custom-input').style.display = 'flex';
    selectedDuration = parseInt(document.getElementById('custom-minutes').value) || 60;
  } else {
    document.getElementById('timer-custom-input').style.display = 'none';
    selectedDuration = minutes;
  }
  STATE.examConfig.durationMinutes = selectedDuration;
  updateSummary();
}

function updateSummary() {
  document.getElementById('sum-subjects').textContent =
    STATE.examConfig.subjects.length === SUBJECTS_MAP[STATE.examConfig.type]?.length
      ? 'All' : STATE.examConfig.subjects.slice(0,2).join(', ') + (STATE.examConfig.subjects.length > 2 ? '...' : '');
  document.getElementById('sum-qcount').textContent = selectedQCount;
  document.getElementById('sum-duration').textContent = selectedDuration + ' min';
  const yearEl = document.querySelector('input[name="year"]:checked');
  document.getElementById('sum-year').textContent = yearEl ? (yearEl.value === 'random' ? 'Random Mix' : yearEl.value) : 'Random';
}

/* =====================================================================
   8. EXAM ENGINE
   ===================================================================== */
function startExam() {
  const user = STATE.currentUser;
  if (!user) { showToast('Please login first.', 'error'); return; }

  const subjects = STATE.examConfig.subjects;
  if (subjects.length === 0) { showToast('Please select at least one subject.', 'error'); return; }

  // Subscription check
  if (user.subscription === 'free') {
    const todayExams = DB.results.filter(r => {
      return r.userId === user.id && r.date === new Date().toLocaleDateString('en-NG');
    }).length;
    if (todayExams >= 3) {
      showToast('Free plan limit reached (3/day). Upgrade to Pro!', 'warning');
      setTimeout(() => showPage('subscription'), 1500);
      return;
    }
  }

  // Get duration from custom input if needed
  const customInput = document.getElementById('custom-minutes');
  if (customInput && document.getElementById('timer-custom-input').style.display !== 'none') {
    selectedDuration = parseInt(customInput.value) || 60;
  }

  // Build question pool
  const pool = DB.questions.filter(q => {
    if (q.examType !== STATE.examConfig.type) return false;
    if (!subjects.includes(q.subject)) return false;
    const yearFilter = document.querySelector('input[name="year"]:checked')?.value;
    if (yearFilter && yearFilter !== 'random' && q.year !== parseInt(yearFilter)) return false;
    const diff = document.querySelector('input[name="difficulty"]:checked')?.value;
    if (diff && diff !== 'all' && q.difficulty !== diff) return false;
    return true;
  });

  if (pool.length < 5) {
    showToast('Not enough questions available for this selection. Try different filters.', 'warning');
    return;
  }

  // Randomize and pick
  const shuffled = shuffleArray(pool);
  const questions = shuffled.slice(0, Math.min(selectedQCount, shuffled.length));

  // Init exam state
  STATE.exam = {
    active: true,
    questions,
    answers: {},
    flagged: new Set(),
    currentIndex: 0,
    currentSubject: questions[0]?.subject || subjects[0],
    startTime: Date.now(),
    timerInterval: null,
    remainingSeconds: selectedDuration * 60,
    submitted: false,
    examType: STATE.examConfig.type,
    subjects: [...subjects]
  };

  buildExamUI();
  showPage('exam');
  startTimer();
  loadQuestion(0);
}

function buildExamUI() {
  const { questions, examType, subjects } = STATE.exam;

  // Labels
  document.getElementById('exam-label').textContent = examType + ' Practice';
  document.getElementById('exam-session-id').textContent = `Session #${String(++STATE.sessionCount).padStart(3,'0')}`;

  // Question grid
  const grid = document.getElementById('question-grid');
  grid.innerHTML = questions.map((q, i) => `
    <button class="q-grid-btn" id="qgb-${i}" onclick="loadQuestion(${i})">${i + 1}</button>
  `).join('');

  // Subject tabs
  const uniqueSubjects = [...new Set(questions.map(q => q.subject))];
  const tabs = document.getElementById('subject-tabs');
  tabs.innerHTML = uniqueSubjects.map(s => `
    <button class="subject-tab ${s === STATE.exam.currentSubject ? 'active' : ''}"
      onclick="jumpToSubject('${s}', this)">${s}</button>
  `).join('');

  updateProgress();
}

function loadQuestion(index) {
  const { questions, answers, flagged } = STATE.exam;
  if (index < 0 || index >= questions.length) return;

  STATE.exam.currentIndex = index;
  const q = questions[index];

  // Update header info
  document.getElementById('q-number').textContent = `Question ${index + 1} of ${questions.length}`;
  document.getElementById('q-subject-tag').textContent = q.subject;
  document.getElementById('q-year-tag').textContent = q.year;
  document.getElementById('q-difficulty-tag').textContent = q.difficulty;
  document.getElementById('question-text').textContent = q.question;

  // Flag button
  const flagBtn = document.getElementById('flag-btn');
  flagBtn.classList.toggle('flagged', flagged.has(index));

  // Build options
  const optionsGrid = document.getElementById('options-grid');
  const selectedAns = answers[index];
  optionsGrid.innerHTML = q.options.map((opt, i) => `
    <div class="option-item ${selectedAns === i ? 'selected' : ''}"
      id="opt-${i}" onclick="selectAnswer(${i})">
      <div class="option-letter">${String.fromCharCode(65 + i)}</div>
      <div class="option-text">${opt}</div>
    </div>
  `).join('');

  // Update grid button states
  updateGridButton(index);
  updateSubjectTabs(q.subject);

  // Nav buttons
  document.getElementById('prev-btn').style.opacity = index === 0 ? '0.3' : '1';
  document.getElementById('next-btn').style.opacity = index === questions.length - 1 ? '0.3' : '1';

  updateProgress();
  updateSidebarStats();
}

function selectAnswer(optIndex) {
  const { currentIndex, answers } = STATE.exam;
  STATE.exam.answers[currentIndex] = optIndex;

  // Visually update options
  document.querySelectorAll('.option-item').forEach((el, i) => {
    el.classList.toggle('selected', i === optIndex);
  });

  updateGridButton(currentIndex);
  updateSidebarStats();

  // Auto-advance after brief delay
  setTimeout(() => {
    if (STATE.exam.currentIndex < STATE.exam.questions.length - 1) {
      navigateQuestion(1);
    }
  }, 350);
}

function navigateQuestion(dir) {
  const next = STATE.exam.currentIndex + dir;
  if (next >= 0 && next < STATE.exam.questions.length) {
    loadQuestion(next);
  }
}

function skipQuestion() {
  if (STATE.exam.currentIndex < STATE.exam.questions.length - 1) {
    navigateQuestion(1);
  }
}

function toggleFlag() {
  const idx = STATE.exam.currentIndex;
  if (STATE.exam.flagged.has(idx)) {
    STATE.exam.flagged.delete(idx);
    document.getElementById('flag-btn').classList.remove('flagged');
  } else {
    STATE.exam.flagged.add(idx);
    document.getElementById('flag-btn').classList.add('flagged');
  }
  updateGridButton(idx);
}

function jumpToSubject(subject, btn) {
  document.querySelectorAll('.subject-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const idx = STATE.exam.questions.findIndex(q => q.subject === subject);
  if (idx !== -1) loadQuestion(idx);
}

function updateGridButton(index) {
  const btn = document.getElementById(`qgb-${index}`);
  if (!btn) return;
  btn.className = 'q-grid-btn';
  if (index === STATE.exam.currentIndex) btn.classList.add('current');
  else if (STATE.exam.answers[index] !== undefined) btn.classList.add('answered');
  else if (STATE.exam.flagged.has(index)) btn.classList.add('flagged');
}

function updateSubjectTabs(activeSubject) {
  document.querySelectorAll('.subject-tab').forEach(t => {
    t.classList.toggle('active', t.textContent === activeSubject);
  });
}

function updateProgress() {
  const { questions, answers } = STATE.exam;
  const answered = Object.keys(answers).length;
  const pct = (answered / questions.length) * 100;
  const bar = document.getElementById('exam-progress-bar');
  bar.style.setProperty('--progress', pct + '%');
  document.getElementById('exam-progress-text').textContent = `${answered} / ${questions.length}`;
}

function updateSidebarStats() {
  const answered = Object.keys(STATE.exam.answers).length;
  const skipped = STATE.exam.questions.length - answered;
  document.getElementById('sb-answered').textContent = answered;
  document.getElementById('sb-skipped').textContent = skipped;
}

/* =====================================================================
   9. TIMER ENGINE
   ===================================================================== */
function startTimer() {
  const timerEl  = document.getElementById('exam-timer');
  const timerBox = document.getElementById('exam-timer-box');

  STATE.exam.timerInterval = setInterval(() => {
    STATE.exam.remainingSeconds--;
    const s = STATE.exam.remainingSeconds;

    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    timerEl.textContent = (h > 0 ? String(h).padStart(2,'0') + ':' : '') +
      String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');

    // Warning states
    timerBox.classList.remove('warning','critical');
    document.getElementById('timer-warning').classList.add('hidden');

    if (s <= 300 && s > 60) {
      timerBox.classList.add('warning');
      document.getElementById('timer-warning').classList.remove('hidden');
      document.getElementById('timer-warning').textContent = '⚠️ 5 minutes left!';
    } else if (s <= 60) {
      timerBox.classList.add('critical');
      document.getElementById('timer-warning').classList.remove('hidden');
      document.getElementById('timer-warning').textContent = '🚨 Less than 1 minute!';
    }

    if (s <= 0) {
      clearInterval(STATE.exam.timerInterval);
      showToast('⏰ Time\'s up! Auto-submitting...', 'warning');
      setTimeout(() => submitExam(), 1500);
    }
  }, 1000);
}

/* =====================================================================
   10. SUBMIT & SCORE ENGINE
   ===================================================================== */
function confirmSubmit() {
  const { questions, answers } = STATE.exam;
  const answered = Object.keys(answers).length;
  const skipped  = questions.length - answered;

  document.getElementById('modal-answered').textContent = answered;
  document.getElementById('modal-total').textContent = questions.length;
  document.getElementById('modal-skipped').textContent = skipped;

  const skipMsg = document.getElementById('modal-skipped-msg');
  skipMsg.classList.toggle('hidden', skipped === 0);

  openModal('submit-modal');
}

function submitExam() {
  closeModal('submit-modal');
  clearInterval(STATE.exam.timerInterval);
  STATE.exam.submitted = true;

  const { questions, answers, startTime, remainingSeconds, examType, subjects } = STATE.exam;
  const totalDuration = selectedDuration * 60;
  const timeUsedSeconds = totalDuration - remainingSeconds;

  // Score calculation
  let correct = 0, wrong = 0, skipped = 0;
  const topicStats = {};

  questions.forEach((q, i) => {
    const userAns = answers[i];
    const topic = q.topic;
    const key = `${q.subject}||${topic}`;

    if (!topicStats[key]) topicStats[key] = { subject: q.subject, topic, correct: 0, total: 0 };
    topicStats[key].total++;

    if (userAns === undefined) {
      skipped++;
    } else if (userAns === q.answer) {
      correct++;
      topicStats[key].correct++;
    } else {
      wrong++;
    }
  });

  const score = Math.round((correct / questions.length) * 100);
  const timeUsed = formatTime(timeUsedSeconds);

  // Save result
  const result = {
    id: 'r' + Date.now(),
    userId: STATE.currentUser.id,
    userName: STATE.currentUser.name,
    examType,
    subjects,
    questionCount: questions.length,
    correct, wrong, skipped, score,
    timeUsed,
    timeUsedSeconds,
    date: new Date().toLocaleDateString('en-NG'),
    topicStats,
    questions: [...questions],
    answers: {...answers}
  };

  DB.results.push(result);

  // Add to leaderboard
  addToLeaderboard(result);

  // Update streak
  STATE.currentUser.streak = (STATE.currentUser.streak || 0) + 1;

  showResultPage(result);
  showPage('result');
}

function addToLeaderboard(result) {
  const entry = {
    rank: 0,
    userId: result.userId,
    name: STATE.currentUser.name,
    score: result.score,
    examType: result.examType,
    accuracy: Math.round((result.correct / result.questionCount) * 100),
    timeUsed: result.timeUsed,
    date: result.date,
    avatarColor: '#8b5cf6',
    avatarLetter: STATE.currentUser.name[0]
  };
  DB.leaderboard.push(entry);
  // Re-rank
  DB.leaderboard.sort((a, b) => b.score - a.score);
  DB.leaderboard.forEach((e, i) => e.rank = i + 1);
}

/* =====================================================================
   11. RESULT PAGE
   ===================================================================== */
function showResultPage(result) {
  const { score, correct, wrong, skipped, timeUsed, questions, answers, examType } = result;

  // Score circle animation
  const angle = Math.round((score / 100) * 360);
  const circle = document.getElementById('result-score-circle');
  circle.style.background = `conic-gradient(${getScoreColor(score)} ${angle}deg, rgba(255,255,255,0.06) 0deg)`;
  document.getElementById('result-score-percent').textContent = score + '%';

  // Grade & message
  const { grade, message } = getGradeInfo(score);
  document.getElementById('result-grade').textContent = `Grade: ${grade}`;
  document.getElementById('result-message').textContent = message;

  document.getElementById('r-correct').textContent = correct;
  document.getElementById('r-wrong').textContent = wrong;
  document.getElementById('r-skipped').textContent = skipped;
  document.getElementById('r-time').textContent = timeUsed;

  // Subject breakdown
  renderSubjectBreakdown(result);
}

function getScoreColor(score) {
  if (score >= 70) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function getGradeInfo(score) {
  if (score >= 90) return { grade: 'A+', message: 'Outstanding! You\'re exam-ready! 🏆' };
  if (score >= 80) return { grade: 'A',  message: 'Excellent performance! Keep it up! 🎯' };
  if (score >= 70) return { grade: 'B',  message: 'Good job! A few more sessions will perfect it! 👍' };
  if (score >= 60) return { grade: 'C',  message: 'Fair score. Focus on your weak areas! 📚' };
  if (score >= 50) return { grade: 'D',  message: 'Needs improvement. Practice more daily! 💪' };
  return { grade: 'F', message: 'Don\'t give up! Review the corrections and try again! 🔁' };
}

function renderSubjectBreakdown(result) {
  const { questions, answers } = result;
  const subjectMap = {};

  questions.forEach((q, i) => {
    if (!subjectMap[q.subject]) subjectMap[q.subject] = { correct: 0, total: 0 };
    subjectMap[q.subject].total++;
    if (answers[i] === q.answer) subjectMap[q.subject].correct++;
  });

  const container = document.getElementById('subject-breakdown-chart');
  container.innerHTML = Object.entries(subjectMap).map(([subj, data]) => {
    const pct = Math.round((data.correct / data.total) * 100);
    const cls = pct >= 70 ? 'good' : pct >= 50 ? 'average' : 'poor';
    return `
      <div class="bar-chart-item">
        <div class="bar-chart-label">${subj}</div>
        <div class="bar-chart-track">
          <div class="bar-chart-fill ${cls}" style="width:${pct}%">${data.correct}/${data.total}</div>
        </div>
        <div class="bar-chart-pct ${cls === 'good' ? 'good' : ''}">${pct}%</div>
      </div>
    `;
  }).join('');
}

function reviewAnswers() {
  const reviewSection = document.getElementById('answer-review-section');
  reviewSection.classList.remove('hidden');

  const lastResult = [...DB.results].filter(r => r.userId === STATE.currentUser?.id).pop();
  if (!lastResult) return;

  const { questions, answers } = lastResult;
  const list = document.getElementById('answer-review-list');

  list.innerHTML = questions.map((q, i) => {
    const userAns = answers[i];
    let status, statusIcon;
    if (userAns === undefined) { status = 'skipped-review'; statusIcon = '⏩'; }
    else if (userAns === q.answer) { status = 'correct-review'; statusIcon = '✅'; }
    else { status = 'wrong-review'; statusIcon = '❌'; }

    const yourAnswerText = userAns !== undefined ? q.options[userAns] : 'Not answered';
    const correctAnswerText = q.options[q.answer];

    // Check if user has pro access for explanation
    const hasExplanation = STATE.currentUser?.subscription !== 'free';

    return `
      <div class="review-item ${status}">
        <div class="review-header">
          <span class="review-status">${statusIcon}</span>
          <span class="review-q-num">Question ${i + 1}</span>
          <span class="review-subject-tag">${q.subject}</span>
          <span class="review-subject-tag">${q.topic}</span>
        </div>
        <div class="review-question">${q.question}</div>
        <div class="review-answers">
          ${userAns !== undefined && userAns !== q.answer ? `<div class="review-answer your-answer">❌ Your answer: ${yourAnswerText}</div>` : ''}
          <div class="review-answer correct-answer">✅ Correct answer: ${correctAnswerText}</div>
        </div>
        ${hasExplanation
          ? `<div class="review-explanation"><strong>Explanation:</strong> ${q.explanation}</div>`
          : `<div class="review-explanation" style="text-align:center;padding:12px">
              🔒 <a href="#" onclick="showPage('subscription');" style="color:var(--cyan)">Upgrade to Pro</a> to see detailed explanations for all questions.
            </div>`
        }
        <div style="margin-top:12px;">
          <button type="button" class="btn-primary" style="font-size:12px; padding:6px 14px; display:inline-flex; align-items:center; gap:6px;" onclick="explainQuestionWithBuddy('${encodeURIComponent(q.question)}', '${q.subject}', '${q.topic}')">
            <span>💡 Ask AI Study Buddy to Explain Step-by-Step</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  reviewSection.scrollIntoView({ behavior: 'smooth' });
}

/* =====================================================================
   12. LEADERBOARD
   ===================================================================== */
function filterLeaderboard(period, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  STATE.leaderboardFilter = period;
  renderLeaderboard();
}

function renderLeaderboard() {
  const examFilter = document.getElementById('lb-exam-filter')?.value || 'all';
  let data = [...DB.leaderboard];

  // Filter by exam type
  if (examFilter !== 'all') data = data.filter(e => e.examType === examFilter);

  // Filter by period
  const now = Date.now();
  if (STATE.leaderboardFilter === 'week') {
    data = data.filter(e => {
      const d = new Date(e.date).getTime();
      return now - d <= 7 * 86400000;
    });
  } else if (STATE.leaderboardFilter === 'today') {
    const today = new Date().toLocaleDateString('en-NG');
    data = data.filter(e => e.date === today);
  }

  data.sort((a, b) => b.score - a.score);
  const top = data.slice(0, 3);

  // Podium
  renderPodium(top);

  // Table
  const tbody = document.getElementById('leaderboard-tbody');
  tbody.innerHTML = data.slice(0, 30).map((e, i) => {
    const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
    const scoreClass = e.score >= 80 ? 'great' : e.score >= 65 ? 'good' : 'avg';
    const isYou = e.userId === STATE.currentUser?.id;
    return `
      <tr ${isYou ? 'style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2)"' : ''}>
        <td><span class="lb-rank ${rankClass}">${rankEmoji}</span></td>
        <td>
          <div class="lb-student">
            <div class="lb-avatar" style="background:${e.avatarColor}">${e.avatarLetter}</div>
            <span>${e.name} ${isYou ? '<span style="color:var(--cyan);font-size:11px">(You)</span>' : ''}</span>
          </div>
        </td>
        <td><span class="exam-type-badge ${e.examType?.toLowerCase()}">${e.examType}</span></td>
        <td><span class="lb-score ${scoreClass}">${e.score}%</span></td>
        <td>${e.accuracy}%</td>
        <td>${e.timeUsed}</td>
        <td>${e.date}</td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">No data available for this filter.</td></tr>';

  // Your position
  const myEntry = data.find(e => e.userId === STATE.currentUser?.id);
  const myRank  = data.findIndex(e => e.userId === STATE.currentUser?.id) + 1;
  const posEl   = document.getElementById('your-position-content');
  if (myEntry) {
    posEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:20px;justify-content:center;flex-wrap:wrap">
        <div style="font-size:36px;font-weight:900;color:var(--gold)">#${myRank}</div>
        <div>
          <div style="font-size:18px;font-weight:700">${myEntry.name}</div>
          <div style="color:var(--text-secondary)">Best Score: ${myEntry.score}% · Accuracy: ${myEntry.accuracy}%</div>
        </div>
      </div>
    `;
  } else {
    posEl.textContent = 'Complete an exam to appear on the leaderboard.';
  }
}

function renderPodium(top) {
  const podium = document.getElementById('podium');
  if (top.length === 0) { podium.innerHTML = '<p style="color:var(--text-muted);text-align:center">No entries yet.</p>'; return; }

  // Arrange: 2nd, 1st, 3rd
  const ordered = [top[1], top[0], top[2]].filter(Boolean);
  const positions = top[1] ? [2, 1, 3] : [1, 3];
  const heights = { 1: 100, 2: 70, 3: 50 };
  const emojis = { 1: '🥇', 2: '🥈', 3: '🥉' };

  podium.innerHTML = ordered.map((e, i) => {
    const rank = positions[i];
    return `
      <div class="podium-item">
        <div class="podium-avatar rank-${rank}" style="background:${e.avatarColor}">
          ${e.avatarLetter}
          <span class="podium-rank-badge">${emojis[rank]}</span>
        </div>
        <div class="podium-name">${e.name.split(' ')[0]}</div>
        <div class="podium-score">${e.score}%</div>
        <div class="podium-block rank-${rank}" style="height:${heights[rank]}px"></div>
      </div>
    `;
  }).join('');
}

/* =====================================================================
   13. ANALYSIS ENGINE — Weak Area Algorithm
   ===================================================================== */
function computeWeakAreas(results) {
  const topicStats = {};

  results.forEach(r => {
    if (!r.topicStats) return;
    Object.values(r.topicStats).forEach(t => {
      const key = `${t.subject}||${t.topic}`;
      if (!topicStats[key]) topicStats[key] = { subject: t.subject, topic: t.topic, correct: 0, total: 0 };
      topicStats[key].correct += t.correct;
      topicStats[key].total   += t.total;
    });
  });

  return Object.values(topicStats)
    .filter(t => t.total >= 2)
    .map(t => ({ ...t, accuracy: Math.round((t.correct / t.total) * 100) }))
    .sort((a, b) => a.accuracy - b.accuracy); // worst first
}

function renderAnalysis() {
  const userResults = DB.results.filter(r => r.userId === STATE.currentUser?.id);

  if (userResults.length === 0) {
    ['a-total','a-avg','a-best','a-time'].forEach(id => document.getElementById(id).textContent = '0');
    document.getElementById('subject-perf-chart').innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px">Complete practice sessions to see your analysis.</p>';
    document.getElementById('weak-areas-list').innerHTML = '<p style="color:var(--text-muted)">No data yet. Take some practice sessions!</p>';
    document.getElementById('score-trend-chart').innerHTML = '';
    document.getElementById('topic-accuracy-tbody').innerHTML = '';
    return;
  }

  const total  = userResults.length;
  const avg    = Math.round(userResults.reduce((s, r) => s + r.score, 0) / total);
  const best   = Math.max(...userResults.map(r => r.score));
  const avgTimePerQ = Math.round(userResults.reduce((s, r) => s + (r.timeUsedSeconds / r.questionCount), 0) / total);

  document.getElementById('a-total').textContent = total;
  document.getElementById('a-avg').textContent   = avg + '%';
  document.getElementById('a-best').textContent  = best + '%';
  document.getElementById('a-time').textContent  = avgTimePerQ + 's';

  // Subject performance chart
  const subjectMap = {};
  userResults.forEach(r => {
    r.questions?.forEach((q, i) => {
      if (!subjectMap[q.subject]) subjectMap[q.subject] = { correct: 0, total: 0 };
      subjectMap[q.subject].total++;
      if (r.answers?.[i] === q.answer) subjectMap[q.subject].correct++;
    });
  });

  const chartEl = document.getElementById('subject-perf-chart');
  chartEl.innerHTML = Object.entries(subjectMap).map(([subj, d]) => {
    const pct = Math.round((d.correct / d.total) * 100);
    const cls = pct >= 70 ? 'good' : pct >= 50 ? 'average' : 'poor';
    return `
      <div class="bar-chart-item">
        <div class="bar-chart-label">${subj}</div>
        <div class="bar-chart-track">
          <div class="bar-chart-fill ${cls}" style="width:${pct}%">${d.correct}/${d.total}</div>
        </div>
        <div class="bar-chart-pct">${pct}%</div>
      </div>
    `;
  }).join('') || '<p style="color:var(--text-muted)">No subject data yet.</p>';

  // Weak areas
  const weakAreas = computeWeakAreas(userResults).slice(0, 8);
  const weakList = document.getElementById('weak-areas-list');
  weakList.innerHTML = weakAreas.length > 0
    ? weakAreas.map(t => `
        <div class="weak-area-item">
          <span class="weak-icon">📉</span>
          <div class="weak-meta">
            <div class="weak-topic">${t.topic}</div>
            <div class="weak-subject">${t.subject}</div>
          </div>
          <div class="weak-bar-track">
            <div class="weak-bar-fill" style="width:${t.accuracy}%"></div>
          </div>
          <div class="weak-score">${t.accuracy}%</div>
        </div>
      `).join('')
    : '<p style="color:var(--text-secondary)">✅ No major weak areas detected yet! Keep practicing.</p>';

  // Score trend chart
  renderTrendChart(userResults);

  // Topic accuracy table
  renderTopicTable(userResults);
}

function renderTrendChart(results) {
  const el = document.getElementById('score-trend-chart');
  const last10 = results.slice(-10);
  const maxScore = Math.max(...last10.map(r => r.score), 1);

  el.innerHTML = last10.map((r, i) => {
    const h = Math.round((r.score / maxScore) * 160);
    return `
      <div class="trend-bar-wrap">
        <div class="trend-bar" style="height:${h}px" data-score="${r.score}%"></div>
        <div class="trend-label">${r.date.split('/').slice(0,2).join('/')}</div>
      </div>
    `;
  }).join('') || '<p style="color:var(--text-muted);text-align:center">Not enough data.</p>';
}

function renderTopicTable(results) {
  const topicStats = {};
  results.forEach(r => {
    if (!r.topicStats) return;
    Object.values(r.topicStats).forEach(t => {
      const key = `${t.subject}||${t.topic}`;
      if (!topicStats[key]) topicStats[key] = { subject: t.subject, topic: t.topic, correct: 0, total: 0 };
      topicStats[key].correct += t.correct;
      topicStats[key].total   += t.total;
    });
  });

  const tbody = document.getElementById('topic-accuracy-tbody');
  const rows = Object.values(topicStats).map(t => {
    const acc = Math.round((t.correct / t.total) * 100);
    const statusClass = acc >= 70 ? 'strong' : acc >= 50 ? 'average' : 'weak';
    const statusText  = acc >= 70 ? '✅ Strong' : acc >= 50 ? '⚠️ Average' : '❌ Weak';
    return `
      <tr>
        <td>${t.topic}</td>
        <td>${t.subject}</td>
        <td>${t.total}</td>
        <td>${t.correct}</td>
        <td>${acc}%</td>
        <td><span class="topic-status-badge ${statusClass}">${statusText}</span></td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rows || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:30px">No topic data yet.</td></tr>';
}

/* =====================================================================
   14. SUBSCRIPTION
   ===================================================================== */
function subscribePlan(plan) {
  document.getElementById('payment-modal-title').textContent =
    plan === 'monthly' ? '💎 Subscribe to Pro Monthly' : '🏆 Subscribe to Pro Annual';
  document.getElementById('pay-amount-display').textContent =
    plan === 'monthly' ? 'Total: ₦2,500/month' : 'Total: ₦18,000/year (Save 40%!)';
  document.getElementById('pay-email').value = STATE.currentUser?.email || '';
  document.getElementById('pay-name').value  = STATE.currentUser?.name  || '';
  STATE._pendingPlan = plan;
  openModal('payment-modal');
}

function processPayment() {
  const name  = document.getElementById('pay-name').value.trim();
  const email = document.getElementById('pay-email').value.trim();
  const card  = document.getElementById('pay-card').value.trim();
  const expiry= document.getElementById('pay-expiry').value.trim();
  const cvv   = document.getElementById('pay-cvv').value.trim();

  if (!name || !email || !card || !expiry || !cvv) {
    showToast('Please fill all payment fields.', 'error'); return;
  }

  closeModal('payment-modal');
  // Simulate payment processing
  showToast('🔄 Processing payment...', 'info');
  setTimeout(() => {
    // Activate subscription
    if (STATE.currentUser) {
      STATE.currentUser.subscription = 'pro';
      document.getElementById('nav-badge').textContent = 'PRO';
      document.getElementById('nav-badge').className = 'user-badge pro';

      DB.subscriptions.push({
        userId: STATE.currentUser.id,
        plan: STATE._pendingPlan,
        startDate: new Date().toISOString(),
        status: 'active'
      });
    }
    showToast('🎉 Payment successful! Welcome to Pro!', 'success');
    setTimeout(() => showPage('dashboard'), 1500);
  }, 2000);
}

/* =====================================================================
   15. MODALS & TOAST
   ===================================================================== */
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* =====================================================================
   16. UTILITIES
   ===================================================================== */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/* =====================================================================
   17. SEED DEMO DATA (for demo user)
   ===================================================================== */
function seedDemoData() {
  const demoUser = DB.users[0];
  const examTypes = ['JAMB', 'WAEC', 'Aptitude'];

  for (let d = 8; d >= 1; d--) {
    const etype = examTypes[d % 3];
    const questions = shuffleArray(DB.questions.filter(q => q.examType === etype)).slice(0, 20);
    const answers = {};
    const topicStats = {};

    questions.forEach((q, i) => {
      // Simulate ~65% accuracy
      const correct = Math.random() < 0.65;
      answers[i] = correct ? q.answer : (q.answer + 1) % 4;
      const key = `${q.subject}||${q.topic}`;
      if (!topicStats[key]) topicStats[key] = { subject: q.subject, topic: q.topic, correct: 0, total: 0 };
      topicStats[key].total++;
      if (correct) topicStats[key].correct++;
    });

    const correct = Object.entries(answers).filter(([i, a]) => a === questions[i].answer).length;
    const score = Math.round((correct / questions.length) * 100);

    const date = new Date(Date.now() - d * 86400000).toLocaleDateString('en-NG');
    DB.results.push({
      id: 'demo_' + d,
      userId: demoUser.id,
      userName: demoUser.name,
      examType: etype,
      subjects: [...new Set(questions.map(q => q.subject))],
      questionCount: 20,
      correct,
      wrong: 20 - correct,
      skipped: 0,
      score,
      timeUsed: `${Math.floor(Math.random() * 20 + 15)}:${String(Math.floor(Math.random() * 60)).padStart(2,'0')}`,
      timeUsedSeconds: Math.floor(Math.random() * 1200 + 900),
      date,
      topicStats,
      questions,
      answers
    });
  }

  // Add demo user to leaderboard top positions
  DB.leaderboard.unshift({
    rank: 1,
    userId: demoUser.id,
    name: demoUser.name,
    score: 88,
    examType: 'JAMB',
    accuracy: 88,
    timeUsed: '22:45',
    date: new Date().toLocaleDateString('en-NG'),
    avatarColor: '#8b5cf6',
    avatarLetter: 'A'
  });
  DB.leaderboard.sort((a, b) => b.score - a.score);
  DB.leaderboard.forEach((e, i) => e.rank = i + 1);
}

/* =====================================================================
   18. INIT ON LOAD
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  seedDemoData();

  // Restore theme
  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem('tyk_theme') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  } catch (e) {}
  setTheme(savedTheme);

  // Restore user session or prefill demo account for easy accessibility
  try {
    const savedUserJson = localStorage.getItem('tyk_user');
    let userToLoad = null;
    if (savedUserJson) {
      try {
        const savedUser = JSON.parse(savedUserJson);
        userToLoad = DB.users.find(u => u.email.toLowerCase() === (savedUser.email || '').toLowerCase()) || savedUser;
      } catch (e) {}
    }
    if (!userToLoad) {
      userToLoad = DB.users[0]; // Default demo student
    }
    STATE.currentUser = userToLoad;
    if (!DB.users.find(u => u.id === userToLoad.id)) {
      DB.users.push(userToLoad);
    }
    initApp();
  } catch (err) {
    console.warn('Session restore note:', err);
  }

  // Card formatting for credit card input
  const cardInput = document.getElementById('pay-card');
  if (cardInput) {
    cardInput.addEventListener('input', function() {
      let val = this.value.replace(/\D/g, '').substring(0, 16);
      this.value = val.match(/.{1,4}/g)?.join(' ') || val;
    });
  }

  // Handle custom timer input
  const customMin = document.getElementById('custom-minutes');
  if (customMin) {
    customMin.addEventListener('input', function() {
      selectedDuration = parseInt(this.value) || 60;
      STATE.examConfig.durationMinutes = selectedDuration;
      updateSummary();
    });
  }

  // Close modals on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.add('hidden');
      }
    });
  });

  // Keyboard shortcuts for exam
  document.addEventListener('keydown', (e) => {
    if (!STATE.exam.active || STATE.exam.submitted) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigateQuestion(1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   navigateQuestion(-1);
    if (e.key === '1' || e.key === 'a') selectAnswer(0);
    if (e.key === '2' || e.key === 'b') selectAnswer(1);
    if (e.key === '3' || e.key === 'c') selectAnswer(2);
    if (e.key === '4' || e.key === 'd') selectAnswer(3);
    if (e.key === 'f' || e.key === 'F') toggleFlag();
  });

  console.log('🚀 TEST YOUR KNOWLEDGE — App Loaded Successfully');
  console.log('📚 Question Bank:', DB.questions.length, 'questions');
  console.log('🏆 Leaderboard:', DB.leaderboard.length, 'entries');
});
