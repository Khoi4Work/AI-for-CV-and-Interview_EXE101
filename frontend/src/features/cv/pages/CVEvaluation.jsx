import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Trash2, Link, TextCursor, CheckCircle2, X, Sparkles } from 'lucide-react';
import { goodResumeData, badResumeData } from '../constants/cv-mock-data.js';
import { mockJobDescriptions } from '../../../constants/jobDescription.js';

const CVEvaluation = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [demoCv, setDemoCv] = useState(null); // 'good' or 'bad'
  const [jdTab, setJdTab] = useState('text'); // 'text' or 'url'
  const [jdText, setJdText] = useState('');
  const [jdUrl, setJdUrl] = useState('');
  const [selectedJdId, setSelectedJdId] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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
      setSelectedJdId(id);
      setJdText(jd.description.overview + '\n\n' + jd.description.details.map(d => d.title + ': ' + d.bullets.join(', ')).join('\n'));
      setJdTab('text');
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

  const handleStartEvaluation = () => {
    if (!selectedFile && !demoCv) {
      alert('Vui lòng tải lên CV của bạn hoặc chọn CV demo.');
      return;
    }
    if (jdTab === 'text' && !jdText.trim()) {
      alert('Vui lòng nhập nội dung mô tả công việc (JD).');
      return;
    }
    if (jdTab === 'url' && !jdUrl.trim()) {
      alert('Vui lòng nhập URL tuyển dụng.');
      return;
    }

    // Map the selection to a scenario key for cv-evaluation.js
    let scenario = 'default';
    if (demoCv === 'good') scenario = 'good-devops';
    if (demoCv === 'bad') scenario = 'bad-devops';

    navigate('/cv-analyzing', {
        state: {
            target: '/optimizer',
            scenario: scenario,
            cvName: demoCv ? (demoCv === 'good' ? 'Good_Resume_MIT.pdf' : 'Bad_Resume_Sample.pdf') : selectedFile?.name
        }
    });
  };

  return (
    <div className="relative min-h-screen bg-slate-50 p-6 md:p-12 font-sans antialiased">
      <button
        onClick={() => navigate('/')}
        className="absolute left-6 top-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Đánh giá CV AI</h1>
          <p className="text-slate-600">Tải lên CV và cung cấp mô tả công việc để nhận phân tích chi tiết từ AI.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: CV Upload */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-[#0b3c8f]" />
              <h2 className="text-lg font-semibold text-slate-800">Tải lên CV</h2>
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
                  ? 'border-[#0b3c8f] bg-blue-50'
                  : 'border-slate-300 bg-white hover:border-[#0b3c8f] hover:bg-slate-50'}
                ${selectedFile || demoCv ? 'border-green-500 bg-green-50/30' : ''}
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
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-[#0b3c8f] transition-transform group-hover:scale-110 duration-200">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-lg font-medium text-slate-700">Kéo thả CV vào đây hoặc <span className="text-[#0b3c8f] font-semibold">Chọn tệp</span></p>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDemoCvSelect('good'); }}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors flex items-center gap-1"
                        >
                            <Sparkles className="w-3 h-3" /> CV Tốt (Demo)
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDemoCvSelect('bad'); }}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors flex items-center gap-1"
                        >
                            <Sparkles className="w-3 h-3" /> CV Tệ (Demo)
                        </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Hỗ trợ định dạng PDF, DOC, DOCX</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-900 font-semibold truncate w-full px-2">
                      {demoCv === 'good' ? 'Good_Resume_MIT.pdf' : demoCv === 'bad' ? 'Bad_Resume_Sample.pdf' : selectedFile?.name}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {demoCv ? 'Mẫu demo đã chọn' : `${(selectedFile.size / 1024).toFixed(1)} KB`}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors"
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
              <TextCursor className="w-5 h-5 text-[#0b3c8f]" />
              <h2 className="text-lg font-semibold text-slate-800">Mô tả công việc (JD)</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setJdTab('text')}
                  className={`
                    flex-1 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2
                    ${jdTab === 'text' ? 'bg-white text-[#0b3c8f] border-b-2 border-[#0b3c8f]' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}
                  `}
                >
                  <TextCursor className="w-4 h-4" />
                  Nội dung JD
                </button>
                <button
                  onClick={() => setJdTab('url')}
                  className={`
                    flex-1 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2
                    ${jdTab === 'url' ? 'bg-white text-[#0b3c8f] border-b-2 border-[#0b3c8f]' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}
                  `}
                >
                  <Link className="w-4 h-4" />
                  URL tuyển dụng
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {jdTab === 'text' ? (
                  <div className="flex flex-col gap-4">
                      <div className="flex gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase">Demo JD:</span>
                          {mockJobDescriptions.map(jd => (
                              <button
                                  key={jd.id}
                                  onClick={() => handleDemoJdSelect(jd.id)}
                                  className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                >
                                  {jd.title}
                                </button>
                          ))}
                      </div>
                      <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Dán nội dung chi tiết mô tả công việc vào đây..."
                        className="w-full h-64 p-4 text-sm text-slate-700 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#0b3c8f] focus:border-[#0b3c8f] outline-none transition-all resize-none"
                      />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Link className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={jdUrl}
                        onChange={(e) => setJdUrl(e.target.value)}
                        placeholder="https://linkedin.com/jobs/..."
                        className="w-full pl-11 pr-4 py-3 text-sm text-slate-700 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#0b3c8f] focus:border-[#0b3c8f] outline-none transition-all"
                      />
                    </div>
                    <button
                      onClick={() => alert('Đang quét URL... (Mock action)')}
                      className="px-6 py-3 bg-slate-100 text-slate-700 text-sm font-semibold rounded-2xl hover:bg-slate-200 transition-colors self-start"
                    >
                      Quét URL
                    </button>
                    <div className="h-40 flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 text-xs italic text-center p-4">
                      Kết quả quét URL sẽ hiển thị tại đây sau khi bạn nhấn "Quét URL"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleStartEvaluation}
            className="
              group relative px-10 py-4 bg-[#0b3c8f] text-white font-bold text-lg rounded-2xl
              transition-all duration-200 hover:bg-blue-800 active:scale-95 shadow-lg shadow-blue-900/20
              flex items-center gap-3
            "
          >
            Bắt đầu đánh giá
            <Upload className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CVEvaluation;
