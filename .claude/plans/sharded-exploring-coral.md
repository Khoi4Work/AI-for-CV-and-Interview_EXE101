# Implementation Plan: AI CV Pipeline Module

## 1. Overview
This plan details the implementation of the AI CV Pipeline, encompassing file parsing, asynchronous CV optimization, and AI-driven analysis (compatibility score and skill gap).

## 2. Detailed Workflow: Async Optimization Job
To ensure a responsive user experience, CV optimization is handled as an asynchronous process.

### Flow Sequence:
1. **Submission**:
   - User calls `POST api/cv/{id}/optimizations` with a `jd_id` or `jdText`.
   - Backend creates an `OptimizationJob` record with status `ANALYZING`.
   - Backend returns `202 Accepted` with the `jobId`.
   - A Spring `@Async` method is triggered to handle the pipeline.

2. **Processing (The Pipeline)**:
   - **Phase 1: Analysis** (`ANALYZING`):
     - AI analyzes the existing CV content and the target JD.
     - Identifies gaps and areas for improvement.
     - Updates job status to `OPTIMIZING`.
   - **Phase 2: Optimization** (`OPTIMIZING`):
     - AI generates optimized text for specific sections (Experience, Summary, etc.).
     - Generates `CV_Optimization_Logs` for each change.
     - Updates the `CV` entity's `content` and `status`.
   - **Phase 3: Completion**:
     - Final result is stored in `OptimizationJob.result_json`.
     - Job status is set to `OPTIMIZED`. If any step fails, status becomes `FAILED` and `error_message` is populated.

3. **Polling & Result**:
   - User polls `GET api/cv/optimizations/{jobId}` to track progress.
   - Once status is `OPTIMIZED`, user calls `GET api/cv/optimizations/{jobId}/result` to retrieve the final optimized CV and improvement summary.

## 3. Database Changes

### New Table: `Optimization_Jobs`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Unique Job ID |
| **cv_id** | UUID | FK | Reference to `CVs.id` |
| **jd_id** | UUID | FK (Optional) | Reference to `Job_Descriptions.id` |
| **status** | ENUM | NOT NULL | `ANALYZING`, `OPTIMIZING`, `OPTIMIZED`, `FAILED` |
| **progress** | INT | DEFAULT 0 | Percentage completion (0-100) |
| **result_json** | JSONB | NULL | Final optimized content and summary |
| **error_message**| TEXT | NULL | Error details if status is `FAILED` |
| **created_at** | TIMESTAMP| DEFAULT NOW()| Job start time |
| **updated_at** | TIMESTAMP| DEFAULT NOW()| Last update time |

## 4. File Map

### New Files to Create:
- **Entities**:
  - `backend/src/main/java/fpt/su26/exe101/backend/modules/cv/entity/OptimizationJob.java`
- **Repositories**:
  - `backend/src/main/java/fpt/su26/exe101/backend/modules/cv/repository/CVRepository.java`
  - `backend/src/main/java/fpt/su26/exe101/backend/modules/cv/repository/OptimizationJobRepository.java`
- **Services**:
  - `backend/src/main/java/fpt/su26/exe101/backend/modules/cv/service/CVService.java` (Business logic for creation, update, and orchestration)
  - `backend/src/main/java/fpt/su26/exe101/backend/modules/cv/service/CVParserService.java` (Apache Tika/PDFBox integration)
  - `backend/src/main/java/fpt/su26/exe101/backend/modules/cv/service/CVAsyncProcessor.java` (The `@Async` pipeline logic)
- **Controllers**:
  - `backend/src/main/java/fpt/su26/exe101/backend/modules/cv/controller/CVController.java` (API Endpoints)
- **DTOs**:
  - `backend/src/main/java/fpt/su26/exe101/backend/modules/cv/dto/CVUploadRequest.java`
  - `backend/src/main/java/fpt/su26/exe101/backend/modules/cv/dto/OptimizationResponse.java`
  - `backend/src/main/java/fpt/su26/exe101/backend/modules/cv/dto/SkillGapResponse.java`

### Existing Files to Modify:
- `backend/src/main/java/fpt/su26/exe101/backend/modules/ai/service/AIService.java`: Implement Gemini prompts for:
  - Text extraction to structured JSON.
  - CV optimization suggestions.
  - Compatibility scoring and SWOT analysis.
  - Skill gap identification.
- `backend/src/main/java/fpt/su26/exe101/backend/base/config/AsyncConfig.java` (Create if missing): Enable `@EnableAsync`.

## 5. API Mapping (from `Api_Specification.md`)

| Endpoint | Controller Method | Service Method | Logic |
| :--- | :--- | :--- | :--- |
| `POST api/cv/imports` | `importCV` | `CVParserService.parse` $\rightarrow$ `AIService.structure` | Extracts text $\rightarrow$ LLM creates JSON |
| `POST api/cv` | `createCV` | `CVService.saveCV` | Persists structured CV to DB |
| `POST api/cv/{id}/optimizations`| `startOptimization` | `CVService.initJob` $\rightarrow$ `CVAsyncProcessor.process` | Creates Job $\rightarrow$ Triggers Async pipeline |
| `GET api/cv/optimizations/{jobId}`| `getJobStatus` | `OptimizationJobRepository.findById` | Returns current status and progress |
| `GET api/cv/optimizations/{jobId}/result`| `getJobResult` | `OptimizationJobRepository.findById` | Returns `result_json` |
| `GET api/cv/{id}/evaluations` | `evaluateCV` | `AIService.calculateScore` | Compares CV vs JD $\rightarrow$ Returns Score/Analysis |
| `GET api/cv/{id}/skill-gap` | `getSkillGap` | `AIService.analyzeGap` | Identifies missing skills vs JD |

## 6. Verification Plan

### End-to-End Test Case: "Upload to Result"
1. **Upload**: Call `POST api/cv/imports` with a sample PDF. Verify `extractedData` JSON is returned.
2. **Creation**: Call `POST api/cv` with the extracted data. Verify `CV` is created in DB.
3. **Optimization Trigger**: Call `POST api/cv/{id}/optimizations` with a saved `jd_id`. Verify `jobId` and `ANALYZING` status.
4. **Polling**: Call `GET api/cv/optimizations/{jobId}` every 5 seconds. Verify status transitions: `ANALYZING` $\rightarrow$ `OPTIMIZING` $\rightarrow$ `OPTIMIZED`.
5. **Result Retrieval**: Call `GET api/cv/optimizations/{jobId}/result`. Verify `optimizedContent` is present and different from original.
6. **Analysis**: Call `GET api/cv/{id}/skill-gap`. Verify list of `missingSkills` is returned.

### Edge Case Testing:
- **Corrupted File**: Upload an invalid PDF to `api/cv/imports` $\rightarrow$ Expect `400 Bad Request`.
- **Job Failure**: Mock an AI service timeout during optimization $\rightarrow$ Verify job status becomes `FAILED` with error message.
- **Quota Limit**: Trigger optimization when user quota is 0 $\rightarrow$ Expect `402 Payment Required`.
