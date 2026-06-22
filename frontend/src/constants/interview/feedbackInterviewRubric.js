// /src/constant/feedbackInterviewRubric.js
export const CRITERIA = [
  { key: 'communication', label: 'Giao tiếp (Communication)', baseScore: 70, weight: 1 },
  { key: 'content', label: 'Nội dung (Content Relevance)', baseScore: 65, weight: 1 },
  { key: 'confidence', label: 'Tự tin (Confidence)', baseScore: 60, weight: 1 },
  { key: 'structure', label: 'Cấu trúc (Structure)', baseScore: 65, weight: 1 },
  {
    key: 'technical',
    label: 'Kỹ thuật (Technical Accuracy)',
    baseScore: 60,
    weight: 1.2,
    onlyForType: 'Technical',
  },
];

export const TAG_DEFINITIONS = {
  'must-have': { color: 'red', label: 'Must-have', bgClass: 'bg-red-50 border-red-200', textClass: 'text-red-700' },
  'nice-to-have': { color: 'green', label: 'Nice-to-have', bgClass: 'bg-green-50 border-green-200', textClass: 'text-green-700' },
};

export const HR_PERSONAS = {
  FPT: {
    HR: {
      name: 'Anh Minh',
      role: 'HR — FPT Software',
      tone: 'Chuyên nghiệp, thân thiện',
      opener: 'Chào bạn, tôi là Minh — HR tại FPT Software. Cảm ơn bạn đã hoàn thành buổi phỏng vấn hôm nay, tôi xin chia sẻ một số nhận xét.',
      closer: 'FPT rất mong được đồng hành cùng bạn. Hãy tiếp tục luyện tập và theo dõi email để cập nhật kết quả nhé.',
    },
    Technical: {
      name: 'Anh Hùng',
      role: 'Tech Lead — FPT Software',
      tone: 'Sắc sảo, đánh giá cao tư duy',
      opener: 'Chào bạn, tôi là Hùng — Tech Lead tại FPT. Buổi phỏng vấn kỹ thuật hôm nay có một số điểm tôi muốn phản hồi.',
      closer: 'Cảm ơn bạn đã tham gia. Nếu qua vòng này, team sẽ liên hệ trong 3-5 ngày làm việc.',
    },
    Behavioral: {
      name: 'Chị Lan',
      role: 'HR Manager — FPT Software',
      tone: 'Đồng cảm, khuyến khích',
      opener: 'Chào bạn, tôi là Lan — HR Manager tại FPT. Phỏng vấn behavioral giúp chúng tôi hiểu cách bạn xử lý tình huống thực tế.',
      closer: 'Bạn đã thể hiện rất tốt. Hãy tiếp tục phát huy thế mạnh này nhé.',
    },
  },
};

export const SCORE_LABELS = [
  { min: 85, label: 'Xuất sắc', color: 'text-emerald-500' },
  { min: 70, label: 'Tốt', color: 'text-blue-500' },
  { min: 55, label: 'Khá', color: 'text-amber-500' },
  { min: 0, label: 'Cần cải thiện', color: 'text-rose-500' },
];

export function labelForScore(score) {
  return SCORE_LABELS.find((l) => score >= l.min) || SCORE_LABELS[SCORE_LABELS.length - 1];
}
