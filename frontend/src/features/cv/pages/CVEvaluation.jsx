import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Trash2, TextCursor, CheckCircle2, X, Sparkles, FileQuestion } from 'lucide-react';
import { goodResumeData, badResumeData } from '../constants/cv-mock-data.js';
import { mockJobDescriptions } from '../../../constants/jobDescription.js';
import { useCV } from '../contexts/CVContext.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import { importCV } from '../services/cvImportService.js';
import { cvPipelineService } from '../services/cvPipelineService.js';
import { mapImportedCVData, mapMockDataToCVContext } from '../mapper/cv-data-mapper.js';
import { useApp } from '../../auth/contexts/AppContext.jsx';
import { getApiErrorMessage } from '../../../service/apiClient.js';

const CVEvaluation = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { hasCV, setHasCV, currentCvId, setCurrentCvId, setFullCVData } = useCV();
  const { showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (hasCV !== true) {
      setIsModalOpen(true);
    }
  }, []); // Only check on mount to avoid re-triggering during navigation

  const [selectedFile, setSelectedFile] = useState(null);
  const [demoCv, setDemoCv] = useState(null); // 'good' or 'bad'
  const [jdText, setJdText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setDemoCv(null);
    }
  };

  const handleDemoCvSelect = (type) => {
    setDemoCv(type);
    setSelectedFile(null);
  };

  const handleDemoJdSelect = (id) => {
    const jd = mockJobDescriptions.find(j => j.id === id);
    if (jd) {
      setJdText(jd.description.overview + '\n\n' + jd.description.details.map(d => d.title + ': ' + d.bullets.join(', ')).join('\n'));
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
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      setSelectedFile(file);
      setDemoCv(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setDemoCv(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartEvaluation = async () => {
    if (!selectedFile && !demoCv) {
      alert('Vui lòng tải lên CV của bạn hoặc chọn CV demo.');
      return;
    }
    if (!jdText.trim()) {
      alert('Vui lòng nhập nội dung mô tả công việc (JD).');
      return;
    }
    setIsEvaluating(true);
    try {
      let cvId = demoCv ? null : currentCvId;
      let cvName = demoCv ? (demoCv === 'good' ? 'Good_Resume_MIT.pdf' : 'Bad_Resume_Sample.pdf') : selectedFile.name;
      if (selectedFile) {
        const imported = await importCV(selectedFile);
        cvId = imported.cvId;
        setCurrentCvId(cvId);
        setFullCVData(mapImportedCVData(imported.extractedData));
      } else if (demoCv) {
        const demo = mapMockDataToCVContext(demoCv === 'good' ? goodResumeData : badResumeData);
        const saved = await cvPipelineService.createCV({name: cvName, content: demo});
        cvId = saved?.id;
        setCurrentCvId(cvId);
        setFullCVData(demo);
      }
      if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
        showToast('CV vượt quá giới hạn 5 MB. Hãy chọn tệp nhỏ hơn.', 'error');
        return;
      }
      if (!cvId) throw new Error('Không xác định được CV đã lưu để đánh giá.');
      const analysis = await cvPipelineService.analyzeCV(cvId, jdText.trim());
      const evaluationResult = analysis?.evaluation;
      if (!evaluationResult?.jdId) throw new Error('API đánh giá không trả về JD đã lưu.');
      const {skillGap, feedback} = analysis;
      navigate('/optimizer', {state: {cvId, cvName, jdId: evaluationResult.jdId, jdText: jdText.trim(), evaluationResult, skillGap, feedback}});
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Không thể hoàn tất đánh giá CV.'), 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

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
          <p className="text-on-surface-variant">Tải lên CV và cung cấp mô tả công việc để nhận phân tích chi tiết từ AI.</p>
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
                ${selectedFile || demoCv ? 'border-primary bg-primary/10' : ''}
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />

              {!selectedFile && !demoCv ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary transition-transform group-hover:scale-110 duration-200 border border-outline-variant shadow-inner">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-lg font-medium text-on-surface">Kéo thả CV vào đây hoặc <span className="text-primary font-semibold">Chọn tệp</span></p>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDemoCvSelect('good'); }}
                            className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/30 transition-colors flex items-center gap-1"
                        >
                            <Sparkles className="w-3 h-3" /> CV Tốt (Demo)
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDemoCvSelect('bad'); }}
                            className="px-3 py-1.5 bg-rose-500/20 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                        >
                            <Sparkles className="w-3 h-3" /> CV Tệ (Demo)
                        </button>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1">Hỗ trợ định dạng PDF, DOC, DOCX</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-on-surface font-semibold truncate w-full px-2">
                      {demoCv === 'good' ? 'Good_Resume_MIT.pdf' : demoCv === 'bad' ? 'Bad_Resume_Sample.pdf' : selectedFile?.name}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {demoCv ? 'Mẫu demo đã chọn' : `${(selectedFile.size / 1024).toFixed(1)} KB`}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa tệp
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
                      <div className="flex gap-2 mb-2">
                          <span className="text-xs font-bold text-on-surface-variant uppercase">Demo JD:</span>
                          {mockJobDescriptions.map(jd => (
                              <button
                                  key={jd.id}
                                  onClick={() => handleDemoJdSelect(jd.id)}
                                  className="px-2 py-1 bg-surface-container text-on-surface-variant rounded text-[10px] hover:bg-primary/20 hover:text-primary transition-colors border border-outline-variant"
                                >
                                  {jd.title}
                                </button>
                          ))}
                      </div>
                      <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Dán nội dung chi tiết mô tả công việc vào đây..."
                        className="w-full h-64 p-4 text-sm text-on-surface border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none bg-surface-container"
                      />
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleStartEvaluation}
            disabled={isEvaluating}
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Kiểm tra thông tin CV"
      >
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <FileQuestion className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-on-surface">Bạn đã có CV chưa?</h3>
            <p className="text-on-surface-variant text-sm">
              Nếu bạn đã có CV, hãy tải lên để AI đánh giá. <br />
              Nếu chưa, chúng tôi sẽ giúp bạn tạo một CV chuyên nghiệp.
            </p>
          </div>
          <div className="flex gap-4 w-full ">
            <button
              onClick={() => {
                setHasCV(true);
                setIsModalOpen(false);
              }}
              className="flex-1 px-6 py-3 bg-surface-container text-on-surface font-semibold rounded-2xl hover:bg-surface-container-low transition-colors border border-outline-variant"
            >
              Rồi, tôi có rồi
            </button>
            <button
              onClick={() => {
                setHasCV(false);
                setIsModalOpen(false);
                navigate('/templates');
              }}
              className="flex-1 px-6 py-3 bg-primary text-on-primary font-semibold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              Chưa, tôi muốn tạo mới
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CVEvaluation;
