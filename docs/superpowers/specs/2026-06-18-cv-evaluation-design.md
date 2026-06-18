# Design Spec: CV Evaluation Feature

**Date**: 2026-06-18
**Status**: Draft
**Goal**: Implement a professional CV evaluation flow that allows users to upload a CV and provide a Job Description (JD) to receive an AI-driven compatibility analysis.

## 🎯 User Experience Flow
The feature follows a linear path to simulate a high-end AI analysis process:
`Header` $\rightarrow$ `CVEvaluation Page` $\rightarrow$ `CVAnalyzing Page` $\rightarrow$ `CVOptimizer Page`

### 1. Entry Point (Header)
- Add "Đánh giá CV" to the main navigation in `Header.jsx`.
- Use a relevant icon (e.g., `BrainCircuit` or `FileSearch` from `lucide-react`).
- Ensure alignment with "Template" and "Interview" items.

### 2. Input Page (`CVEvaluation.jsx`)
A focused portal for data collection.
- **Layout**: Two-column grid on desktop, single column on mobile.
- **Left Column (CV Upload)**:
    - A large drag-and-drop area.
    - Support for PDF and Word formats.
    - Visual feedback: Show filename and file type icon upon selection.
- **Right Column (JD Input)**:
    - Tab-based input:
        - **Tab 1: Text**: Large textarea for pasting JD content.
        - **Tab 2: URL**: Input field for LinkedIn/TopCV links with a "Scan" button.
- **Action**: A prominent "Bắt đầu đánh giá" button at the bottom.
- **Styling**: 
    - Primary Color: `#0b3c8f`.
    - Corners: `rounded-2xl`.
    - Shadows: Subtle, professional shadows.

### 3. Simulation Page (`CVAnalyzing.jsx`)
A transition page to build anticipation and simulate AI processing.
- **Visuals**: Central loading animation (spinner/pulse) with a clean background.
- **AI Mock Sequence**: A sequence of status messages that cycle every 800ms-1s:
    1. "Đang quét cấu trúc CV..." (Scanning CV structure...)
    2. "Đang trích xuất kỹ năng cốt lõi..." (Extracting core competencies...)
    3. "Đang phân tích mô tả công việc..." (Analyzing Job Description...)
    4. "Đang tính toán điểm tương thích..." (Calculating match score...)
    5. "Đang tạo gợi ý cải thiện..." (Generating improvement suggestions...)
- **Logic**: After the sequence completes (approx. 4-5 seconds), automatically redirect to `/cv-optimizer`.

### 4. Result Page (`CVOptimizer.jsx`)
- (Existing page) Display the final results, match score, and suggestions.

## 🛠 Technical Specifications

### File Changes
| File | Action | Purpose |
| :--- | :--- | :--- |
| `frontend/src/pages/cv-template/CVEvaluation.jsx` | Create | Main input interface |
| `frontend/src/pages/cv-template/CVAnalyzing.jsx` | Create | AI simulation page |
| `frontend/src/App.jsx` | Modify | Define routes for the new pages |
| `frontend/src/components/user/Header.jsx` | Modify | Add navigation link |
| `frontend/src/index.css` | Modify | Add animation keyframes for the analyzing page |

### State Management (Mock)
- Use a simple `setTimeout` or `useEffect` loop in `CVAnalyzing.jsx` to manage the status message sequence.
- Use `react-router-dom`'s `useNavigate` for the transition to `CVOptimizer`.

## 🎨 Design System Alignment
- **Primary Color**: `#0b3c8f`
- **Border Radius**: `rounded-2xl`
- **Typography**: Match existing project fonts and sizes.
- **Consistency**: Follow the clean, professional aesthetic defined in `index.css`.
