import type MarkdownIt from 'markdown-it';

interface MultipleChoiceOption {
  text: string;
  isCorrect: boolean;
  isQuestion: boolean;
}

interface MultipleChoiceQuestion {
  question: string;
  options: MultipleChoiceOption[];
  id: string;
}

function parseMultipleChoice(state: any, startLine: number, endLine: number, silent: boolean): boolean {
  const oldParentType = state.parentType;
  const oldTShift = state.tShift[startLine];
  const oldSCount = state.sCount[startLine];
  const oldListLines = state.lineMax;
  const terminatorRules = state.md.block.ruler.getRules('paragraph');
  
  let nextLine = startLine;
  let terminate = false;
  let tight = true;
  let questionFound = false;
  
  // Look for question marker [?]
  const questionRegex = /^\s*\[\?\]\s+(.+)$/;
  const optionRegex = /^\s*\[(x| )\]\s+(.+)$/;
  const lines: string[] = [];
  for (nextLine = startLine; nextLine < endLine; nextLine++) {
    const line = state.getLines(nextLine, nextLine + 1, 0, false).trim();
    
    if (questionRegex.test(line)) {
      questionFound = true;
      lines.push(line);
    } else if (optionRegex.test(line) && questionFound) {
      lines.push(line);
    } else if (line === '' && questionFound) {
      break;
    } else if (questionFound) {
      break;
    } else {
      return false;
    }
  }
  
  if (!questionFound || lines.length < 2) {
    return false;
  }
  
  if (silent) {
    return true;
  }
  
  // Parse the question and options
  const question = lines[0].match(questionRegex)?.[1] || '';
  const options: MultipleChoiceOption[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const match = lines[i].match(optionRegex);
    if (match) {
      options.push({
        text: match[2],
        isCorrect: match[1] === 'x',
        isQuestion: false
      });
    }
  }

  const questionId = `mcq-${Math.random().toString(36).substr(2, 9)}`;
  const token = state.push('multiple_choice', 'div', 0);
  token.block = true;
  token.info = JSON.stringify({
    question,
    options,
    id: questionId
  });
  token.map = [startLine, nextLine];
  
  state.line = nextLine;
  return true;
}

function renderMultipleChoice(tokens: any[], idx: number, _options: any, env: any, renderer: any): string {
  const token = tokens[idx];
  const info = JSON.parse(token.info);
  const { question, options, id } = info;
  
  const optionsHtml = options.map((option: MultipleChoiceOption, index: number) => {
    return `<label class="mcq-option" data-correct="${option.isCorrect}">
      <input type="radio" name="${id}" value="${index}" />
      <span class="mcq-option-text">${option.text}</span>
      <span class="mcq-feedback" style="display: none;"></span>
    </label>`;
  }).join('\n');
  
  return `<div class="multiple-choice-question" data-question-id="${id}">
    <div class="mcq-question">${question}</div>
    <div class="mcq-options">
      ${optionsHtml}
    </div>
    <button class="mcq-submit" data-question-id="${id}">Submit Answer</button>
    <div class="mcq-result" style="display: none;"></div>
  </div>`;
}

function multipleChoicePlugin(md: MarkdownIt, options: any = {}): void {
  md.block.ruler.before('paragraph', 'multiple_choice', parseMultipleChoice, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  });
  
  md.renderer.rules.multiple_choice = renderMultipleChoice;
}

const defaultStyles = `
<style>
.multiple-choice-question {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.mcq-question {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
}

.mcq-options {
  margin-bottom: 15px;
}

.mcq-option {
  display: block;
  margin: 8px 0;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f8f9fa;
}

.mcq-option:hover {
  border-color: #007bff;
  background-color: #e9f4ff;
}

.mcq-option input[type="radio"] {
  margin-right: 10px;
}

.mcq-option-text {
  font-size: 1em;
  color: #495057;
}

.mcq-feedback {
  float: right;
  font-weight: bold;
  font-size: 0.9em;
}

.mcq-submit {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease;
}

.mcq-submit:hover:not(:disabled) {
  background-color: #0056b3;
}

.mcq-submit:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.mcq-result {
  margin-top: 15px;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
}
</style>
`;

export { multipleChoicePlugin as default, defaultStyles };

export function checkAnswer(questionId: string): void {
  const questionEl = document.querySelector(`[data-question-id="${questionId}"]`);
  if (!questionEl) return;
  
  const selectedOption = questionEl.querySelector('input[type="radio"]:checked') as HTMLInputElement;
  const resultEl = questionEl.querySelector('.mcq-result') as HTMLElement;
  const submitBtn = questionEl.querySelector('.mcq-submit') as HTMLButtonElement;
  
  if (!selectedOption) {
    alert('Please select an answer');
    return;
  }
  
  const selectedIndex = parseInt(selectedOption.value);
  const options = questionEl.querySelectorAll('.mcq-option');
  let correctAnswer = null;
  options.forEach((option, index) => {
    const isCorrect = option.getAttribute('data-correct') === 'true';
    const feedback = option.querySelector('.mcq-feedback') as HTMLElement;
    if (isCorrect) {
      correctAnswer = index;
      (option as HTMLElement).style.backgroundColor = 'var(--vp-c-green-soft)';
      (option as HTMLElement).style.borderColor = 'var(--vp-c-green)';
      feedback.textContent = '✓';
      feedback.style.color = 'var(--vp-c-green)';
    } else if (index === selectedIndex) {
      (option as HTMLElement).style.backgroundColor = 'var(--vp-c-red-soft)';
      (option as HTMLElement).style.borderColor = 'var(--vp-c-red)';
      feedback.textContent = '✗';
      feedback.style.color = 'var(--vp-c-red)';
    } else {
      (option as HTMLElement).style.backgroundColor = 'var(--vp-c-bg-alt)';
      (option as HTMLElement).style.borderColor = 'var(--vp-c-border)';
    }

    feedback.style.display = 'inline';
    (option.querySelector('input') as HTMLInputElement).disabled = true;
  });
  submitBtn.disabled = true;
  submitBtn.textContent = 'Answered';
}

export function setupMultipleChoice(): void {
  document.addEventListener('click', function(event) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('mcq-submit')) {
      const questionEl = target.closest('.multiple-choice-question');
      if (questionEl) {
        const questionId = questionEl.getAttribute('data-question-id');
        if (questionId) {
          checkAnswer(questionId);
        }
      }
    }
  });
}

export function createVitePressTheme(DefaultTheme: any) {
  return {
    extends: DefaultTheme,
    setup() {
      if (typeof window !== 'undefined') {
        const { onMounted } = require('vue');
        onMounted(() => {
          setupMultipleChoice();
        });
      }
    }
  };
}

export type { MultipleChoiceQuestion, MultipleChoiceOption }; 