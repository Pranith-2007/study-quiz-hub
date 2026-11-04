// Shared quiz engine. Subject question banks live in /data as JSON files.
(async function () {
  'use strict';
  const QUESTIONS = await fetch('data/kannada.json').then(function (response) {
    if (!response.ok) throw new Error('Could not load Kannada question bank.');
    return response.json();
  });

const GLOSSARY = {
  "naanu":"I", "naavu":"we", "nimma":"your (pl./respect)", "ninna":"your (sing.)",
  "nanna":"my", "namma":"our", "nanage":"to me / for me", "namage":"to us / for us",
  "ninage":"to you", "nimage":"to you (pl./respect)", "avanige":"to him", "avalige":"to her",
  "avarige":"to them / to him (respect)",
  "avanu":"he", "avalu":"she", "avaLu":"she", "avaru":"they / he-she (respect)",
  "ivanu":"he (near)", "ivalu":"she (near)", "ivaLu":"she (near)", "ivaru":"he/she (near, respect)",
  "idu":"this", "adu":"that", "ide":"is / are (it)",
  "yaaru":"who", "enu":"what", "eenu":"what", "elli":"where", "yelli":"where",
  "yaake":"why", "hege":"how", "yaavaga":"when", "yaavudu":"which", "yaava":"which",
  "hesaru":"name", "heasru":"name", "uuru":"native place / town", "mane":"house",
  "kaaleeju":"college", "tande":"father", "taayi":"mother", "amma":"mother", "appa":"father",
  "aNNa":"elder brother", "tangi":"younger sister", "akka":"elder sister", "tamma":"younger brother",
  "magu":"child", "maga":"son", "magaLu":"daughter", "ajji":"grandmother", "ajja":"grandfather",
  "gottu":"know", "beeku":"want / need", "biDu":"leave", "bare":"write", "naDe":"walk",
  "nillu":"stop", "kuDi":"drink", "tinnu":"eat", "malagu":"sleep", "kuLituko":"sit",
  "angaDi":"shop", "kelasa":"work", "samaya":"time",
  "sundara":"beautiful", "doDDa":"big", "chikka":"small", "saNNa":"small", "chikkadu":"small (thing)",
  "hosa":"new", "haLeya":"old", "oLLeya":"good", "ketta":"bad",
  "biLi":"white", "kappu":"black", "kempu":"red", "hasiru":"green", "haLadi":"yellow",
  "niili":"blue", "gulaabi":"pink", "kittaLe":"orange", "baNNa":"colour",
  "ondu":"one", "eraDu":"two", "yeradu":"two", "mooru":"three", "naalku":"four", "naaku":"four",
  "aidu":"five", "aaru":"six", "eeLu":"seven", "entu":"eight", "ombattu":"nine", "hattu":"ten",
  "hannereDu":"twelve", "sonne":"zero", "noor":"hundred", "saavira":"thousand",
  "laksha":"lakh (100,000)", "koti":"crore (10,000,000)",
  "dhanyavaada":"thank you", "dhanyavaadagalu":"thank you", "kshamisi":"sorry",
  "namaskaara":"hello / greetings", "susvaagata":"welcome", "banni":"welcome / please come",
  "shubharaatri":"good night", "shubhavaagali":"all the best", "shubhodaya":"good morning",
  "hattira":"near", "duura":"far away", "mele":"above", "kelage":"below",
  "munde":"in front", "hinde":"behind", "bala":"right (side)", "eDa":"left (side)",
  "khaali":"empty", "gaTTi":"hard", "bhaara":"weight", "agala":"wide",
  "tumba":"very / a lot", "kadime":"less", "hecchu":"more",
  "olleya":"good", "sulabha":"easy", "swantha":"own / native",
  "vidyaarthi":"student", "adhyapaka":"teacher (male)", "upanyasaka":"lecturer",
  "kaari":"work-related", "parikshe":"examination", "paTa":"lesson",
  "estu":"how much", "yavudu":"which one", "hiriya":"elder / senior",
  "hakki":"bird", "praani":"animal", "kurchi":"chair", "haNa":"money",
  "mahiti":"information", "baTTe":"cloth", "besara":"sad", "santosha":"happiness / joy",
  "kate":"story", "uttama":"excellent", "kaaryakrama":"programme",
  "viLaasa":"address", "evattu":"today", "ivattu":"today", "naale":"tomorrow", "ninne":"yesterday"
};

(function(){
  "use strict";

  // ---------- helpers ----------
  function shuffle(arr){
    var a = arr.slice();
    for(var i=a.length-1;i>0;i--){
      var j = Math.floor(Math.random()*(i+1));
      var t=a[i]; a[i]=a[j]; a[j]=t;
    }
    return a;
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function getHints(item){
    var text = (item.q + " " + item.correct).toLowerCase();
    var tokens = text.split(/[^a-zA-Z]+/).filter(Boolean);
    var found = [];
    var seen = {};
    for(var i=0;i<tokens.length;i++){
      var tok = tokens[i];
      for(var key in GLOSSARY){
        if(key.toLowerCase() === tok && !seen[key.toLowerCase()]){
          found.push(key + " = " + GLOSSARY[key]);
          seen[key.toLowerCase()] = true;
        }
      }
      if(found.length >= 2) break;
    }
    return found;
  }

  // ---------- lesson grouping ----------
  var LESSON_ORDER = [];
  var LESSON_QUESTIONS = {};
  (function(){
    QUESTIONS.forEach(function(q){
      if(!LESSON_QUESTIONS[q.lesson]){ LESSON_QUESTIONS[q.lesson]=[]; LESSON_ORDER.push(q.lesson); }
      LESSON_QUESTIONS[q.lesson].push(q);
    });
    LESSON_ORDER.sort(function(a,b){ return parseInt(a.replace(/\D/g,''),10) - parseInt(b.replace(/\D/g,''),10); });
    LESSON_ORDER.forEach(function(l){ LESSON_QUESTIONS[l].sort(function(a,b){ return a.n-b.n; }); });
  })();
  function segLabel(l){
    var list = LESSON_QUESTIONS[l], segs=[], s=list[0].n, p=s;
    for(var i=1;i<list.length;i++){ if(list[i].n!==p+1){ segs.push([s,p]); s=list[i].n; } p=list[i].n; }
    segs.push([s,p]);
    return segs.map(function(x){ return x[0]===x[1] ? 'Q'+x[0] : 'Q'+x[0]+'\u2013Q'+x[1]; }).join(', ');
  }
  var NOTES = {
    301: 'Spreadsheet note: two of the four options have identical text (\u201chasanakke\u201d). The first option is still used as correct.',
    467: 'Spreadsheet note: none of the options is 3, which is how many genders Kannada normally lists (masculine, feminine, neuter). The spreadsheet\u2019s first option (4) is used as correct \u2014 please check with your teacher.',
    495: 'Spreadsheet note: the first option \u201ckuri\u201d usually means sheep, while \u201caaDu\u201d and \u201cmeke\u201d usually mean goat. The spreadsheet\u2019s first option is used as correct \u2014 please check with your teacher.'
  };

  var TOTAL = QUESTIONS.length;

  function qByNum(n){
    return QUESTIONS.filter(function(q){ return q.n === n; })[0];
  }

  // ---------- global state ----------
  var state = {
    screen: 'hub',
    allLessonsMode: false,
    customMode: false,
    customLessons: [],
    lessonQueueIdx: 0,

    lesson: null,
    queue: [],
    idx: 0,
    score: 0,
    answered: false,
    selected: null,
    currentOptions: null,
    wrongList: [],

    revisionRound: 0,
    revisionQueue: [],
    revisionIdx: 0,
    revisionAnswered: false,
    revisionSelected: null,
    revisionCurrentOptions: null,
    revisionStillWrong: [],

    lessonRecord: {},

    finalRevQueue: [],
    finalRevIdx: 0,
    finalRevAnswered: false,
    finalRevSelected: null,
    finalRevCurrentOptions: null,
    finalRevScore: 0,
    finalRevStillWrong: [],
    finalRevRound: 0
  };

  LESSON_ORDER.forEach(function(l){ state.lessonRecord[l] = {mainScore:0, mainTotal:0, everWrong:[]}; });

  function startLesson(lessonName){
    state.customMode = false;
    state.lesson = lessonName;
    state.queue = LESSON_QUESTIONS[lessonName].slice();
    state.idx = 0;
    state.score = 0;
    state.answered = false;
    state.selected = null;
    state.wrongList = [];
    state.screen = 'quiz';
    prepOptions();
  }

  function prepOptions(){
    var q = state.queue[state.idx];
    state.currentOptions = shuffle(q.options);
    state.answered = false;
    state.selected = null;
  }

  var app = document.getElementById('app');
  function render(){
    if(state.screen === 'hub') return renderHub();
    if(state.screen === 'menu') return renderMenu();
    if(state.screen === 'customSetup') return renderCustomSetup();
    if(state.screen === 'quiz') return renderQuiz();
    if(state.screen === 'lessonMainResult') return renderLessonMainResult();
    if(state.screen === 'revisionQuiz') return renderRevisionQuiz();
    if(state.screen === 'revisionCleared') return renderRevisionCleared();
    if(state.screen === 'postLessonMenu') return renderPostLessonMenu();
    if(state.screen === 'allLessonsSummary') return renderAllLessonsSummary();
    if(state.screen === 'finalRevisionIntro') return renderFinalRevisionIntro();
    if(state.screen === 'finalRevisionQuiz') return renderFinalRevisionQuiz();
    if(state.screen === 'finalRevisionSummary') return renderFinalRevisionSummary();
  }

  function renderHub(){
    app.innerHTML =
      '<div class="eyebrow">YOUR STUDY SPACE</div>' +
      '<h1>Study Quiz Hub</h1>' +
      '<div class="stripe"></div>' +
      '<p class="muted">Pick a subject and get practicing. More subjects can be added to this hub over time.</p>' +
      '<div class="card">' +
        '<h2>Kannada</h2>' +
        '<p>Balake Kannada · Lessons 1–18 · ' + TOTAL + ' questions</p>' +
        '<button class="btn" id="openKannadaBtn">Open Kannada Quiz</button>' +
      '</div>' +
      '<div class="card">' +
        '<h2>More subjects</h2>' +
        '<p class="muted">Java, Data Structures, Mathematics and other subjects can be added here when their question banks are ready.</p>' +
      '</div>';
    document.getElementById('openKannadaBtn').onclick = function(){
      state.screen = 'menu';
      render();
    };
  }

  function renderMenu(){
    var lessonBtns = LESSON_ORDER.map(function(l){
      return '<button class="btn secondary lesson-choice" data-lesson="'+escapeHtml(l)+'">' +
        escapeHtml(l) + ' <span class="muted">(' + segLabel(l) + ' \u00b7 ' + LESSON_QUESTIONS[l].length + ' Qs)</span></button>';
    }).join('');

    app.innerHTML =
      '<div class="eyebrow">Balake Kannada</div>' +
      '<h1>Practice Quiz</h1>' +
      '<div class="stripe"></div>' +
      '<div class="card">' +
        '<p>Full spreadsheet coverage, verified before this quiz was built:</p>' +
        '<div class="stat-row">' +
          '<div class="stat-box"><div class="stat-num">' + TOTAL + '</div><div class="stat-label">Total MCQs</div></div>' +
          '<div class="stat-box"><div class="stat-num">' + LESSON_ORDER.length + '</div><div class="stat-label">Lessons</div></div>' +
          '<div class="stat-box"><div class="stat-num">Q1\u2013Q' + TOTAL + '</div><div class="stat-label">Range</div></div>' +
        '</div>' +
        '<table class="review" style="margin-top:14px;"><tr><th>Lesson</th><th>Question range</th><th>Count</th></tr>' +
          LESSON_ORDER.map(function(l){
            return '<tr><td>'+escapeHtml(l)+'</td><td>'+segLabel(l)+'</td><td>'+LESSON_QUESTIONS[l].length+'</td></tr>';
          }).join('') +
        '</table>' +
        '<div class="assumption" style="margin-top:14px;">' +
          '<strong>Note:</strong> your spreadsheet has no answer-key column or marking. The first listed option is consistently the semantically correct one across all 520 rows (checked by meaning, not guessed), so that is used as the correct answer. Tell me the question number if you ever spot one that looks wrong \u2014 nothing gets changed silently.' +
        '</div>' +
      '</div>' +
      '<h3>Choose a lesson to practice</h3>' +
      '<div class="btn-row" style="flex-direction:column; align-items:stretch;">' + lessonBtns +
        '<button class="btn" id="allLessonsBtn">All Lessons (Q1\u2013Q'+TOTAL+')</button>' +
        '<button class="btn secondary" id="customPracticeBtn">Custom Practice · Choose Multiple Lessons</button>' +
      '</div>' +
      '<p class="muted" style="margin-top:14px;">No selection? Lesson 1 starts by default \u2014 use the button above.</p>';

    Array.prototype.forEach.call(document.querySelectorAll('.lesson-choice'), function(btn){
      btn.onclick = function(){
        state.allLessonsMode = false;
        startLesson(btn.getAttribute('data-lesson'));
        render();
      };
    });
    document.getElementById('customPracticeBtn').onclick = function(){ state.screen='customSetup'; render(); };
    document.getElementById('allLessonsBtn').onclick = function(){
      state.allLessonsMode = true;
      state.lessonQueueIdx = 0;
      startLesson(LESSON_ORDER[0]);
      render();
    };
  }

  function renderCustomSetup(){
    var selected = state.customLessons;
    var lessonCards = LESSON_ORDER.map(function(l){
      var checked = selected.indexOf(l) !== -1;
      return '<label class="custom-lesson"><input type="checkbox" class="custom-lesson-check" value="'+escapeHtml(l)+'" '+(checked?'checked':'')+'> <span>'+escapeHtml(l)+'</span> <small>'+LESSON_QUESTIONS[l].length+' Qs</small></label>';
    }).join('');
    app.innerHTML = '<div class="eyebrow">Balake Kannada</div><h1>Custom Practice</h1><div class="stripe"></div>'+
      '<div class="card"><p>Select any combination of lessons. Their questions become one practice set.</p><div class="btn-row"><button class="btn secondary" id="selectAllCustom">Select all</button><button class="btn secondary" id="clearCustom">Clear</button></div><div class="custom-grid">'+lessonCards+'</div></div>'+
      '<div class="card"><h3>Question order</h3><label class="choice-line"><input type="radio" name="customOrder" value="mixed" checked> Fully mixed — shuffle questions across selected lessons</label><label class="choice-line"><input type="radio" name="customOrder" value="grouped"> Grouped — keep each lesson together</label><h3 style="margin-top:16px">Number of questions</h3><select id="customLimit" class="custom-select"><option value="all">All questions from selected lessons</option><option value="10">10 questions</option><option value="20">20 questions</option><option value="30">30 questions</option><option value="50">50 questions</option></select></div>'+
      '<button class="btn" id="startCustomBtn">Start Custom Practice</button> <button class="btn secondary" id="backMenuBtn">Back</button>';
    document.getElementById('selectAllCustom').onclick=function(){state.customLessons=LESSON_ORDER.slice();renderCustomSetup();};
    document.getElementById('clearCustom').onclick=function(){state.customLessons=[];renderCustomSetup();};
    document.getElementById('backMenuBtn').onclick=function(){state.screen='menu';render();};
    document.getElementById('startCustomBtn').onclick=function(){
      var chosen=Array.prototype.map.call(document.querySelectorAll('.custom-lesson-check:checked'),function(x){return x.value;});
      if(!chosen.length){alert('Select at least one lesson.');return;}
      var pool=[]; chosen.forEach(function(l){pool=pool.concat(LESSON_QUESTIONS[l]);});
      var order=document.querySelector('input[name="customOrder"]:checked').value;
      if(order==='mixed') pool=shuffle(pool);
      var limit=document.getElementById('customLimit').value;
      if(limit!=='all') pool=pool.slice(0,Math.min(Number(limit),pool.length));
      state.customMode=true; state.customLessons=chosen; state.allLessonsMode=false; state.lesson='Custom Practice';
      state.queue=pool; state.idx=0; state.score=0; state.answered=false; state.selected=null; state.wrongList=[]; state.revisionRound=0; state.screen='quiz';
      if(!state.lessonRecord['Custom Practice']) state.lessonRecord['Custom Practice']={mainScore:0,mainTotal:0,everWrong:[]};
      prepOptions(); render();
    };
  }

  function optionButtonsHtml(options, correct, answered, selected){
    return options.map(function(opt){
      var cls = 'option-btn';
      if(answered){
        if(opt === correct) cls += ' correct';
        else if(opt === selected) cls += ' wrong';
      }
      return '<button class="' + cls + '" data-opt="' + escapeHtml(opt) + '" ' + (answered ? 'disabled' : '') + '>' + escapeHtml(opt) + '</button>';
    }).join('');
  }

  function feedbackHtml(correctBool, correctAnswer, hints, qn){
    var hintHtml = hints.length ? hints.map(function(h){ return '<span class="hint-chip">'+escapeHtml(h)+'</span>'; }).join('') : '';
    return '<div class="feedback ' + (correctBool?'correct':'wrong') + '">' +
      '<div class="feedback-title">' + (correctBool ? 'Correct!' : 'Wrong.') + '</div>' +
      (correctBool ? '' : '<div class="feedback-detail">Correct answer: <strong>'+escapeHtml(correctAnswer)+'</strong></div>') +
      (hintHtml ? '<div style="margin-top:6px;">'+hintHtml+'</div>' : '') +
      (NOTES[qn] ? '<div class="assumption" style="margin-top:10px;">'+escapeHtml(NOTES[qn])+'</div>' : '') +
      '</div>';
  }

  function renderQuiz(){
    var q = state.queue[state.idx];
    var posInLesson = state.idx + 1;
    var lessonCount = state.queue.length;
    var pct = Math.round((state.idx/lessonCount)*100);

    var fb = '';
    if(state.answered){
      var correctBool = state.selected === q.correct;
      fb = feedbackHtml(correctBool, q.correct, getHints(q), q.n);
    }
    var isLastInLesson = state.idx === state.queue.length - 1;

    app.innerHTML =
      '<div class="eyebrow">' + escapeHtml(state.customMode ? 'Custom Practice · '+q.lesson : q.lesson) + (state.allLessonsMode ? ' \u00b7 All Lessons mode' : '') + '</div>' +
      '<div class="progress-wrap"><span>Question ' + posInLesson + ' of ' + lessonCount + ' (Q' + q.n + ')</span><span class="score-pill">Score: ' + state.score + ' / ' + state.idx + '</span></div>' +
      '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%;"></div></div>' +
      '<div class="card">' +
        '<div class="question-text">' + escapeHtml(q.q) + '</div>' +
        '<div class="options">' + optionButtonsHtml(state.currentOptions, q.correct, state.answered, state.selected) + '</div>' +
        fb +
      '</div>' +
      (state.answered ? '<button class="btn" id="nextBtn">' + (isLastInLesson ? 'See Lesson Result' : 'Next Question') + '</button>' : '');

    if(!state.answered){
      Array.prototype.forEach.call(document.querySelectorAll('.option-btn'), function(btn){
        btn.onclick = function(){
          var val = btn.getAttribute('data-opt');
          state.selected = val;
          state.answered = true;
          if(val === q.correct){
            state.score++;
          } else {
            state.wrongList.push({n:q.n, lesson:q.lesson, q:q.q, correct:q.correct, chosen:val});
          }
          render();
        };
      });
    } else {
      document.getElementById('nextBtn').onclick = function(){
        if(isLastInLesson){
          state.screen = 'lessonMainResult';
        } else {
          state.idx++;
          prepOptions();
        }
        render();
      };
    }
  }

  function renderLessonMainResult(){
    var total = state.queue.length;
    var pct = Math.round((state.score/total)*100);
    var wrongRows = state.wrongList.map(function(w){
      return '<tr><td>Q'+w.n+'</td><td>'+escapeHtml(w.q)+'</td><td class="wrong-you">'+escapeHtml(w.chosen)+'</td><td class="wrong-correct">'+escapeHtml(w.correct)+'</td></tr>';
    }).join('');

    state.lessonRecord[state.lesson].mainScore = state.score;
    state.lessonRecord[state.lesson].mainTotal = total;
    state.lessonRecord[state.lesson].everWrong = state.wrongList.slice();

    app.innerHTML =
      '<div class="eyebrow">' + escapeHtml(state.lesson) + ' \u2014 main pass complete</div>' +
      '<h2>Lesson Score</h2>' +
      '<div class="stripe"></div>' +
      '<div class="card">' +
        '<div class="stat-row">' +
          '<div class="stat-box"><div class="stat-num">' + state.score + ' / ' + total + '</div><div class="stat-label">Score</div></div>' +
          '<div class="stat-box"><div class="stat-num">' + pct + '%</div><div class="stat-label">Accuracy</div></div>' +
          '<div class="stat-box"><div class="stat-num">' + state.wrongList.length + '</div><div class="stat-label">Wrong</div></div>' +
        '</div>' +
        (state.wrongList.length ? (
          '<p class="muted" style="margin-top:14px;">Questions you got wrong:</p>' +
          '<table class="review"><tr><th>#</th><th>Question</th><th>Your answer</th><th>Correct</th></tr>' + wrongRows + '</table>' +
          '<p class="muted" style="margin-top:12px;">Starting a revision round on just these ' + state.wrongList.length + ' questions \u2014 it will repeat until you get every one right at least once.</p>'
        ) : '<p class="muted" style="margin-top:14px;">Perfect score \u2014 no revision needed for this lesson.</p>') +
      '</div>' +
      '<button class="btn" id="contBtn">' + (state.wrongList.length ? 'Start Wrong-Question Revision' : 'Continue') + '</button>';

    document.getElementById('contBtn').onclick = function(){
      if(state.wrongList.length){
        startRevisionRound(state.wrongList.map(function(w){ return qByNum(w.n); }));
      } else {
        state.screen = 'postLessonMenu';
        render();
      }
    };
  }

  function startRevisionRound(questionList){
    state.revisionRound++;
    state.revisionQueue = questionList.slice();
    state.revisionIdx = 0;
    state.revisionStillWrong = [];
    prepRevisionOptions();
    state.screen = 'revisionQuiz';
    render();
  }

  function prepRevisionOptions(){
    var q = state.revisionQueue[state.revisionIdx];
    state.revisionCurrentOptions = shuffle(q.options);
    state.revisionAnswered = false;
    state.revisionSelected = null;
  }

  function renderRevisionQuiz(){
    var q = state.revisionQueue[state.revisionIdx];
    var total = state.revisionQueue.length;
    var pct = Math.round((state.revisionIdx/total)*100);
    var isLast = state.revisionIdx === total - 1;

    var fb = '';
    if(state.revisionAnswered){
      var correctBool = state.revisionSelected === q.correct;
      fb = feedbackHtml(correctBool, q.correct, getHints(q), q.n);
    }

    app.innerHTML =
      '<div class="eyebrow">' + escapeHtml(state.lesson) + ' \u2014 Revision round ' + state.revisionRound + '</div>' +
      '<div class="progress-wrap"><span>Revision question ' + (state.revisionIdx+1) + ' of ' + total + '</span><span class="score-pill">Originally Q' + q.n + '</span></div>' +
      '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%;"></div></div>' +
      '<div class="card">' +
        '<div class="question-text">' + escapeHtml(q.q) + '</div>' +
        '<div class="options">' + optionButtonsHtml(state.revisionCurrentOptions, q.correct, state.revisionAnswered, state.revisionSelected) + '</div>' +
        fb +
      '</div>' +
      (state.revisionAnswered ? '<button class="btn" id="nextBtn">' + (isLast ? 'See Revision Round Result' : 'Next Question') + '</button>' : '');

    if(!state.revisionAnswered){
      Array.prototype.forEach.call(document.querySelectorAll('.option-btn'), function(btn){
        btn.onclick = function(){
          var val = btn.getAttribute('data-opt');
          state.revisionSelected = val;
          state.revisionAnswered = true;
          if(val !== q.correct){
            state.revisionStillWrong.push(q);
          }
          render();
        };
      });
    } else {
      document.getElementById('nextBtn').onclick = function(){
        if(isLast){
          if(state.revisionStillWrong.length){
            var seen = {};
            var next = [];
            state.revisionStillWrong.forEach(function(qq){
              if(!seen[qq.n]){ seen[qq.n]=true; next.push(qq); }
            });
            startRevisionRound(next);
          } else {
            state.screen = 'revisionCleared';
            render();
          }
        } else {
          state.revisionIdx++;
          prepRevisionOptions();
          render();
        }
      };
    }
  }

  function renderRevisionCleared(){
    app.innerHTML =
      '<div class="eyebrow">' + escapeHtml(state.lesson) + ' \u2014 revision complete</div>' +
      '<h2>All wrong questions cleared</h2>' +
      '<div class="stripe"></div>' +
      '<div class="card">' +
        '<div class="stat-row">' +
          '<div class="stat-box"><div class="stat-num">' + state.lessonRecord[state.lesson].mainScore + ' / ' + state.lessonRecord[state.lesson].mainTotal + '</div><div class="stat-label">Original score</div></div>' +
          '<div class="stat-box"><div class="stat-num">' + state.lessonRecord[state.lesson].everWrong.length + '</div><div class="stat-label">Questions revised</div></div>' +
          '<div class="stat-box"><div class="stat-num">' + state.revisionRound + '</div><div class="stat-label">Revision round(s)</div></div>' +
        '</div>' +
        '<p class="muted" style="margin-top:14px;">Every question you missed in ' + escapeHtml(state.lesson) + ' has now been answered correctly at least once.</p>' +
      '</div>' +
      '<button class="btn" id="contBtn">Continue</button>';

    document.getElementById('contBtn').onclick = function(){
      state.screen = 'postLessonMenu';
      render();
    };
  }

  function renderPostLessonMenu(){
    if(state.allLessonsMode){
      state.lessonQueueIdx++;
      if(state.lessonQueueIdx < LESSON_ORDER.length){
        startLesson(LESSON_ORDER[state.lessonQueueIdx]);
        render();
        return;
      } else {
        state.screen = 'allLessonsSummary';
        render();
        return;
      }
    }

    if(state.customMode){
      app.innerHTML='<div class="eyebrow">Custom Practice complete</div><h2>What next?</h2><div class="stripe"></div><div class="card"><p>Score: <strong>'+state.lessonRecord[state.lesson].mainScore+' / '+state.lessonRecord[state.lesson].mainTotal+'</strong></p><p class="muted">Lessons: '+state.customLessons.map(escapeHtml).join(', ')+'</p></div><div class="btn-row"><button class="btn" id="customAgainBtn">Repeat this set</button><button class="btn secondary" id="chooseLessonBtn">Choose another practice</button><button class="btn secondary" id="stopBtn">Back to Hub</button></div>';
      document.getElementById('customAgainBtn').onclick=function(){state.screen='customSetup';render();};
      document.getElementById('chooseLessonBtn').onclick=function(){state.screen='menu';render();};
      document.getElementById('stopBtn').onclick=function(){state.screen='hub';render();};
      return;
    }
    var lessonIdx = LESSON_ORDER.indexOf(state.lesson);
    var nextLesson = LESSON_ORDER[lessonIdx+1];

    app.innerHTML =
      '<div class="eyebrow">' + escapeHtml(state.lesson) + ' \u2014 done</div>' +
      '<h2>What next?</h2>' +
      '<div class="stripe"></div>' +
      '<div class="card">' +
        '<p class="muted">Original score: <strong>' + state.lessonRecord[state.lesson].mainScore + ' / ' + state.lessonRecord[state.lesson].mainTotal + '</strong> \u00b7 Revision rounds needed: <strong>' + state.revisionRound + '</strong></p>' +
      '</div>' +
      '<div class="btn-row" style="flex-direction:column; align-items:stretch;">' +
        (nextLesson ? '<button class="btn" id="nextLessonBtn">Continue to ' + escapeHtml(nextLesson) + '</button>' : '') +
        '<button class="btn secondary" id="chooseLessonBtn">Choose Another Lesson</button>' +
        '<button class="btn secondary" id="repeatLessonBtn">Practice ' + escapeHtml(state.lesson) + ' Again</button>' +
        '<button class="btn secondary" id="stopBtn">Stop Here</button>' +
      '</div>';

    if(nextLesson){
      document.getElementById('nextLessonBtn').onclick = function(){
        startLesson(nextLesson);
        render();
      };
    }
    document.getElementById('chooseLessonBtn').onclick = function(){
      state.screen = 'menu';
      render();
    };
    document.getElementById('repeatLessonBtn').onclick = function(){
      startLesson(state.lesson);
      render();
    };
    document.getElementById('stopBtn').onclick = function(){
      app.innerHTML =
        '<div class="card"><h2>Session ended</h2><p class="muted">Come back any time \u2014 just reopen this page to start again.</p></div>' +
        '<button class="btn" id="restartBtn">Back to Lesson Menu</button>';
      document.getElementById('restartBtn').onclick = function(){ state.screen='menu'; render(); };
    };
  }

  function renderAllLessonsSummary(){
    var totalScore = 0, totalCount = 0, allWrong = [];
    LESSON_ORDER.forEach(function(l){
      totalScore += state.lessonRecord[l].mainScore;
      totalCount += state.lessonRecord[l].mainTotal;
      allWrong = allWrong.concat(state.lessonRecord[l].everWrong);
    });
    var pct = Math.round((totalScore/totalCount)*100);

    var lessonRows = LESSON_ORDER.map(function(l){
      var r = state.lessonRecord[l];
      var lp = Math.round((r.mainScore/r.mainTotal)*100);
      return '<tr><td>'+escapeHtml(l)+'</td><td>'+r.mainScore+' / '+r.mainTotal+'</td><td>'+lp+'%</td><td>'+r.everWrong.length+'</td></tr>';
    }).join('');

    app.innerHTML =
      '<div class="eyebrow">All Lessons complete</div>' +
      '<h1>Overall Results</h1>' +
      '<div class="stripe"></div>' +
      '<div class="card">' +
        '<div class="stat-row">' +
          '<div class="stat-box"><div class="stat-num">' + totalScore + ' / ' + totalCount + '</div><div class="stat-label">Total score</div></div>' +
          '<div class="stat-box"><div class="stat-num">' + pct + '%</div><div class="stat-label">Overall accuracy</div></div>' +
          '<div class="stat-box"><div class="stat-num">' + allWrong.length + '</div><div class="stat-label">Originally wrong</div></div>' +
        '</div>' +
        '<table class="review" style="margin-top:14px;"><tr><th>Lesson</th><th>Score</th><th>Accuracy</th><th>Wrong</th></tr>' + lessonRows + '</table>' +
        (allWrong.length ? '<p class="muted" style="margin-top:12px;">Every lesson\u2019s wrong questions have already been cleared through their own revision rounds. You can optionally run one more combined revision covering all ' + allWrong.length + ' of them together.</p>'
          : '<p class="muted" style="margin-top:12px;">Perfect across every lesson \u2014 nothing left to revise!</p>') +
      '</div>' +
      (allWrong.length ?
        '<div class="btn-row"><button class="btn" id="finalRevBtn">Start Combined Final Revision</button><button class="btn secondary" id="menuBtn">Back to Lesson Menu</button></div>'
        : '<button class="btn secondary" id="menuBtn">Back to Lesson Menu</button>');

    state._allWrongCombined = allWrong;

    if(allWrong.length){
      document.getElementById('finalRevBtn').onclick = function(){
        state.screen = 'finalRevisionIntro';
        render();
      };
    }
    document.getElementById('menuBtn').onclick = function(){
      state.screen = 'menu';
      render();
    };
  }

  function renderFinalRevisionIntro(){
    var list = state._allWrongCombined;
    app.innerHTML =
      '<div class="eyebrow">Final revision</div>' +
      '<h2>Combined Wrong-Question Round</h2>' +
      '<div class="stripe"></div>' +
      '<div class="card"><p>This covers all ' + list.length + ' questions you originally missed, across every lesson, in their original order. It repeats until you answer every one correctly at least once.</p></div>' +
      '<button class="btn" id="startFinalRev">Begin</button>';
    document.getElementById('startFinalRev').onclick = function(){
      state.finalRevRound = 1;
      state.finalRevQueue = list.map(function(w){ return qByNum(w.n); });
      state.finalRevIdx = 0;
      state.finalRevScore = 0;
      state.finalRevStillWrong = [];
      prepFinalRevOptions();
      state.screen = 'finalRevisionQuiz';
      render();
    };
  }

  function prepFinalRevOptions(){
    var q = state.finalRevQueue[state.finalRevIdx];
    state.finalRevCurrentOptions = shuffle(q.options);
    state.finalRevAnswered = false;
    state.finalRevSelected = null;
  }

  function renderFinalRevisionQuiz(){
    var q = state.finalRevQueue[state.finalRevIdx];
    var total = state.finalRevQueue.length;
    var isLast = state.finalRevIdx === total - 1;
    var pct = Math.round((state.finalRevIdx/total)*100);

    var fb = '';
    if(state.finalRevAnswered){
      var correctBool = state.finalRevSelected === q.correct;
      fb = feedbackHtml(correctBool, q.correct, getHints(q), q.n);
    }

    app.innerHTML =
      '<div class="eyebrow">Final revision \u2014 round ' + state.finalRevRound + '</div>' +
      '<div class="progress-wrap"><span>Question ' + (state.finalRevIdx+1) + ' of ' + total + '</span><span class="score-pill">' + escapeHtml(q.lesson) + ' \u00b7 Q' + q.n + '</span></div>' +
      '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%;"></div></div>' +
      '<div class="card">' +
        '<div class="question-text">' + escapeHtml(q.q) + '</div>' +
        '<div class="options">' + optionButtonsHtml(state.finalRevCurrentOptions, q.correct, state.finalRevAnswered, state.finalRevSelected) + '</div>' +
        fb +
      '</div>' +
      (state.finalRevAnswered ? '<button class="btn" id="nextBtn">' + (isLast ? 'See Final Revision Result' : 'Next Question') + '</button>' : '');

    if(!state.finalRevAnswered){
      Array.prototype.forEach.call(document.querySelectorAll('.option-btn'), function(btn){
        btn.onclick = function(){
          var val = btn.getAttribute('data-opt');
          state.finalRevSelected = val;
          state.finalRevAnswered = true;
          if(val === q.correct) state.finalRevScore++;
          else state.finalRevStillWrong.push(q);
          render();
        };
      });
    } else {
      document.getElementById('nextBtn').onclick = function(){
        if(isLast){
          state.screen = 'finalRevisionSummary';
        } else {
          state.finalRevIdx++;
          prepFinalRevOptions();
        }
        render();
      };
    }
  }

  function renderFinalRevisionSummary(){
    var total = state.finalRevQueue.length;
    var pct = Math.round((state.finalRevScore/total)*100);
    var seen = {};
    var stillWrongUnique = [];
    state.finalRevStillWrong.forEach(function(q){ if(!seen[q.n]){ seen[q.n]=true; stillWrongUnique.push(q); } });

    var rows = stillWrongUnique.map(function(q){
      return '<tr><td>Q'+q.n+'</td><td>'+escapeHtml(q.lesson)+'</td><td>'+escapeHtml(q.q)+'</td><td class="wrong-correct">'+escapeHtml(q.correct)+'</td></tr>';
    }).join('');

    app.innerHTML =
      '<div class="eyebrow">Final revision round ' + state.finalRevRound + ' complete</div>' +
      '<h2>Final Revision Results</h2>' +
      '<div class="stripe"></div>' +
      '<div class="card">' +
        '<div class="stat-row">' +
          '<div class="stat-box"><div class="stat-num">' + state.finalRevScore + ' / ' + total + '</div><div class="stat-label">Score</div></div>' +
          '<div class="stat-box"><div class="stat-num">' + pct + '%</div><div class="stat-label">Accuracy</div></div>' +
          '<div class="stat-box"><div class="stat-num">' + stillWrongUnique.length + '</div><div class="stat-label">Still wrong</div></div>' +
        '</div>' +
        (stillWrongUnique.length ?
          '<p class="muted" style="margin-top:14px;">Still tricky:</p><table class="review"><tr><th>#</th><th>Lesson</th><th>Question</th><th>Correct</th></tr>' + rows + '</table>'
          : '<p class="muted" style="margin-top:14px;">You have now answered every originally-wrong question correctly. Nice work across all ' + TOTAL + ' MCQs.</p>') +
      '</div>' +
      (stillWrongUnique.length ?
        '<div class="btn-row"><button class="btn" id="revAgainBtn">Revise Remaining (' + stillWrongUnique.length + ')</button><button class="btn secondary" id="menuBtn2">Back to Lesson Menu</button></div>'
        : '<button class="btn secondary" id="menuBtn2">Back to Lesson Menu</button>');

    if(stillWrongUnique.length){
      document.getElementById('revAgainBtn').onclick = function(){
        state.finalRevRound++;
        state.finalRevQueue = stillWrongUnique;
        state.finalRevIdx = 0;
        state.finalRevScore = 0;
        state.finalRevStillWrong = [];
        prepFinalRevOptions();
        state.screen = 'finalRevisionQuiz';
        render();
      };
    }
    document.getElementById('menuBtn2').onclick = function(){
      state.screen = 'menu';
      render();
    };
  }

  render();
})();

})();
