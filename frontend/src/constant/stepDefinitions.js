// /src/constant/stepDefinitions.js
// 10 steps for the interview flow
export const STEPS = [
  { n: 1, path: '/interview/job-selection', title: 'Chọn ngành nghề', short: 'Job' },
  { n: 2, path: '/interview/cv-status', title: 'Tình trạng CV', short: 'CV' },
  { n: 3, path: '/interview/experience-level', title: 'Mức kinh nghiệm', short: 'Level' },
  { n: 4, path: '/interview/career-goal', title: 'Mục tiêu nghề nghiệp', short: 'Goal' },
  { n: 5, path: '/interview/setup', title: 'Cấu hình phỏng vấn', short: 'Setup' },
  { n: 6, path: '/audio-setup', title: 'Kiểm tra âm thanh', short: 'Audio' },
  { n: 7, path: '/video-setup', title: 'Chuẩn bị video', short: 'Video' },
  { n: 8, path: '/interview/room', title: 'Phòng phỏng vấn', short: 'Room' },
  { n: 9, path: '/interview/review', title: 'Xem lại bản ghi', short: 'Review' },
  { n: 10, path: '/interview/result', title: 'Kết quả & phản hồi', short: 'Result' },
];

export const TOTAL_STEPS = STEPS.length;

export function getStepByPath(pathname) {
  return STEPS.find((s) => s.path === pathname);
}
