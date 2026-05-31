import {
  calculateCompletedCredits,
  calculateCompletionRate,
  calculateGpa,
  calculateTotalCredits,
} from "./gradeUtils";

const courses = [
  { name: "Math", credits: 4, completed: true, gradePoint: 4 },
  { name: "English", credits: 2, completed: true, gradePoint: 3 },
  { name: "Physics", credits: 3, completed: false, gradePoint: 0 },
];

test("calculates total and completed credits", () => {
  expect(calculateTotalCredits(courses)).toBe(9);
  expect(calculateCompletedCredits(courses)).toBe(6);
});

test("calculates credit completion rate", () => {
  expect(calculateCompletionRate(courses)).toBeCloseTo(6 / 9);
  expect(calculateCompletionRate([])).toBe(0);
});

test("calculates weighted GPA for completed courses", () => {
  expect(calculateGpa(courses)).toBe(3.67);
  expect(calculateGpa([{ name: "Audit", credits: 0, completed: true }])).toBe(0);
});
