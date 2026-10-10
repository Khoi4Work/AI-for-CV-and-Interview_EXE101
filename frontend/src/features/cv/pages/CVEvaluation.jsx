import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, FileText, Trash2, TextCursor, CheckCircle2, X, FileQuestion, LoaderCircle, BrainCircuit } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCV } from '../contexts/CVContext.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import { importCV } from '../services/cvImportService.js';
import { cvPipelineService } from '../services/cvPipelineService.js';
import { mapImportedCVData } from '../mapper/cv-data-mapper.js';
import { useApp } from '../../auth/contexts/AppContext.jsx';
import { getApiErrorMessage } from '../../../service/apiClient.js';
import {analysisSelection, createRequestGuard, pollAnalysis} from '../services/analysisFlow.js';
import {formatJD, jdSourceLabel} from '../../../utils/jdContent.js';

const MAX_CV_FILE_SIZE = 5 * 1024 * 1024;

function getCVTargetRole(cvContent) {
  if (cvContent?.targetRoleOrigin !== 'EXPLICIT') return '';
  if (cvContent?.professionalTitle?.trim()) return cvContent.professionalTitle.trim();
  return '';
}

function getCVFileError(file) {
  const extension = file?.name?.split('.').pop()?.toLowerCase();
  if (!['pdf', 'doc', 'docx'].includes(extension)) return 'Chỉ hỗ trợ CV định dạng PDF, DOC hoặc DOCX.';
  if (file.size > MAX_CV_FILE_SIZE) return 'CV vượt quá giới hạn 5 MB. Hãy chọn tệp nhỏ hơn.';
  return '';
}

const CVEvaluation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const requestGuard = useRef(createRequestGuard());
  const analysisController = useRef(null);
  const idempotency = useRef(null);
  const derivedFromJdId = useRef(null);
  const startInFlight = useRef(false);
  const { currentCvId, setCurrentCvId, setFullCVData } = useCV();
  const { showToast } = useApp();
  const continuedFlow = location.state?.continueEvaluation;
  const createdCV = location.state?.createdCV;
  const initialCV = continuedFlow?.cv || createdCV || null;
  const [selectedFile, setSelectedFile] = useState(null);
  const [jdText, setJdText] = useState(continuedFlow?.jdText || '');
  const [importedCV, setImportedCV] = useState(initialCV);
  const [previewRecommendation, setPreviewRecommendation] = useState(null);
  const [jdRecommendations, setJdRecommendations] = useState([]);
  const [selectedRecommendationKey, setSelectedRecommendationKey] = useState(null);
  const [isFindingJDs, setIsFindingJDs] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStep, setEvaluationStep] = useState(0);
  const [evaluationPhase, setEvaluationPhase] = useState('QUEUED');

  const evaluationStages = [
    { title: 'Đọc CV', description: 'Đang kiểm tra tệp và trích xuất nội dung CV.', icon: FileQuestion },
    { title: evaluationPhase === 'QUEUED' ? 'Đang chờ xử lý' : 'Đối chiếu CV với JD', description: evaluationPhase === 'QUEUED' ? 'Yêu cầu đánh giá đã được ghi nhận.' : 'Đang đối chiếu yêu cầu JD và kiểm tra minh chứng trong CV.', icon: BrainCircuit },
  ];

  useEffect(() => {
    const guard = requestGuard.current;
    return () => { guard.cancel(); analysisController.current?.abort(); };
  }, []);
  useEffect(() => {
    if (!initialCV?.cvId) return undefined;
    const guard = requestGuard.current;
    const token = guard.next();
    Promise.resolve().then(() => setIsFindingJDs(true))
      .then(() => cvPipelineService.recommendJDs(initialCV.cvId))
      .then(items => {if (requestGuard.current.current(token)) setJdRecommendations(items || []);})
      .catch(error => {if (requestGuard.current.current(token)) showToast(getApiErrorMessage(error, 'Không thể tìm JD.'), 'error');})
      .finally(() => {if (requestGuard.current.current(token)) setIsFindingJDs(false);});
    return () => guard.cancel();
  }, [initialCV, showToast]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = getCVFileError(file);
      if (error) {
        showToast(error, 'error');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      setImportedCV(null);
      setJdRecommendations([]);
      setSelectedRecommendationKey(null);
      setJdText('');
      void findJDsForCV(file, null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const error = getCVFileError(file);
    if (error) {
      showToast(error, 'error');
      return;
    }
    setSelectedFile(file);
    setImportedCV(null);
    setJdRecommendations([]);
    setSelectedRecommendationKey(null);
    setJdText('');
    void findJDsForCV(file, null);
  };

  const removeFile = () => {
    requestGuard.current.cancel();
    setIsFindingJDs(false);
    setSelectedFile(null);
    setImportedCV(null);
    setJdRecommendations([]);
    setSelectedRecommendationKey(null);
    setJdText('');
    setCurrentCvId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedRecommendation = jdRecommendations.find(
    (recommendation) => `${recommendation.source}-${recommendation.id}` === selectedRecommendationKey,
  ) || null;

  const handleStartEvaluation = async () => {
    if (startInFlight.current) return;
    if (!selectedFile && !importedCV) {
      showToast('Hãy tải CV lên hoặc tạo CV trước khi đánh giá.', 'error');
      return;
    }
    if (!jdText.trim()) {
      showToast('Hãy chọn JD được gợi ý hoặc dán nội dung JD cần đánh giá.', 'error');
      return;
    }
    const fileError = selectedFile ? getCVFileError(selectedFile) : '';
    if (fileError) {
      showToast(fileError, 'error');
      return;
    }
    setIsEvaluating(true);
    startInFlight.current=true;
    setEvaluationStep(0);
    try {
      const imported = importedCV || await importCV(selectedFile);
      const cvId = imported.cvId || currentCvId;
      const cvName = importedCV?.cvName || selectedFile?.name || 'CV đã lưu';
      setImportedCV((current) => current || {...imported, cvName});
      setCurrentCvId(cvId);
      setFullCVData(mapImportedCVData(imported.extractedData));
      if (!cvId) throw new Error('Không xác định được CV đã lưu để đánh giá.');
      setEvaluationStep(1);
      const selection = analysisSelection(selectedRecommendation, jdText);
      if(!selection.jdId && derivedFromJdId.current) selection.derivedFromJdId=derivedFromJdId.current;
      const fingerprint = JSON.stringify({cvId, selection});
      if (idempotency.current?.fingerprint !== fingerprint) idempotency.current = {fingerprint, key:crypto.randomUUID()};
      analysisController.current = new AbortController();
      const started = await cvPipelineService.analyzeCV(cvId, selection, idempotency.current.key);
      if (!started?.analysisId) throw new Error('API không trả về analysisId.');
      setEvaluationPhase(started.phase);
      const result = started.status === 'COMPLETED' ? started : await pollAnalysis(cvPipelineService.getAnalysis, started.analysisId, {signal:analysisController.current.signal,onUpdate:state=>setEvaluationPhase(state.phase)});
      if (result.status !== 'COMPLETED') {idempotency.current=null;throw new Error(result.error || 'Chưa có kết quả đánh giá.');}
      navigate(`/optimizer?analysisId=${result.analysisId}`);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Không thể hoàn tất đánh giá CV.'), 'error');
    } finally {
      setIsEvaluating(false);
      startInFlight.current=false;
    }
  };

  const findJDsForCV = async (file, saved) => {
    if (!file && !saved) {
      showToast('Hãy chọn CV ở khung bên trái trước khi tìm JD phù hợp.', 'error');
      return;
    }
    const fileError = file ? getCVFileError(file) : '';
    if (fileError) {
      showToast(fileError, 'error');
      return;
    }
    setIsFindingJDs(true);
    const token = requestGuard.current.next();
    try {
      const imported = saved || await importCV(file);
      if (!requestGuard.current.current(token)) return;
      if (!imported?.cvId) throw new Error('Không xác định được CV đã lưu để tìm JD.');
      const cvName = saved?.cvName || file?.name || 'CV đã tạo';
      setImportedCV({...imported, cvName});
      setCurrentCvId(imported.cvId);
      setFullCVData(mapImportedCVData(imported.extractedData));
      const recommendations = await cvPipelineService.recommendJDs(imported.cvId);
      if (!requestGuard.current.current(token)) return;
      setJdRecommendations(recommendations || []);
      if (!recommendations?.length) {
        showToast('Không có JD phù hợp.', 'info');
      }
    } catch (error) {
      if (requestGuard.current.current(token)) showToast(getApiErrorMessage(error, 'Không thể tìm JD phù hợp với CV.'), 'error');
    } finally {
      if (requestGuard.current.current(token)) setIsFindingJDs(false);
    }
  };
  const handleFindJDs = () => findJDsForCV(selectedFile, importedCV);

  const selectRecommendation = (recommendation) => {
    derivedFromJdId.current=null;
    setJdText(recommendation.content || '');
    setSelectedRecommendationKey(`${recommendation.source}-${recommendation.id}`);
    setPreviewRecommendation(null);
    showToast(`Đã chọn JD: ${recommendation.title}`, 'success');
  };

  if (isEvaluating) {
    const activeStage = evaluationStages[Math.min(evaluationStep, evaluationStages.length - 1)];
    const ActiveIcon = activeStage.icon;

    return (
      <main className="fixed inset-0 z-[1000] flex min-h-screen w-screen items-center justify-center overflow-y-auto bg-surface px-4 py-10 text-on-surface" style={{boxSizing: 'border-box', width: '100vw'}} aria-busy="true">
        <section className="flex flex-col items-center gap-8 text-center" style={{boxSizing: 'border-box', width: 'min(42rem, calc(100vw - 2rem))', minWidth: 'min(18rem, calc(100vw - 2rem))', maxWidth: 'calc(100vw - 2rem)', flex: '0 0 auto'}} role="status" aria-live="polite">
          <div className="relative flex h-64 w-64 items-center justify-center" aria-hidden="true">
            <div className="absolute h-64 w-64 animate-pulse-glow rounded-full bg-primary/10" />
            <div className="absolute h-48 w-48 animate-pulse-glow rounded-full bg-primary/15 [animation-delay:0.5s]" />
            <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-primary text-white shadow-xl">
              <ActiveIcon className="h-14 w-14" />
            </div>
            <LoaderCircle className="absolute h-40 w-40 animate-spin text-primary/80" strokeWidth={1.5} />
          </div>

          <div className="w-full px-4" style={{boxSizing: 'border-box', width: '100%'}}>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">Phân tích CV bằng AI</p>
            <div className="mb-3 flex min-h-9 items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={evaluationStep}
                  initial={{opacity: 0, y: 8}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -8}}
                  transition={{duration: 0.25}}
                  className="text-center text-2xl font-bold text-on-surface sm:text-3xl"
                >
                  {activeStage.title}
                </motion.h1>
              </AnimatePresence>
            </div>
            <p className="mx-auto mb-8 w-full text-center text-sm leading-6 text-on-surface-variant">{activeStage.description}</p>

            <div className="mb-2 text-left text-xs font-semibold text-on-surface-variant">Trạng thái xử lý</div>
            <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-surface-container-high" role="progressbar" aria-label={activeStage.title} aria-valuetext={activeStage.title}>
              <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
            </div>
            <div className="flex w-full items-center justify-between gap-2 text-[11px] text-on-surface-variant sm:text-xs">
              {evaluationStages.map((stage, index) => {
                const StageIcon = stage.icon;
                const isComplete = index < evaluationStep;
                const isCurrent = index === evaluationStep;
                return (
                  <div key={stage.title} className={`flex min-w-0 flex-1 flex-col items-center gap-2 ${isCurrent ? 'text-primary' : isComplete ? 'text-on-surface' : 'opacity-50'}`}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container">
                      {isComplete ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : isCurrent ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <StageIcon className="h-4 w-4" aria-hidden="true" />}
                    </span>
                    <span className="max-w-full text-center leading-tight">{stage.title}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-7 text-xs text-on-surface-variant">Quá trình có thể mất một chút thời gian. Bạn có thể chờ trong khi AI hoàn tất đánh giá.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12 font-sans antialiased text-on-surface">
      <button
        onClick={() => navigate('/')}
        className="absolute left-6 top-6 p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-bold text-on-surface mb-2">Đánh giá CV AI</h1>
          <p className="text-on-surface-variant">Tải CV lên để hệ thống tìm JD phù hợp, hoặc dán JD riêng để đánh giá.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: CV Upload */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-on-surface">Tải lên CV</h2>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative group cursor-pointer border-2 border-dashed transition-all duration-200
                p-10 flex flex-col items-center justify-center text-center min-h-[300px] rounded-2xl
                ${isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-outline-variant bg-surface-container hover:border-primary hover:bg-surface-container-low'}
                ${selectedFile || importedCV ? 'border-primary bg-primary/10' : ''}
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />

              {!selectedFile && !importedCV ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary transition-transform group-hover:scale-110 duration-200 border border-outline-variant shadow-inner">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium text-on-surface">Kéo thả CV vào đây hoặc <span className="text-primary font-semibold">Chọn tệp</span></p>
                  <p className="text-sm text-on-surface-variant mt-1">PDF, DOC, DOCX · Tối đa 5 MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-on-surface font-semibold truncate w-full px-2">
                      {selectedFile?.name || importedCV?.cvName || 'CV đã tạo'}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'CV đã lưu trong tài khoản'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                      setImportedCV(null);
                      setJdRecommendations([]);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Bỏ CV này
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: JD Input */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <TextCursor className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-on-surface">Mô tả công việc (JD)</h2>
            </div>

            <div className="glass-panel rounded-2xl shadow-sm overflow-hidden border border-outline-variant">
              {/* Content */}
              <div className="p-6">
                  <div className="flex flex-col gap-4">
                      <button
                        type="button"
                        onClick={handleFindJDs}
                        disabled={(!selectedFile && !importedCV) || isFindingJDs || isEvaluating}
                        className="w-full rounded-xl border border-primary px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isFindingJDs ? 'Đang đọc CV và tìm JD...' : 'Tìm JD phù hợp với CV'}
                      </button>
                      {jdRecommendations.length > 0 && (
                        <section className="space-y-2" aria-label="JD được gợi ý">
                          {getCVTargetRole(importedCV?.extractedData) ? (
                            <p className="text-sm text-on-surface-variant">
                              CV có nêu vị trí <strong className="text-on-surface">{getCVTargetRole(importedCV?.extractedData)}</strong>. Các JD dưới đây được tìm theo vị trí đó; hãy xem nội dung và chọn JD muốn đánh giá.
                            </p>
                          ) : (
                            <p className="text-sm text-on-surface-variant">
                              CV chưa nêu vị trí ứng tuyển. Dựa trên kỹ năng, kinh nghiệm và dự án trong CV, hệ thống gợi ý các vị trí dưới đây. Hãy xem JD và chọn vị trí phù hợp để tiếp tục.
                            </p>
                          )}
                          {jdRecommendations.map((recommendation) => (
                            <article
                              key={`${recommendation.source}-${recommendation.id}`}
                              className={`w-full rounded-xl border p-3 text-left transition-colors ${selectedRecommendationKey === `${recommendation.source}-${recommendation.id}` ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container'}`}
                            >
                              <h3 className="font-semibold text-on-surface">{recommendation.title}</h3>
                              <p className="mt-1 text-xs text-on-surface-variant">
                                {[recommendation.companyName, recommendation.industry, recommendation.experienceLevel]
                                  .filter(Boolean).join(' · ') || 'JD cá nhân'}
                              </p>
                              <span className="mt-1 inline-block rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] text-on-surface-variant">
                                {jdSourceLabel(recommendation.source)}
                              </span>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewRecommendation(recommendation)}
                                  className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high"
                                >
                                  Xem JD đầy đủ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => selectRecommendation(recommendation)}
                                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary hover:opacity-90"
                                >
                                  Chọn JD này
                                </button>
                              </div>
                            </article>
                          ))}
                        </section>
                      )}
                      <label htmlFor="evaluation-jd" className="text-sm font-medium text-on-surface">
                        JD dùng để đánh giá
                      </label>
                      <textarea
                        id="evaluation-jd"
                        value={selectedRecommendation ? formatJD(selectedRecommendation.content) : jdText}
                        onChange={(e) => {
                          setJdText(e.target.value);
                          setSelectedRecommendationKey(null);
                        }}
                        readOnly={Boolean(selectedRecommendation)}
                        placeholder="Chọn một JD được gợi ý hoặc dán JD riêng vào đây..."
                        className="w-full h-64 p-4 text-sm text-on-surface border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none bg-surface-container"
                      />
                      {selectedRecommendation && <button type="button" onClick={() => {derivedFromJdId.current=selectedRecommendation.id;setSelectedRecommendationKey(null);setJdText(formatJD(selectedRecommendation.content));}} className="text-sm font-semibold text-primary">Dùng bản sao để chỉnh JD riêng</button>}
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleStartEvaluation}
            disabled={isEvaluating || isFindingJDs || !importedCV?.cvId || !jdText.trim()}
            className="
              group relative px-10 py-4 bg-primary text-on-primary font-bold text-lg rounded-2xl
              transition-all duration-200 hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20
              flex items-center gap-3
            "
          >
            {isEvaluating ? 'Đang đánh giá...' : 'Bắt đầu đánh giá'}
            <Upload className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <Modal
        isOpen={Boolean(previewRecommendation)}
        onClose={() => setPreviewRecommendation(null)}
        title={previewRecommendation?.title || 'Nội dung JD'}
      >
        {previewRecommendation && (
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">{jdSourceLabel(previewRecommendation.source)}</p>
            <p className="text-sm font-medium text-on-surface">
              {[previewRecommendation.companyName, previewRecommendation.industry, previewRecommendation.experienceLevel]
                .filter(Boolean).join(' · ')}
            </p>
            <div className="max-h-[55vh] overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-outline-variant bg-surface-container p-4 text-sm leading-6 text-on-surface custom-scrollbar">
              {formatJD(previewRecommendation.content) || 'JD này chưa có nội dung chi tiết.'}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => selectRecommendation(previewRecommendation)}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary hover:opacity-90"
              >
                Chọn JD này
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CVEvaluation;
