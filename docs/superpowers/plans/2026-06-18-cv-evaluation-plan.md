# CV Evaluation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a professional CV evaluation flow: Input $\rightarrow$ AI Simulation $\rightarrow$ Results.

**Architecture:** A set of new React pages integrated into the existing routing system, utilizing a mock-based sequential transition to simulate AI processing.

**Tech Stack:** React 19, Tailwind CSS 4.0, Lucide React, react-router-dom.

## Global Constraints
- Primary Color: `#0b3c8f`
- Border Radius: `rounded-2xl`
- Style: Professional, clean, consistent with `index.css`.
- Mode: Fully mocked data for UI/UX validation.

---

### Task 1: Routing and Header Integration

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/components/user/Header.jsx`

**Interfaces:**
- Produces: Accessible routes `/cv-evaluation` and `/cv-analyzing` via the Header navigation.

- [ ] **Step 1: Define new routes in `App.jsx`**
    - Import `CVEvaluation` and `CVAnalyzing` (placeholders for now).
    - Add `<Route path="/cv-evaluation" element={<CVEvaluation />} />`
    - Add `<Route path="/cv-analyzing" element={<CVAnalyzing />} />`
    - Use placeholders like `() => <div>Placeholder</div>` until the actual components are created in Task 2 & 3.

- [ ] **Step 2: Add "Đánh giá CV" link to `Header.jsx`**
    - Import `BrainCircuit` icon from `lucide-react`.
    - Add a navigation item with label "Đánh giá CV", icon `BrainCircuit`, and `to="/cv-evaluation"`.
    - Ensure it follows the style of "Template" and "Interview" links.

- [ ] **Step 3: Verify navigation**
    - Run app, click "Đánh giá CV", verify it leads to the placeholder page.

- [ ] **Step 4: Commit**
    ```bash
    git add frontend/src/App.jsx frontend/src/components/user/Header.jsx
    git commit -m "feat: add routing and header link for CV evaluation"
    ```

---

### Task 2: Implementation of `CVEvaluation.jsx`

**Files:**
- Create: `frontend/src/pages/cv-template/CVEvaluation.jsx`

**Interfaces:**
- Consumes: `useNavigate` from `react-router-dom`.
- Produces: A UI that captures CV file and JD text/URL, navigating to `/cv-analyzing` on submit.

- [ ] **Step 1: Create basic page structure**
    - Setup a full-page container with professional padding and centering.
    - Use a 2-column grid layout for desktop (`grid-cols-2`).

- [ ] **Step 2: Implement CV Upload Section (Left)**
    - Create a `rounded-2xl` drag-and-drop zone with a dashed border.
    - Add `Upload` icon and text "Kéo thả CV vào đây hoặc nhấn để chọn file".
    - Add a hidden `<input type="file" accept=".pdf,.doc,.docx" />`.
    - Implement state to show the selected filename and a `FileText` icon once a file is uploaded.

- [ ] **Step 3: Implement JD Input Section (Right)**
    - Create a Tab-switcher for "Nội dung JD" and "URL tuyển dụng".
    - **Tab 1 (Text):** A large `textarea` with a subtle border and `#0b3c8f` focus ring.
    - **Tab 2 (URL):** An input field with a "Quét" button (mock action).
    - Style both to match the `rounded-2xl` aesthetic.

- [ ] **Step 4: Implement Action Button**
    - Create a "Bắt đầu đánh giá" button.
    - Style: Background `#0b3c8f`, text white, `rounded-2xl`, transition effect on hover.
    - Logic: `onClick` $\rightarrow$ `navigate('/cv-analyzing')`.

- [ ] **Step 5: Verify UI and Navigation**
    - Check responsiveness (stacks to 1 column on mobile).
    - Verify that clicking "Bắt đầu đánh giá" redirects to the analyzing page.

- [ ] **Step 6: Commit**
    ```bash
    git add frontend/src/pages/cv-template/CVEvaluation.jsx
    git commit -m "feat: implement CV evaluation input page"
    ```

---

### Task 3: Implementation of `CVAnalyzing.jsx`

**Files:**
- Create: `frontend/src/pages/cv-template/CVAnalyzing.jsx`
- Modify: `frontend/src/index.css` (for custom animations)

**Interfaces:**
- Consumes: `useNavigate` from `react-router-dom`.
- Produces: A sequence of AI status messages ending in a redirect to `/cv-optimizer`.

- [ ] **Step 1: Add animation keyframes to `index.css`**
    - Add a `pulse-glow` animation for the central loading circle.

- [ ] **Step 2: Create base UI for `CVAnalyzing.jsx`**
    - Center a professional loading spinner or a pulsing `#0b3c8f` circle.
    - Below the spinner, add a text area for the status message.

- [ ] **Step 3: Implement the Mock Analysis Loop**
    - Define an array of messages:
        1. "Đang quét cấu trúc CV..."
        2. "Đang trích xuất kỹ năng cốt lõi..."
        3. "Đang phân tích mô tả công việc..."
        4. "Đang tính toán điểm tương thích..."
        5. "Đang tạo gợi ý cải thiện..."
    - Use `useState` to track current message index and `useEffect` with `setInterval` (approx 1s per message).

- [ ] **Step 4: Implement Auto-Redirect**
    - Once the last message is reached, add a small delay (500ms) and call `navigate('/cv-optimizer')`.

- [ ] **Step 5: Verify the sequence**
    - Ensure messages transition smoothly and the final redirect works as expected.

- [ ] **Step 6: Commit**
    ```bash
    git add frontend/src/pages/cv-template/CVAnalyzing.jsx frontend/src/index.css
    git commit -m "feat: implement AI analysis simulation page"
    ```

---

### Task 4: Final Integration and Polish

**Files:**
- Review: `frontend/src/App.jsx`, `CVEvaluation.jsx`, `CVAnalyzing.jsx`, `Header.jsx`

- [ ] **Step 1: Full Flow Smoke Test**
    - `Header` $\rightarrow$ `CVEvaluation` $\rightarrow$ `CVAnalyzing` $\rightarrow$ `CVOptimizer`.
    - Verify no broken links or missing icons.

- [ ] **Step 2: Design Audit**
    - Check all corners are `rounded-2xl`.
    - Verify primary color is exactly `#0b3c8f`.
    - Ensure fonts and spacing are consistent with `LandingPage` and `Home`.

- [ ] **Step 3: Commit final polish**
    ```bash
    git add .
    git commit -m "feat: finalize CV evaluation flow and polish UI"
    ```
