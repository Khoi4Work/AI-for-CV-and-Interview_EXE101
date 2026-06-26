import { goodResumeData, badResumeData } from './cv-mock-data';
import { mockJobDescriptions } from '../../constants/jobDescription';

/**
 * Mock Evaluation Data for CVResult page.
 * This maps specific CVs and JDs to their AI-generated analysis.
 */
export const cvEvaluations = {
    // Scenario 1: High Quality CV matched with a relevant JD
    "good-devops": {
        cv: goodResumeData,
        jd: mockJobDescriptions[0], // DevOps Engineer
        analysis: {
            matchingScore: 88,
            status: "Khá ổn định",
            statusLabel: "Hầu như phù hợp",
            overallFeedback: "Bạn có nền tảng kỹ thuật rất mạnh và tư duy định lượng tuyệt vời. CV của bạn thể hiện rõ tác động thông qua các con số, điều mà các nhà tuyển dụng cấp cao cực kỳ ưa thích.",
            gapAnalysis: {
                matchedSkills: [
                    { name: "Kubernetes", level: "Expert" },
                    { name: "AWS/Cloud", level: "Expert" },
                    { name: "Distributed Systems", level: "Advanced" },
                    { name: "CI/CD Pipelines", level: "Advanced" },
                    { name: "Node.js/Go", level: "Advanced" }
                ],
                missingSkills: [
                    { name: "Terraform / Ansible", level: "Critical" },
                    { name: "Prometheus / Grafana", level: "Important" },
                    { name: "Linux Kernel Tuning", level: "Optional" }
                ]
            },
            atsOptimization: [
                "Slashed cloud hosting costs by 30%",
                "Maintaining 99.99% uptime",
                "Reduced API response times from 500ms to 80ms",
                "Implementing circuit breakers and redundancy strategies",
                "Orchestrated microservices migration"
            ],
            aiSuggestions: {
                professionalSummary: "Tóm tắt của bạn đã rất tốt. Để hoàn hảo hơn cho vị trí DevOps, hãy nhấn mạnh thêm về khả năng 'Infrastructure as Code' (IaC) ngay trong câu đầu tiên.",
                workExperience: "Bạn đã áp dụng công thức định lượng rất tốt. Hãy thử bổ sung chi tiết về cách bạn tối ưu hóa chi phí cloud (ví dụ: dùng Spot Instances hay Right-sizing) để tăng tính thuyết phục."
            }
        }
    },
    // Scenario 2: Poor Quality CV matched with a relevant JD
    "bad-devops": {
        cv: badResumeData,
        jd: mockJobDescriptions[0], // DevOps Engineer
        analysis: {
            matchingScore: 32,
            status: "Cần cải thiện",
            statusLabel: "Chưa phù hợp",
            overallFeedback: "CV của bạn hiện tại quá sơ sài và thiếu minh chứng cho năng lực. Bạn đang mô tả 'nhiệm vụ' thay vì 'thành tựu', điều này khiến nhà tuyển dụng không đánh giá được giá trị thực sự bạn mang lại.",
            gapAnalysis: {
                matchedSkills: [
                    { name: "Java", level: "Basic" },
                    { name: "SQL", level: "Basic" }
                ],
                missingSkills: [
                    { name: "Kubernetes/Docker", level: "Critical" },
                    { name: "Terraform/Ansible", level: "Critical" },
                    { name: "CI/CD (Jenkins/GitLab)", level: "Critical" },
                    { name: "Linux Administration", level: "Critical" },
                    { name: "Monitoring (Prometheus/ELK)", level: "Critical" }
                ]
            },
            atsOptimization: [
                "Automated deployment using Jenkins",
                "Reduced infrastructure cost by X%",
                "Implemented High Availability (HA) clusters",
                "Managed Kubernetes clusters at scale",
                "Optimized system performance by X%"
            ],
            aiSuggestions: {
                professionalSummary: "Hãy loại bỏ những từ sáo rỗng như 'hard-working', 'team player'. Thay vào đó, hãy viết: 'Software Developer với X năm kinh nghiệm trong việc triển khai [Công nghệ A], giúp cải thiện [Kết quả B]'.",
                workExperience: "Thay vì viết 'Responsible for working on the company website', hãy viết 'Tối ưu hóa tốc độ tải trang web công ty giảm từ 3s xuống 1.5s bằng cách áp dụng kỹ thuật caching và nén hình ảnh'."
            }
        }
    }
};
