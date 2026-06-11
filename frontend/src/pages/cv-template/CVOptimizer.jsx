import Sidebar from "../../components/template/Sidebar.jsx";
import { Link } from 'react-router-dom';
import { Sparkles, FileText, Upload, CheckCircle2, Zap } from 'lucide-react';

export default function CVOptimizer() {
    return (
        <>
            <main className="max-w-7xl mx-auto px-4 py-8 flex flex-grow w-full gap-8">
                <Sidebar/>
                {/* Main Content */}
                <div className="flex-grow flex gap-8">

                    {/* Left Column: Upload and Preview */}
                    <section className="flex-grow">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Tối ưu hóa từ CV cũ</h1>
                            <p className="text-slate-500 max-w-2xl leading-relaxed">
                                Tải lên CV hiện tại của bạn. AI của chúng tôi sẽ phân tích, trích xuất dữ liệu và gợi ý
                                các
                                từ khóa, cấu trúc tối ưu để giúp bạn nổi bật hơn trong mắt nhà tuyển dụng.
                            </p>
                        </div>

                        {/* Drag and Drop Area */}
                        <div
                            className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center mb-8">
                            <div
                                className="w-12 h-12 bg-blue-50 text-smartfolio-blue rounded-lg flex items-center justify-center mb-4">
                                <Upload className="h-6 w-6"/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1">Kéo và thả tệp tại đây</h3>
                            <p className="text-slate-400 text-sm mb-6">Hỗ trợ PDF, DOCX (Tối đa 10MB)</p>
                            <Link to="/builder"
                                  className="px-8 py-2.5 bg-smartfolio-blue text-white font-semibold rounded-lg shadow-sm hover:bg-blue-800 transition">
                                Chọn tệp từ máy tính
                            </Link>
                        </div>

                        {/* Extracted Content Section */}
                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                            <div
                                className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-white">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5 text-smartfolio-blue"/>
                                    <h4 className="font-bold text-slate-700">Nội dung đã trích xuất</h4>
                                </div>
                                <span
                                    className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">Đã tải: Resume_NguyenVanA.pdf</span>
                            </div>
                            <div className="p-6 space-y-6">

                                {/* Work Experience Item */}
                                <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                                    <h5 className="text-xs font-bold text-smartfolio-blue uppercase mb-3 tracking-wide">Kinh
                                        nghiệm làm việc</h5>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>- Quản lý đội ngũ phát triển phần mềm gồm 10 người.</li>
                                        <li>- Triển khai thành công hệ thống ERP cho doanh nghiệp.</li>
                                        <li>- Tăng hiệu suất làm việc của team lên 20% trong vòng 6 tháng.</li>
                                    </ul>
                                </div>

                                {/* Skills Item */}
                                <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                                    <h5 className="text-xs font-bold text-smartfolio-blue uppercase mb-3 tracking-wide">Kỹ
                                        năng chuyên môn</h5>
                                    <div className="flex flex-wrap gap-2">
                                    <span
                                        className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600">Project Management</span>
                                        <span
                                            className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600">ReactJS</span>
                                        <span
                                            className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600">Python</span>
                                        <span
                                            className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600">Agile/Scrum</span>
                                    </div>
                                </div>

                                {/* Education Item */}
                                <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                                    <h5 className="text-xs font-bold text-smartfolio-blue uppercase mb-3 tracking-wide">Học
                                        vấn</h5>
                                    <p className="text-sm text-slate-600">Đại học Trăm Năm - Kỹ thuật Phần mềm
                                        (2015-2020)</p>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* Right Column: AI Optimization Panel */}
                    <aside className="w-80 flex-shrink-0">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 space-y-6">
                            <div className="flex items-start space-x-3">
                                <div
                                    className="w-10 h-10 bg-smartfolio-blue text-white rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Zap className="h-6 w-6"/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Sẵn sàng tối ưu</h3>
                                    <p className="text-xs text-slate-400">AI đã sẵn sàng nâng cấp CV của bạn</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 text-sm text-slate-600">
                                    <div
                                        className="w-5 h-5 rounded-full border border-smartfolio-blue flex items-center justify-center text-smartfolio-blue">
                                        <CheckCircle2 className="h-3.5 w-3.5"/>
                                    </div>
                                    <span>Cải thiện câu chữ chuyên nghiệp hơn</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-slate-600">
                                    <div
                                        className="w-5 h-5 rounded-full border border-smartfolio-blue flex items-center justify-center text-smartfolio-blue">
                                        <CheckCircle2 className="h-3.5 w-3.5"/>
                                    </div>
                                    <span>Bổ sung từ khóa chuẩn ATS theo ngành nghề</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-slate-600">
                                    <div
                                        className="w-5 h-5 rounded-full border border-smartfolio-blue flex items-center justify-center text-smartfolio-blue">
                                        <CheckCircle2 className="h-3.5 w-3.5"/>
                                    </div>
                                    <span>Giữ nguyên cấu trúc cốt lõi bạn mong muốn</span>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                                <label className="block text-xs font-bold text-smartfolio-blue uppercase mb-2">Vị trí
                                    ứng
                                    tuyển mục tiêu (Tùy chọn)</label>
                                <input
                                    type="text"
                                    className="w-full bg-white border-gray-200 rounded-md text-sm p-3 focus:ring-smartfolio-blue focus:border-smartfolio-blue"
                                    placeholder="Ví dụ: Senior Frontend Developer"
                                />
                            </div>

                            <button
                                className="w-full py-4 bg-smartfolio-blue text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 hover:bg-blue-800 transition">
                                <Sparkles className="h-5 w-5"/>
                                <span>Tối ưu hóa ngay với AI</span>
                            </button>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-black text-smartfolio-blue">85%</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Tỉ lệ vượt qua
                                        ATS
                                    </div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-black text-smartfolio-blue">2x</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Phản hồi phỏng
                                        vấn
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Floating AI Assist (Desktop) */}
                        <div className="fixed bottom-10 right-10 z-40 hidden md:block">
                            <div
                                className="bg-blue-100/80 backdrop-blur-md p-4 rounded-xl border border-blue-200 shadow-xl w-48">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Sparkles className="h-4 w-4 text-smartfolio-blue"/>
                                    <span className="text-xs font-bold text-smartfolio-blue">AI Recommendations</span>
                                </div>
                                <button
                                    className="w-full py-2 bg-smartfolio-blue text-white text-xs font-bold rounded-md hover:bg-blue-800 transition">Try
                                </button>
                            </div>
                        </div>
                    </aside>

                </div>
            </main>
        </>
    )
}