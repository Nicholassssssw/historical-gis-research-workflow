(() => {
  const steps = window.TEACHING_STEPS || [];
  if (!steps.length) return;

  const introSlide = {
    isIntro: true,
    numeral: '序',
    stepLabel: '教學導覽',
    title: '如何使用互動教學',
    intro: '這裡會用八個步驟教你逐步建立歷史地理研究 Prompt。\n\n每張卡片先解釋一個方法，再請你完成單選題或多選題。答對後，系統會以打字動畫組合該步驟的完整 Prompt。\n\n動畫完成後，右上角會出現「複製 Prompt」。你可以把 Prompt 貼到自己使用的 AI，加入研究文本或資料，看看實際輸出結果，再返回這裡繼續下一步。'
  };
  const slides = [introSlide, ...steps];

  const card = document.getElementById('lesson-card');
  const kicker = document.getElementById('lesson-kicker');
  const title = document.getElementById('lesson-title');
  const numeral = document.getElementById('lesson-number');
  const progressLabel = document.getElementById('lesson-progress-label');
  const progressTrack = document.querySelector('.lesson-progress-track');
  const progressBar = document.getElementById('lesson-progress-bar');
  const screen = document.querySelector('.lesson-screen');
  const introPanel = document.getElementById('lesson-intro-panel');
  const introText = document.getElementById('lesson-intro-text');
  const introStartButton = document.getElementById('lesson-start-button');
  const output = document.getElementById('typewriter-text');
  const cursor = document.getElementById('typing-cursor');
  const copyButton = document.getElementById('lesson-copy-button');
  const question = document.getElementById('lesson-question');
  const questionLegend = document.getElementById('question-legend');
  const questionOptions = document.getElementById('question-options');
  const answerButton = document.getElementById('answer-button');
  const feedback = document.getElementById('answer-feedback');
  const promptPanel = document.getElementById('generated-prompt-panel');
  const promptText = document.getElementById('generated-prompt-text');
  const cardFooter = document.getElementById('lesson-card-footer');
  const previousButton = document.getElementById('previous-step');
  const nextButton = document.getElementById('next-step');
  const navHint = document.getElementById('lesson-nav-hint');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let currentIndex = 0;
  let typingRun = 0;
  let isTurning = false;
  const completed = Array(slides.length).fill(false);
  const savedAnswers = Array.from({ length: slides.length }, () => []);

  const pause = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  async function typeText(text, onComplete, speed = 13) {
    const run = ++typingRun;
    output.textContent = '';
    screen.scrollTop = 0;
    cursor.hidden = false;
    const typingDelay = reducedMotion ? 0 : speed;
    for (const character of text) {
      if (run !== typingRun) return;
      output.textContent += character;
      if (output.textContent.length % 8 === 0) screen.scrollTop = screen.scrollHeight;
      if (typingDelay) await pause(character === '\n' ? typingDelay * 4 : typingDelay);
    }
    if (run !== typingRun) return;
    cursor.hidden = true;
    if (onComplete) onComplete();
  }

  function selectedIndexes() {
    return [...questionOptions.querySelectorAll('input:checked')].map((input) => Number(input.value));
  }

  function expectedIndexes(step) {
    return step.question.options
      .map((option, index) => option.correct ? index : -1)
      .filter((index) => index >= 0);
  }

  function answersMatch(step, selected) {
    const expected = expectedIndexes(step);
    return selected.length === expected.length && expected.every((index) => selected.includes(index));
  }

  function buildQuestion(step) {
    const isMultiple = step.question.type === 'multiple';
    const typeLabel = isMultiple ? '多選題' : '單選題';
    const inputType = isMultiple ? 'checkbox' : 'radio';
    questionLegend.innerHTML = `<span>${typeLabel}</span>${step.question.prompt}`;
    questionOptions.innerHTML = '';

    step.question.options.forEach((option, index) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = inputType;
      input.name = `lesson-answer-${currentIndex}`;
      input.value = String(index);
      input.checked = savedAnswers[currentIndex].includes(index);
      input.disabled = completed[currentIndex];
      label.append(input, document.createTextNode(` ${option.label}`));
      questionOptions.append(label);
    });

    answerButton.disabled = completed[currentIndex];
    answerButton.textContent = completed[currentIndex] ? '已完成' : '提交答案';
  }

  function updateNavigation() {
    previousButton.disabled = currentIndex === 0 || isTurning;
    nextButton.disabled = !completed[currentIndex] || isTurning;
    nextButton.textContent = currentIndex === slides.length - 1 ? '返回工作流程 →' : '下一步 →';
    if (currentIndex === 0) {
      navHint.textContent = completed[currentIndex] ? '準備完成，可以開始步驟一' : '閱讀導覽後解鎖步驟一';
      return;
    }
    navHint.textContent = completed[currentIndex]
      ? (currentIndex === slides.length - 1 ? '八步教學已完成' : '本步驟已完成，可以繼續')
      : '答對題目並完成動畫後解鎖下一步';
  }

  function showCompleted(step) {
    output.textContent = `${step.success}\n\n【結果】\n${step.result || '請返回工作流程頁查看本步驟結果。'}`;
    cursor.hidden = true;
    promptText.value = step.prompt;
    promptPanel.hidden = false;
    screen.scrollTop = screen.scrollHeight;
    question.hidden = false;
    feedback.className = 'answer-feedback is-correct';
    feedback.textContent = '答案正確，Prompt 已完成。';
    updateNavigation();
  }

  function renderStep() {
    const step = slides[currentIndex];
    const progress = (currentIndex / steps.length) * 100;
    kicker.textContent = step.stepLabel;
    title.textContent = step.title;
    numeral.textContent = step.numeral;
    progressLabel.textContent = step.isIntro ? '教學導覽' : `${step.stepLabel}／共八步`;
    progressTrack.setAttribute('aria-valuemin', '0');
    progressTrack.setAttribute('aria-valuenow', String(currentIndex));
    progressBar.style.width = `${progress}%`;
    promptPanel.hidden = true;
    promptText.value = '';
    introPanel.hidden = true;
    screen.hidden = false;
    cardFooter.hidden = false;
    feedback.className = 'answer-feedback';
    feedback.textContent = '';

    if (step.isIntro) {
      question.hidden = true;
      screen.hidden = true;
      cardFooter.hidden = true;
      introText.textContent = step.intro;
      introPanel.hidden = false;
      cursor.hidden = true;
      return;
    }

    buildQuestion(step);
    updateNavigation();

    if (completed[currentIndex]) {
      showCompleted(step);
      return;
    }

    question.hidden = true;
    typeText(step.intro, () => {
      question.hidden = false;
      question.classList.add('question-reveal');
      window.setTimeout(() => question.classList.remove('question-reveal'), 450);
    });
  }

  async function completeStep() {
    const step = slides[currentIndex];
    if (step.isIntro) return;
    const selected = selectedIndexes();
    if (!selected.length) {
      feedback.className = 'answer-feedback is-wrong';
      feedback.textContent = '請先選擇答案。';
      return;
    }

    if (!answersMatch(step, selected)) {
      feedback.className = 'answer-feedback is-wrong';
      feedback.textContent = step.question.type === 'multiple' ? '答案尚未完整，請重新檢查所有選項。' : '答案不正確，請再想一想。';
      card.classList.remove('answer-shake');
      void card.offsetWidth;
      card.classList.add('answer-shake');
      return;
    }

    savedAnswers[currentIndex] = selected;
    questionOptions.querySelectorAll('input').forEach((input) => { input.disabled = true; });
    answerButton.disabled = true;
    answerButton.textContent = '生成 Prompt 中…';
    feedback.className = 'answer-feedback is-correct';
    feedback.textContent = '答案正確，正在整理本步驟 Prompt。';
    promptPanel.hidden = true;

    const finalText = `${step.success}\n\n【結果】\n${step.result || '請返回工作流程頁查看本步驟結果。'}`;
    await typeText(finalText, () => {
      completed[currentIndex] = true;
      answerButton.textContent = '已完成';
      feedback.textContent = 'Prompt 已完成，可以複製或前往下一步。';
      promptText.value = step.prompt;
      promptPanel.hidden = false;
      screen.scrollTop = screen.scrollHeight;
      promptPanel.classList.add('copy-reveal');
      window.setTimeout(() => promptPanel.classList.remove('copy-reveal'), 500);
      updateNavigation();
    }, 34);
  }

  function turnTo(index) {
    if (isTurning || index < 0 || index >= slides.length || index === currentIndex) return;
    isTurning = true;
    typingRun += 1;
    currentIndex = index;
    renderStep();
    isTurning = false;
    updateNavigation();
  }

  answerButton.addEventListener('click', completeStep);

  introStartButton.addEventListener('click', () => {
    completed[0] = true;
    turnTo(1);
  });

  previousButton.addEventListener('click', () => turnTo(currentIndex - 1));

  nextButton.addEventListener('click', () => {
    if (!completed[currentIndex]) return;
    if (currentIndex === slides.length - 1) {
      window.location.href = 'index.html';
      return;
    }
    turnTo(currentIndex + 1);
  });

  copyButton.addEventListener('click', async () => {
    const prompt = promptText.value;
    const original = copyButton.textContent;
    try {
      await navigator.clipboard.writeText(prompt);
      copyButton.textContent = '已複製';
    } catch {
      const helper = document.createElement('textarea');
      helper.value = prompt;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.append(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
      copyButton.textContent = '已複製';
    }
    window.setTimeout(() => { copyButton.textContent = original; }, 1400);
  });

  renderStep();
})();
