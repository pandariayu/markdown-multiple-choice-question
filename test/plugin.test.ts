import MarkdownIt from 'markdown-it';
import multipleChoicePlugin from '../src/index';

describe('markdown-it-multiple-choice', () => {
  let md: MarkdownIt;

  beforeEach(() => {
    md = new MarkdownIt().use(multipleChoicePlugin);
  });

  test('should parse basic multiple choice question', () => {
    const input = `[?] What is Vue.js?
[ ] A database
[x] A JavaScript framework
[ ] A CSS library`;

    const result = md.render(input);
    
    expect(result).toContain('multiple-choice-question');
    expect(result).toContain('What is Vue.js?');
    expect(result).toContain('A database');
    expect(result).toContain('A JavaScript framework');
    expect(result).toContain('A CSS library');
    expect(result).toContain('data-correct="true"');
    expect(result).toContain('data-correct="false"');
  });

  test('should handle multiple questions', () => {
    const input = `[?] Question 1?
[ ] Option A
[x] Option B

[?] Question 2?
[x] Option C
[ ] Option D`;

    const result = md.render(input);
    
    expect(result).toContain('Question 1?');
    expect(result).toContain('Question 2?');
    expect(result).toContain('Option A');
    expect(result).toContain('Option B');
    expect(result).toContain('Option C');
    expect(result).toContain('Option D');
  });

  test('should not parse invalid questions', () => {
    const input = `[ ] No question marker
[x] Just options`;

    const result = md.render(input);
    
    expect(result).not.toContain('multiple-choice-question');
  });

  test('should handle questions with no correct answer', () => {
    const input = `[?] Question with no correct answer?
[ ] Option A
[ ] Option B`;

    const result = md.render(input);
    
    expect(result).toContain('multiple-choice-question');
    expect(result).toContain('Question with no correct answer?');
  });

  test('should handle questions with multiple correct answers (taking first x)', () => {
    const input = `[?] Question with multiple correct answers?
[x] First correct
[x] Second correct
[ ] Wrong answer`;

    const result = md.render(input);
    
    expect(result).toContain('multiple-choice-question');
    expect(result).toContain('First correct');
    expect(result).toContain('Second correct');
  });

  test('should preserve other markdown content', () => {
    const input = `# Title

Regular paragraph.

[?] A question?
[ ] Option A
[x] Option B

Another paragraph.`;

    const result = md.render(input);
    
    expect(result).toContain('<h1>Title</h1>');
    expect(result).toContain('<p>Regular paragraph.</p>');
    expect(result).toContain('multiple-choice-question');
    expect(result).toContain('<p>Another paragraph.</p>');
  });

  test('should generate unique IDs for questions', () => {
    const input = `[?] Question 1?
[ ] Option A
[x] Option B

[?] Question 2?
[x] Option C
[ ] Option D`;

    const result = md.render(input);
    
    // Should contain data-question-id attributes
    expect(result).toMatch(/data-question-id="mcq-[a-z0-9]+"/g);
    
    // Extract all question IDs (now appears twice per question: div and button)
    const ids = result.match(/data-question-id="(mcq-[a-z0-9]+)"/g);
    expect(ids).toHaveLength(4); // 2 questions × 2 attributes each
    
    // Extract unique IDs (should be 2 unique question IDs)
    const uniqueIds = [...new Set(ids)];
    expect(uniqueIds).toHaveLength(2);
  });
}); 