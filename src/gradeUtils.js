export function calculateTotalCredits(courses = []) {
  return courses.reduce((total, course) => total + Number(course.credits || 0), 0);
}

export function calculateCompletedCredits(courses = []) {
  return courses
    .filter((course) => course.completed)
    .reduce((total, course) => total + Number(course.credits || 0), 0);
}

export function calculateCompletionRate(courses = []) {
  const totalCredits = calculateTotalCredits(courses);

  if (totalCredits === 0) {
    return 0;
  }

  return calculateCompletedCredits(courses) / totalCredits;
}

export function calculateGpa(courses = []) {
  const gradedCourses = courses.filter(
    (course) => course.completed && Number(course.credits || 0) > 0 && course.gradePoint != null
  );
  const gpaCredits = calculateTotalCredits(gradedCourses);

  if (gpaCredits === 0) {
    return 0;
  }

  const weightedScore = gradedCourses.reduce(
    (total, course) => total + Number(course.credits) * Number(course.gradePoint),
    0
  );

  return Number((weightedScore / gpaCredits).toFixed(2));
}
