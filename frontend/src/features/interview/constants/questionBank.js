// /src/constant/questionBank.js
// Mỗi câu: { id, type, level, text, tags[], mustHave, sampleAnswer, keywordsForMatch[] }
// Câu Technical tham khảo docs/FPT/All.csv (LeetCode frequency)

const END_PHRASES_VN = ['xin hết', 'hết rồi', 'xong rồi', 'hết câu', 'tôi xin hết', 'em xin hết'];
const END_PHRASES_EN = ["that's it", "that is it", "i'm done", "im done", "i am done"];

// HR — văn hóa FPT, teamwork, mục tiêu nghề nghiệp
const HR_QUESTIONS = [
  {
    id: 'hr-001',
    type: 'HR',
    level: 'all',
    text: 'Bạn biết gì về FPT Software? Điều gì ở FPT hấp dẫn bạn nhất?',
    tags: ['culture', 'fpt', 'motivation'],
    mustHave: true,
    sampleAnswer: 'FPT là tập đoàn công nghệ hàng đầu Việt Nam, hoạt động trong lĩnh vực phần mềm, viễn thông và giáo dục. Điều hấp dẫn tôi là văn hóa "đổi mới sáng tạo" và cơ hội làm việc với các dự án quốc tế lớn.',
    keywordsForMatch: ['fpt', 'công nghệ', 'đổi mới', 'quốc tế', 'phần mềm'],
  },
  {
    id: 'hr-002',
    type: 'HR',
    level: 'Junior',
    text: 'Tại sao bạn muốn làm việc tại FPT thay vì các công ty product startup?',
    tags: ['motivation', 'career'],
    mustHave: true,
    sampleAnswer: 'FPT có môi trường ổn định, quy trình chuyên nghiệp và cơ hội học hỏi từ các dự án lớn. Tôi muốn xây dựng nền tảng vững chắc trước khi thử sức ở startup.',
    keywordsForMatch: ['ổn định', 'học hỏi', 'quy trình', 'nền tảng', 'dự án lớn'],
  },
  {
    id: 'hr-003',
    type: 'HR',
    level: 'Senior',
    text: 'Bạn nghĩ giá trị cốt lõi "Tôn trọng" của FPT có ý nghĩa như thế nào trong làm việc nhóm?',
    tags: ['culture', 'teamwork', 'values'],
    mustHave: true,
    sampleAnswer: 'Tôn trọng thể hiện qua việc lắng nghe ý kiến đồng nghiệp, tôn trọng thời gian và công sức của người khác, đưa ra phản hồi mang tính xây dựng thay vì phê bình.',
    keywordsForMatch: ['lắng nghe', 'tôn trọng', 'xây dựng', 'đồng nghiệp', 'phản hồi'],
  },
  {
    id: 'hr-004',
    type: 'HR',
    level: 'all',
    text: 'Bạn mong đợi điều gì từ môi trường làm việc tại FPT trong 2 năm tới?',
    tags: ['career', 'expectation'],
    mustHave: false,
    sampleAnswer: 'Tôi mong muốn được tham gia các dự án lớn, có cơ hội thăng tiến lên vị trí Senior và đóng góp vào cộng đồng nội bộ thông qua mentoring.',
    keywordsForMatch: ['dự án lớn', 'thăng tiến', 'mentoring', 'đóng góp', 'senior'],
  },
  {
    id: 'hr-005',
    type: 'HR',
    level: 'Intern',
    text: 'Bạn đã chuẩn bị gì cho buổi phỏng vấn hôm nay?',
    tags: ['preparation'],
    mustHave: false,
    sampleAnswer: 'Tôi đã tìm hiểu về FPT qua website, đọc các bài blog kỹ thuật, ôn lại kiến thức nền tảng về thuật toán và ôn các dự án cá nhân đã làm.',
    keywordsForMatch: ['tìm hiểu', 'ôn tập', 'thuật toán', 'dự án', 'chuẩn bị'],
  },
  {
    id: 'hr-006',
    type: 'HR',
    level: 'Expert',
    text: 'Là một người quản lý, bạn sẽ xây dựng team như thế nào để phù hợp với văn hóa FPT?',
    tags: ['leadership', 'culture', 'management'],
    mustHave: true,
    sampleAnswer: 'Tôi sẽ tạo môi trường psychological safety — team có thể thử nghiệm và sai mà không sợ bị phạt. Tổ chức knowledge sharing hàng tuần, khuyến khích thảo luận mở.',
    keywordsForMatch: ['psychological safety', 'knowledge sharing', 'thảo luận', 'thử nghiệm', 'team'],
  },
];

// Behavioral — STAR-format theo level
const BEHAVIORAL_QUESTIONS = [
  {
    id: 'bh-001',
    type: 'Behavioral',
    level: 'all',
    text: 'Hãy kể về một lần bạn gặp thất bại trong dự án và cách bạn xử lý.',
    tags: ['star', 'failure', 'resilience'],
    mustHave: true,
    sampleAnswer: 'Tình huống: dự án tôi phụ trách bị trễ deadline 2 tuần vì đánh giá sai độ phức tạp. Nhiệm vụ: gỡ bottleneck và bàn giao đúng hạn. Hành động: chia nhỏ task, nhờ support từ senior, daily standup. Kết quả: hoàn thành trễ 3 ngày nhưng học được cách estimate tốt hơn.',
    keywordsForMatch: ['tình huống', 'nhiệm vụ', 'hành động', 'kết quả', 'học được'],
  },
  {
    id: 'bh-002',
    type: 'Behavioral',
    level: 'Junior',
    text: 'Mô tả một tình huống bạn phải học một công nghệ mới trong thời gian ngắn.',
    tags: ['star', 'learning'],
    mustHave: true,
    sampleAnswer: 'Situation: 1 tuần trước sprint tôi được giao dùng GraphQL thay vì REST. Task: xây dựng API trong 5 ngày. Action: đọc docs, làm tutorial, pair-programming với senior. Result: hoàn thành đúng hạn, schema clean.',
    keywordsForMatch: ['học', 'tutorial', 'docs', 'pair-programming', 'hoàn thành'],
  },
  {
    id: 'bh-003',
    type: 'Behavioral',
    level: 'Senior',
    text: 'Bạn đã giúp một thành viên trong team vượt qua khó khăn kỹ thuật như thế nào?',
    tags: ['star', 'mentoring', 'teamwork'],
    mustHave: true,
    sampleAnswer: 'Situation: một bạn junior bị stuck 2 ngày với bug async. Task: giúp đỡ mà không làm thay. Action: hỏi về debugging steps của bạn ấy, gợi ý dùng console.log theo luồng. Result: bạn ấy tự tìm ra bug sau 30 phút, học được phương pháp.',
    keywordsForMatch: ['hỏi', 'gợi ý', 'không làm thay', 'tự tìm ra', 'học được'],
  },
  {
    id: 'bh-004',
    type: 'Behavioral',
    level: 'Expert',
    text: 'Kể về một quyết định khó khăn mà bạn đã đưa ra với tư cách leader, và kết quả của nó.',
    tags: ['star', 'leadership', 'decision'],
    mustHave: true,
    sampleAnswer: 'Situation: team 8 người, cần quyết định cắt 1 feature scope để kịp release. Task: chọn feature nào và thông báo cho stakeholders. Action: phân tích impact, thảo luận với PM, đề xuất cắt tính năng analytics tạm thời. Result: release đúng hạn, tính năng analytics được add vào sprint sau.',
    keywordsForMatch: ['quyết định', 'phân tích', 'thảo luận', 'release', 'stakeholders'],
  },
  {
    id: 'bh-005',
    type: 'Behavioral',
    level: 'all',
    text: 'Mô tả một tình huống bạn phải làm việc với người có cá tính khác biệt.',
    tags: ['star', 'teamwork', 'communication'],
    mustHave: false,
    sampleAnswer: 'Situation: team có bạn remote khác múi giờ, thường trả lời chậm. Task: đảm bảo delivery không bị ảnh hưởng. Action: thiết lập async communication rõ ràng, dùng Loom thay meeting. Result: delivery tăng 20%, friction giảm.',
    keywordsForMatch: ['async', 'communication', 'remote', 'thay thế', 'giảm friction'],
  },
  {
    id: 'bh-006',
    type: 'Behavioral',
    level: 'Senior',
    text: 'Hãy kể về lần bạn phải thuyết phục team đổi hướng kỹ thuật.',
    tags: ['star', 'influence', 'technical'],
    mustHave: false,
    sampleAnswer: 'Situation: team đang dùng Redux cho app nhỏ, gây over-engineering. Task: thuyết phục chuyển sang React Query. Action: viết POC, so sánh metrics, trình bày trong tech talk. Result: team đồng ý, code giảm 40%, performance tăng.',
    keywordsForMatch: ['POC', 'metrics', 'trình bày', 'đồng ý', 'giảm 40%'],
  },
];

// Technical — tham khảo docs/FPT/All.csv
const TECHNICAL_QUESTIONS = [
  {
    id: 'tech-001',
    type: 'Technical',
    level: 'all',
    text: 'Two Sum: Cho một mảng số nguyên nums và một số nguyên target, hãy trả về chỉ số của hai số có tổng bằng target. Bạn sẽ tiếp cận bài này như thế nào và độ phức tạp là gì?',
    tags: ['array', 'hash-table', 'easy', 'algorithm'],
    mustHave: true,
    sampleAnswer: 'Dùng hash map để lưu giá trị và index đã duyệt. Với mỗi phần tử, kiểm tra target - nums[i] có trong map không. Nếu có, trả về 2 index. Độ phức tạp O(n) time, O(n) space.',
    keywordsForMatch: ['hash', 'map', 'o(n)', 'độ phức tạp', 'index', 'duyệt'],
  },
  {
    id: 'tech-002',
    type: 'Technical',
    level: 'Junior',
    text: 'Best Time to Buy and Sell Stock: Cho mảng giá cổ phiếu, tìm lợi nhuận tối đa nếu mua 1 lần và bán 1 lần. Bạn giải bằng thuật toán nào?',
    tags: ['array', 'dynamic-programming', 'easy'],
    mustHave: true,
    sampleAnswer: 'Duyệt một lần, lưu min price đã thấy. Với mỗi giá, tính profit = price - min. Cập nhật max profit. Độ phức tạp O(n) time, O(1) space. Đây là pattern kadane đơn giản.',
    keywordsForMatch: ['min price', 'profit', 'o(n)', 'kadane', 'một lần'],
  },
  {
    id: 'tech-003',
    type: 'Technical',
    level: 'Junior',
    text: 'Palindrome Number: Kiểm tra một số nguyên có phải palindrome không. Cách tiếp cận tối ưu là gì (không convert sang string)?',
    tags: ['math', 'easy'],
    mustHave: true,
    sampleAnswer: 'Số âm không phải palindrome. Đảo ngược nửa số: lấy mod 10 để lấy digit cuối, xây dựng reversed. So sánh nửa đảo với nửa còn lại. Tránh overflow bằng cách chỉ đảo nửa. O(log n) time.',
    keywordsForMatch: ['đảo ngược', 'nửa', 'mod 10', 'log n', 'âm'],
  },
  {
    id: 'tech-004',
    type: 'Technical',
    level: 'Senior',
    text: 'Hãy mô tả cách thiết kế hệ thống URL Shortener (kiểu bit.ly). Bạn sẽ chọn database nào, hashing nào, và xử lý scale như thế nào?',
    tags: ['system-design', 'database', 'scalability'],
    mustHave: true,
    sampleAnswer: 'API POST /shorten nhận long URL, sinh short ID bằng base62 encoding (vd: auto-increment ID), GET /{id} redirect. Dùng NoSQL (Cassandra) để scale dễ. Cache layer (Redis) cho URL hot. CDN edge cho redirect. Để tăng tốc, dùng pre-generated ID pool.',
    keywordsForMatch: ['base62', 'redis', 'cassandra', 'cdn', 'cache', 'scale'],
  },
  {
    id: 'tech-005',
    type: 'Technical',
    level: 'Senior',
    text: 'Find Three Consecutive Integers That Sum to a Given Number: Cho số n, tìm 3 số nguyên liên tiếp có tổng bằng n. Nếu không có trả về rỗng.',
    tags: ['math', 'simulation', 'medium'],
    mustHave: false,
    sampleAnswer: 'Đặt 3 số là (x-1, x, x+1), tổng = 3x. Vậy n phải chia hết cho 3. Nếu có, 3 số là n/3 - 1, n/3, n/3 + 1. Độ phức tạp O(1).',
    keywordsForMatch: ['3x', 'chia hết', 'o(1)', 'n/3'],
  },
  {
    id: 'tech-006',
    type: 'Technical',
    level: 'Expert',
    text: 'Thiết kế hệ thống message queue distributed như Kafka. Làm sao đảm bảo exactly-once semantics và xử lý backpressure?',
    tags: ['system-design', 'distributed', 'kafka'],
    mustHave: true,
    sampleAnswer: 'Kafka đảm bảo exactly-once qua idempotent producer + transactional API. Partition theo key để ordering. Consumer group với offset commit. Backpressure: dùng throttling ở producer hoặc scale consumer. Replication factor 3 với ISR đảm bảo durability.',
    keywordsForMatch: ['idempotent', 'partition', 'consumer group', 'offset', 'isr', 'replication'],
  },
  {
    id: 'tech-007',
    type: 'Technical',
    level: 'Junior',
    text: 'Event Loop trong JavaScript hoạt động như thế nào? Microtask và macrotask khác nhau ra sao?',
    tags: ['javascript', 'event-loop', 'async'],
    mustHave: true,
    sampleAnswer: 'Event loop: call stack rỗng thì lấy task từ microtask queue hết rồi mới đến macrotask queue. Microtask (Promise.then, queueMicrotask) chạy trước macrotask (setTimeout, setInterval). Ví dụ: setTimeout(fn, 0) chạy sau Promise.resolve().',
    keywordsForMatch: ['call stack', 'microtask', 'macrotask', 'queue', 'promise'],
  },
  {
    id: 'tech-008',
    type: 'Technical',
    level: 'Senior',
    text: 'REST vs GraphQL: khi nào nên dùng cái nào? Ưu nhược điểm của từng loại trong context microservice?',
    tags: ['api-design', 'graphql', 'rest'],
    mustHave: false,
    sampleAnswer: 'REST đơn giản, cache HTTP dễ, phù hợp resource-oriented CRUD. GraphQL flexible cho client, giảm over-fetching, nhưng phức tạp caching và N+1. Trong microservice, REST thường cho public API, GraphQL làm BFF layer aggregate nhiều service.',
    keywordsForMatch: ['rest', 'graphql', 'cache', 'bff', 'over-fetching', 'microservice'],
  },
];

export const QUESTION_BANK = {
  HR: HR_QUESTIONS,
  Technical: TECHNICAL_QUESTIONS,
  Behavioral: BEHAVIORAL_QUESTIONS,
};

// Random pick helper — dùng cho room
export function pickQuestionsForSession({ type, level, duration, seed }) {
  const totalCount = duration === 5 ? 3 : duration === 10 ? 5 : 7;
  const mainPool = QUESTION_BANK[type] || [];
  const otherTypes = Object.keys(QUESTION_BANK).filter((t) => t !== type);
  const otherPool = otherTypes.flatMap((t) => QUESTION_BANK[t]);

  // Filter by level
  const filteredMain = mainPool.filter((q) => q.level === 'all' || q.level === level);
  const filteredOther = otherPool.filter((q) => q.level === 'all' || q.level === level);

  // 70% main, 30% other
  const mainCount = Math.ceil(totalCount * 0.7);
  const otherCount = totalCount - mainCount;

  // Simple deterministic pseudo-random based on seed
  const rng = (n) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  const shuffle = (arr) => [...arr].sort(() => rng(arr.length) - 0.5);

  const pickedMain = shuffle(filteredMain).slice(0, mainCount);
  const pickedOther = shuffle(filteredOther).slice(0, otherCount);

  // Interleave
  const result = [];
  let i = 0;
  while (pickedMain.length || pickedOther.length) {
    if (i % 10 < 7 && pickedMain.length) result.push(pickedMain.shift());
    else if (pickedOther.length) result.push(pickedOther.shift());
    else if (pickedMain.length) result.push(pickedMain.shift());
    i++;
  }
  return result.slice(0, totalCount);
}

export { END_PHRASES_VN, END_PHRASES_EN };
