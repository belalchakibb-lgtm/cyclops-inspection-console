(function () {
  'use strict';

  const METHOD_KEYS = ['PT', 'MT', 'UT', 'RT', 'VT', 'APE', 'APL', 'APVG'];
  const METHOD_NAMES = {
    PT: ['Penetrant Testing', 'Ressuage'], MT: ['Magnetic Testing', 'Magnétoscopie'],
    UT: ['Ultrasonic Testing', 'Contrôle ultrasonore'], RT: ['Radiographic Testing', 'Radiographie'],
    VT: ['Visual Testing', 'Contrôle visuel'], APE: ['Electrical Equipment', 'Équipements électriques'],
    APL: ['Lifting Equipment', 'Appareils de levage'], APVG: ['Pressure Equipment', 'Appareils à pression']
  };
  const LEVELS = {
    beginner: ['Beginner', 'Débutant'], normal: ['Normal', 'Intermédiaire'], master: ['Master', 'Expert']
  };
  const $ = (selector) => document.querySelector(selector);
  const isFrench = () => typeof lang !== 'undefined' && lang === 'fr';
  const L = (en, fr) => isFrench() ? fr : en;
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const shuffle = (items) => {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const localizedProcedure = (key) => {
    const procedure = window.CYPROC[key];
    return isFrench() && procedure.fr ? procedure.fr : procedure;
  };
  const equipmentAt = (key, index) => {
    const item = window.CYPROC[key].equipment[index];
    return window.CY3 && window.CY3.equipmentText ? window.CY3.equipmentText(key, index, item) : item;
  };
  function answerPools() {
    const pools = { step: [], equipment: [], safety: [], code: [], acceptance: [] };
    METHOD_KEYS.forEach((key) => {
      const procedure = window.CYPROC[key];
      const data = localizedProcedure(key);
      data.steps.forEach((step) => step[1].forEach((fact) => pools.step.push(fact)));
      (procedure.equipment || []).forEach((item, index) => {
        const translated = equipmentAt(key, index);
        pools.equipment.push(translated[0] + ': ' + translated[1]);
      });
      (data.hse || procedure.hse || data.wn || procedure.wn || []).forEach((fact) => pools.safety.push(fact));
      procedure.codes.forEach((code, index) => {
        const description = data.codes && data.codes[index] ? data.codes[index][1] : code[1];
        pools.code.push(code[0] + ': ' + description);
      });
      (data.acc || procedure.acc || []).forEach((item) => pools.acceptance.push(item[0] + ': ' + item[1]));
    });
    return pools;
  }
  function questionText(level, key, type, label) {
    const method = METHOD_NAMES[key][isFrench() ? 1 : 0];
    if (type === 'step') {
      if (level === 'beginner') return L('Which action belongs to "' + label + '" in ' + method + '?', 'Quelle action correspond à « ' + label + ' » en ' + method + ' ?');
      if (level === 'normal') return L('During ' + method + ', what should be done at the "' + label + '" stage?', 'Pendant le ' + method + ', que faut-il faire à l’étape « ' + label + ' » ?');
      return L('A technician is performing "' + label + '" for ' + method + '. Which documented action is correct?', 'Un technicien effectue « ' + label + ' » en ' + method + '. Quelle action documentée est correcte ?');
    }
    if (type === 'equipment') {
      if (level === 'beginner') return L('What does this equipment do: ' + label + '?', 'À quoi sert cet équipement : ' + label + ' ?');
      if (level === 'normal') return L('Which description correctly matches "' + label + '"?', 'Quelle description correspond à « ' + label + ' » ?');
      return L('You need to perform the task associated with "' + label + '". Which description explains its role?', 'Vous devez effectuer la tâche associée à « ' + label + ' ». Quelle description explique son rôle ?');
    }
    if (type === 'safety') {
      if (level === 'beginner') return L('Which safety instruction applies to ' + method + '?', 'Quelle consigne de sécurité s’applique au ' + method + ' ?');
      if (level === 'normal') return L('Before or during ' + method + ', which precaution is specified?', 'Avant ou pendant le ' + method + ', quelle précaution est indiquée ?');
      return L('A safety review is being performed for ' + method + '. Which instruction is supported by its procedure?', 'Une revue de sécurité est menée pour le ' + method + '. Quelle consigne est étayée par sa procédure ?');
    }
    if (type === 'code') {
      if (level === 'beginner') return L('Which reference is listed for ' + method + '?', 'Quelle référence est indiquée pour le ' + method + ' ?');
      if (level === 'normal') return L('Which reference should be consulted for the scope described in the procedure?', 'Quelle référence consulter pour le domaine décrit par la procédure ?');
      return L('A report must identify a relevant listed reference for ' + method + '. Which option matches the procedure?', 'Un rapport doit mentionner une référence pertinente pour le ' + method + '. Quelle option correspond à la procédure ?');
    }
    if (level === 'beginner') return L('What acceptance guidance is recorded for ' + method + '?', 'Quelle indication d’acceptation est consignée pour le ' + method + ' ?');
    if (level === 'normal') return L('Which statement reflects the documented acceptance guidance?', 'Quelle affirmation reflète les indications d’acceptation documentées ?');
    return L('A reviewer is asked to make a disposition for ' + method + '. Which statement stays within the documented acceptance guidance?', 'Un réviseur doit statuer pour le ' + method + '. Quelle affirmation respecte les indications d’acceptation documentées ?');
  }
  function makeQuestion(key, level, type, label, correct, pool, reason) {
    const alternatives = shuffle(pool.filter((item) => item !== correct));
    const choices = shuffle([correct].concat(alternatives.slice(0, 3)));
    return {
      method: key,
      methodName: METHOD_NAMES[key][isFrench() ? 1 : 0],
      level,
      prompt: questionText(level, key, type, label),
      choices,
      correct: choices.indexOf(correct),
      reason,
      keyword: key + ' ' + label + ' ' + reason
    };
  }
  function makeMethodQuestions(key, level, pools) {
    const procedure = window.CYPROC[key];
    const data = localizedProcedure(key);
    const questions = [];
    data.steps.forEach((step) => {
      const fact = step[1][0];
      questions.push(makeQuestion(key, level, 'step', step[0], fact, pools.step, step[0] + ': ' + fact));
    });
    (procedure.equipment || []).slice(0, 3).forEach((item, index) => {
      const translated = equipmentAt(key, index);
      const fact = translated[0] + ': ' + translated[1];
      questions.push(makeQuestion(key, level, 'equipment', translated[0], fact, pools.equipment, fact));
    });
    (data.hse || procedure.hse || data.wn || procedure.wn || []).slice(0, 2).forEach((fact, index) => {
      questions.push(makeQuestion(key, level, 'safety', String(index + 1), fact, pools.safety, fact));
    });
    const code = procedure.codes[0];
    const codeDescription = data.codes && data.codes[0] ? data.codes[0][1] : code[1];
    const codeFact = code[0] + ': ' + codeDescription;
    questions.push(makeQuestion(key, level, 'code', code[0], codeFact, pools.code, codeFact));
    const acceptance = data.acc[0];
    const acceptanceFact = acceptance[0] + ': ' + acceptance[1];
    questions.push(makeQuestion(key, level, 'acceptance', '', acceptanceFact, pools.acceptance, acceptanceFact));
    return questions.slice(0, 10);
  }
  function buildQuestions(methods, level) {
    const pools = answerPools();
    return shuffle(methods.flatMap((key) => makeMethodQuestions(key, level, pools)));
  }

  let root;
  let selectedLevel = 'beginner';
  let questions = [];
  let questionIndex = 0;
  let score = 0;
  let answered = false;
  let lastQuestion = null;
  const answers = [];

  function labelText(en, fr) { return L(en, fr); }
  function methodsMarkup() {
    return METHOD_KEYS.map((key) => '<label class="quiz-method"><input type="checkbox" name="quiz-method" value="' + key + '"><span><b>' + key + '</b><span>' + METHOD_NAMES[key][isFrench() ? 1 : 0] + '</span></span></label>').join('');
  }
  function setView(view) {
    root.querySelectorAll('[data-quiz-page]').forEach((page) => { page.hidden = page.dataset.quizPage !== view; });
  }
  function renderSetup() {
    const selectedMethods = new Set([...root.querySelectorAll('[name="quiz-method"]:checked')].map((input) => input.value));
    const methodsContainer = root.querySelector('[data-quiz-methods]');
    if (!root.querySelector('[name="quiz-method"]')) methodsContainer.innerHTML = methodsMarkup();
    root.querySelectorAll('[name="quiz-method"]').forEach((input) => {
      input.checked = selectedMethods.has(input.value);
      input.nextElementSibling.querySelector('span').textContent = METHOD_NAMES[input.value][isFrench() ? 1 : 0];
    });
    root.querySelector('[data-quiz-title]').textContent = L('CYCLOPS knowledge quiz', 'Quiz de connaissances CYCLOPS');
    root.querySelector('[data-quiz-description]').textContent = L('Choose one or more methods. You will get 10 questions for each selected method.', 'Choisissez une ou plusieurs méthodes. Vous aurez 10 questions pour chaque méthode choisie.');
    root.querySelector('[data-quiz-method-label]').textContent = L('Inspection methods', 'Méthodes d’inspection');
    root.querySelector('[data-quiz-level-label]').textContent = L('Difficulty', 'Difficulté');
    root.querySelector('[data-quiz-select-all]').textContent = L('Select all', 'Tout sélectionner');
    root.querySelector('[data-quiz-clear]').textContent = L('Clear selection', 'Effacer la sélection');
    root.querySelector('[data-quiz-start]').textContent = L('Start quiz', 'Commencer le quiz');
    root.querySelector('[data-quiz-home]').textContent = L('← Back to procedures', '← Retour aux procédures');
    root.querySelectorAll('[data-quiz-level]').forEach((input) => {
      input.closest('label').querySelector('span').textContent = LEVELS[input.value][isFrench() ? 1 : 0];
    });
    root.querySelector('[data-quiz-error]').textContent = '';
  }
  function startQuiz() {
    const methods = [...root.querySelectorAll('[name="quiz-method"]:checked')].map((input) => input.value);
    if (!methods.length) {
      root.querySelector('[data-quiz-error]').textContent = L('Select at least one method to continue.', 'Sélectionnez au moins une méthode pour continuer.');
      return;
    }
    selectedLevel = root.querySelector('[data-quiz-level]:checked').value;
    questions = buildQuestions(methods, selectedLevel);
    questionIndex = 0;
    score = 0;
    answers.length = 0;
    renderQuestion();
    setView('question');
  }
  function renderQuestion() {
    answered = false;
    lastQuestion = questions[questionIndex];
    root.querySelector('[data-quiz-progress]').textContent = L('Question ', 'Question ') + (questionIndex + 1) + ' / ' + questions.length + ' · ' + lastQuestion.method;
    root.querySelector('[data-quiz-method-name]').textContent = lastQuestion.methodName + ' · ' + LEVELS[selectedLevel][isFrench() ? 1 : 0];
    root.querySelector('[data-quiz-question]').textContent = lastQuestion.prompt;
    root.querySelector('[data-quiz-choices]').innerHTML = lastQuestion.choices.map((choice, index) => '<button class="quiz-choice" type="button" data-choice="' + index + '">' + String.fromCharCode(65 + index) + '. ' + esc(choice) + '</button>').join('');
    root.querySelector('[data-quiz-feedback]').textContent = '';
    root.querySelector('[data-quiz-feedback]').className = 'quiz-feedback';
    root.querySelector('[data-quiz-ai]').hidden = true;
    root.querySelector('[data-quiz-ai-answer]').textContent = '';
    root.querySelector('[data-quiz-next]').disabled = true;
    root.querySelector('[data-quiz-next]').textContent = questionIndex === questions.length - 1 ? L('See results', 'Voir les résultats') : L('Next question →', 'Question suivante →');
  }
  function selectAnswer(index) {
    if (answered) return;
    answered = true;
    const question = questions[questionIndex];
    const correct = index === question.correct;
    window.dispatchEvent(new CustomEvent('cy-answer', { detail: { src: 'quiz', area: question.method, skill: 'knowledge', ok: correct, q: question.prompt, given: question.choices[index], right: question.choices[question.correct], why: question.reason } }));
    if (correct) score++;
    answers.push(correct);
    root.querySelectorAll('[data-choice]').forEach((button) => {
      const choice = Number(button.dataset.choice);
      button.disabled = true;
      if (choice === question.correct) button.classList.add('correct');
      else if (choice === index) button.classList.add('incorrect');
    });
    root.querySelector('[data-quiz-feedback]').textContent = (correct ? L('Correct. ', 'Correct. ') : L('Not quite. ', 'Pas tout à fait. ')) + question.reason;
    root.querySelector('[data-quiz-feedback]').classList.add(correct ? 'is-correct' : 'is-incorrect');
    root.querySelector('[data-quiz-ai]').hidden = false;
    root.querySelector('[data-quiz-next]').disabled = false;
  }
  function nextQuestion() {
    if (questionIndex < questions.length - 1) {
      questionIndex++;
      renderQuestion();
      return;
    }
    renderResults();
    setView('results');
  }
  function renderResults() {
    const percentage = Math.round(score / questions.length * 100);
    window.dispatchEvent(new CustomEvent('cy-learn', { detail: { id: 'quiz:' + selectedLevel, score: percentage } }));
    root.querySelector('[data-quiz-results-title]').textContent = L('Quiz complete', 'Quiz terminé');
    root.querySelector('[data-quiz-score]').textContent = score + ' / ' + questions.length;
    root.querySelector('[data-quiz-summary]').textContent = percentage + '% · ' + LEVELS[selectedLevel][isFrench() ? 1 : 0] + ' · ' + L('Methods: ', 'Méthodes : ') + [...new Set(questions.map((q) => q.method))].join(', ');
    root.querySelector('[data-quiz-results-feedback]').textContent = percentage >= 80 ? L('Strong result. Review any missed answers before applying procedures in the field.', 'Bon résultat. Revoyez les réponses manquées avant d’appliquer les procédures sur le terrain.') : L('Review the missed answers and the approved procedures before applying them in the field.', 'Revoyez les réponses manquées et les procédures approuvées avant de les appliquer sur le terrain.');
    root.querySelector('[data-quiz-review]').innerHTML = questions.map((question, index) => '<li><b>' + question.method + ' · ' + esc(question.prompt) + '</b><br>' + (answers[index] ? '✓ ' : '× ') + esc(question.choices[question.correct]) + '</li>').join('');
    root.querySelector('[data-quiz-results-back]').textContent = L('← Back to quiz setup', '← Retour aux réglages du quiz');
    root.querySelector('[data-quiz-results-home]').textContent = L('Back to procedures', 'Retour aux procédures');
  }
  async function explainWithAI() {
    const button = root.querySelector('[data-quiz-ai]');
    const output = root.querySelector('[data-quiz-ai-answer]');
    if (!window.CY3 || typeof window.CY3.ask !== 'function' || !lastQuestion) {
      output.textContent = L('AI assistant is not available right now.', 'L’assistant IA n’est pas disponible pour le moment.');
      return;
    }
    button.disabled = true;
    output.textContent = L('Asking the AI assistant…', 'Question à l’assistant IA…');
    const prompt = L('Explain the correct answer for this ' + lastQuestion.method + ' quiz question. Question: ' + lastQuestion.prompt + ' Correct answer: ' + lastQuestion.choices[lastQuestion.correct] + ' Source guidance: ' + lastQuestion.reason + ' Keep it educational, concise, and do not invent code acceptance criteria.', 'Explique la bonne réponse à cette question de quiz ' + lastQuestion.method + '. Question : ' + lastQuestion.prompt + ' Bonne réponse : ' + lastQuestion.choices[lastQuestion.correct] + ' Indication source : ' + lastQuestion.reason + ' Réponds de façon pédagogique et concise, sans inventer de critères d’acceptation de code.');
    try {
      const reply = await window.CY3.ask(prompt, { kw: lastQuestion.keyword });
      output.textContent = reply.t + (reply.ai ? '' : L(' (Offline fallback: connect an AI backend for a generated explanation.)', ' (Réponse de secours locale : connectez un serveur IA pour une explication générée.)'));
    } catch (error) {
      output.textContent = L('The AI assistant could not answer. Review the source explanation above.', 'L’assistant IA n’a pas pu répondre. Consultez l’explication source ci-dessus.');
    } finally {
      button.disabled = false;
    }
  }
  function back() {
    const current = root.querySelector('[data-quiz-page]:not([hidden])');
    if (!current || current.dataset.quizPage === 'setup') {
      close();
      return;
    }
    setView(current.dataset.quizPage === 'results' ? 'setup' : 'setup');
    renderSetup();
  }
  function open() {
    $('#prd').hidden = true;
    $('#ptab').hidden = true;
    $('.search').hidden = true;
    root.hidden = false;
    renderSetup();
    setView('setup');
  }
  function close() {
    root.hidden = true;
    $('#prd').hidden = false;
    $('#ptab').hidden = false;
    $('.search').hidden = false;
  }
  function init() {
    root = $('#quiz-view');
    root.innerHTML = '<section class="quiz-page" data-quiz-page="setup"><div class="quiz-top"><button type="button" data-quiz-home></button><h2 data-quiz-title></h2></div><p class="mut" data-quiz-description></p><fieldset class="quiz-fieldset"><legend data-quiz-method-label></legend><div class="quiz-methods" data-quiz-methods></div><div class="quiz-actions"><button type="button" data-quiz-select-all></button><button type="button" data-quiz-clear></button></div></fieldset><fieldset class="quiz-fieldset"><legend data-quiz-level-label></legend><div class="quiz-levels"><label><input type="radio" name="quiz-level" data-quiz-level value="beginner" checked><span></span></label><label><input type="radio" name="quiz-level" data-quiz-level value="normal"><span></span></label><label><input type="radio" name="quiz-level" data-quiz-level value="master"><span></span></label></div></fieldset><p class="quiz-error" data-quiz-error role="alert"></p><button class="quiz-primary" type="button" data-quiz-start></button></section><section class="quiz-page" data-quiz-page="question" hidden><div class="quiz-top"><button type="button" data-quiz-question-back>← '+L('Quiz setup','Réglages du quiz')+'</button><span data-quiz-progress></span></div><p class="mut" data-quiz-method-name></p><h2 data-quiz-question></h2><div class="quiz-choices" data-quiz-choices></div><p class="quiz-feedback" data-quiz-feedback aria-live="polite"></p><button type="button" data-quiz-ai hidden>🤖 '+L('Ask AI to explain','Demander une explication à l’IA')+'</button><p class="quiz-ai-answer" data-quiz-ai-answer aria-live="polite"></p><button class="quiz-primary" type="button" data-quiz-next disabled></button></section><section class="quiz-page" data-quiz-page="results" hidden><div class="quiz-top"><button type="button" data-quiz-results-back></button><h2 data-quiz-results-title></h2></div><p class="quiz-score" data-quiz-score></p><p data-quiz-summary></p><p class="mut" data-quiz-results-feedback></p><ol class="quiz-review" data-quiz-review></ol><button class="quiz-primary" type="button" data-quiz-results-home></button></section>';
    $('#quiz-open').addEventListener('click', open);
    root.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.matches('[data-quiz-home],[data-quiz-results-home]')) close();
      else if (button.matches('[data-quiz-select-all]')) root.querySelectorAll('[name="quiz-method"]').forEach((input) => { input.checked = true; });
      else if (button.matches('[data-quiz-clear]')) root.querySelectorAll('[name="quiz-method"]').forEach((input) => { input.checked = false; });
      else if (button.matches('[data-quiz-start]')) startQuiz();
      else if (button.matches('[data-quiz-question-back],[data-quiz-results-back]')) back();
      else if (button.matches('[data-quiz-next]')) nextQuestion();
      else if (button.matches('[data-quiz-ai]')) explainWithAI();
      else if (button.dataset.choice != null) selectAnswer(Number(button.dataset.choice));
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !root.hidden) back(); });
    renderSetup();
  }
  function langChanged() {
    if (!root) return;
    const current = root.querySelector('[data-quiz-page]:not([hidden])');
    if (current && current.dataset.quizPage === 'setup') renderSetup();
  }
  window.CYQUIZ = { open, close, back, langChanged, buildQuestions };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
