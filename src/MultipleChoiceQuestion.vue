<template>
  <div class="multiple-choice-question" :data-question-id="questionData.id">
    <div class="mcq-question">{{ questionData.question }}</div>
    <div class="mcq-options">
      <label 
        v-for="(option, index) in questionData.options" 
        :key="index"
        class="mcq-option" 
        :class="getOptionClass(index)"
        :data-correct="option.isCorrect"
      >
        <input 
          type="radio" 
          :name="questionData.id" 
          :value="index" 
          v-model="selectedAnswer"
          :disabled="answered"
        />
        <span class="mcq-option-text">{{ option.text }}</span>
        <span v-if="answered" class="mcq-feedback">
          {{ getFeedback(index) }}
        </span>
      </label>
    </div>
    <button 
      class="mcq-submit" 
      @click="submitAnswer"
      :disabled="selectedAnswer === null || answered"
      v-if="!answered"
    >
      {{ answered ? 'Answered' : 'Submit Answer' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

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

interface Props {
  questionData: MultipleChoiceQuestion;
}

const props = defineProps<Props>();

const selectedAnswer = ref<number | null>(null);
const answered = ref(false);

const correctAnswerIndex = computed(() => {
  return props.questionData.options.findIndex(option => option.isCorrect);
});

const isCorrect = computed(() => {
  return selectedAnswer.value === correctAnswerIndex.value;
});

const resultMessage = computed(() => {
  return isCorrect.value 
    ? '✓ Correct!' 
    : '✗ Incorrect. The correct answer is highlighted above.';
});

const resultClass = computed(() => {
  return isCorrect.value ? 'mcq-result--correct' : 'mcq-result--incorrect';
});

function getOptionClass(index: number): string {
  if (!answered.value) return '';
  
  const option = props.questionData.options[index];
  if (option.isCorrect) {
    return 'mcq-option--correct';
  } else if (index === selectedAnswer.value) {
    return 'mcq-option--incorrect';
  }
  return 'mcq-option--neutral';
}

function getFeedback(index: number): string {
  if (!answered.value) return '';
  
  const option = props.questionData.options[index];
  if (option.isCorrect) {
    return '✓ Correct';
  } else if (index === selectedAnswer.value) {
    return '✗ Incorrect';
  }
  return '';
}

function submitAnswer(): void {
  if (selectedAnswer.value === null) {
    alert('Please select an answer');
    return;
  }
  answered.value = true;
}
</script>

<style scoped>
.multiple-choice-question {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #ffffff;
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

.mcq-option:hover:not(.mcq-option--correct):not(.mcq-option--incorrect):not(.mcq-option--neutral) {
  border-color: #007bff;
  background-color: #e9f4ff;
}

.mcq-option--correct {
  background-color: #d4edda !important;
  border-color: #c3e6cb !important;
}

.mcq-option--incorrect {
  background-color: #f8d7da !important;
  border-color: #f5c6cb !important;
}

.mcq-option--neutral {
  background-color: #f8f9fa !important;
  border-color: #dee2e6 !important;
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

.mcq-option--correct .mcq-feedback {
  color: #155724;
}

.mcq-option--incorrect .mcq-feedback {
  color: #721c24;
}

.mcq-submit {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
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

.mcq-result--correct {
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.mcq-result--incorrect {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}
</style> 