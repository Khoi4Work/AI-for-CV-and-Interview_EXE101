import {
    Briefcase,
    Zap,
    Bookmark,
    MonitorPlay,
    FileText,
    CheckCircle2
} from 'lucide-react';
import {Link, useParams} from 'react-router-dom';
import TopAction from "../../components/template/TopAction.jsx";

export default function TemplateDetail() {
    const {id} = useParams();
    return (
        <>
            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
                <TopAction/>

                {/* Template Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Left Column: Preview */}
                    <div>
                        <div
                            className="bg-white rounded-xl aspect-[1/1.4] w-full border border-gray-200 custom-shadow overflow-hidden mb-6">
                            <div className="w-full h-full bg-white"></div>
                        </div>
                        {/* Thumbnail Toggles */}
                        <div className="flex gap-4">
                            <div
                                className="w-24 h-32 border-2 border-blue-600 rounded-lg bg-white cursor-pointer overflow-hidden">
                                <div className="w-full h-full bg-white"></div>
                            </div>
                            <div
                                className="w-24 h-32 border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-gray-400 transition-colors overflow-hidden">
                                <div className="w-full h-full bg-white"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Info & CTA */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <div className="flex gap-2 mb-4">
                                <span
                                    className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">AI-Optimized</span>
                                <span
                                    className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">Premium</span>
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">Executive Technical 2024</h1>
                            <div className="flex gap-6 text-gray-600">
              <span className="flex items-center gap-2">
                <Briefcase className="h-5 w-5"/>
                Công nghệ & Kỹ thuật
              </span>
                                <span className="flex items-center gap-2">
                <MonitorPlay className="h-5 w-5"/>
                Nâng cao
              </span>
                            </div>
                        </div>

                        {/* Why this template works */}
                        <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-800 font-bold mb-4">
                                <Zap className="h-5 w-5"/>
                                Tại sao mẫu này hiệu quả?
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                Thiết kế dành riêng cho các nhà lãnh đạo công nghệ, mẫu Executive Technical kết hợp sự
                                tinh tế của phong cách tối giản với cấu trúc dữ liệu chặt chẽ. Hệ thống lưới 12 cột giúp
                                tối ưu hóa không gian cho các dự án phức tạp và kỹ năng chuyên môn sâu, đồng thời tương
                                thích 100% với các hệ thống quét hồ sơ (ATS) hiện đại.
                            </p>
                        </div>

                        {/* Components Included */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Các thành phần
                                bao gồm</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-gray-100/80 px-4 py-2 rounded-lg flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-3 w-3 text-blue-600"/>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Tóm tắt chuyên môn</span>
                                </div>
                                <div className="bg-gray-100/80 px-4 py-2 rounded-lg flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-3 w-3 text-blue-600"/>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Kinh nghiệm làm việc</span>
                                </div>
                                <div className="bg-gray-100/80 px-4 py-2 rounded-lg flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-3 w-3 text-blue-600"/>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Ma trận kỹ năng</span>
                                </div>
                                <div className="bg-gray-100/80 px-4 py-2 rounded-lg flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-3 w-3 text-blue-600"/>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Dự án nổi bật</span>
                                </div>
                                <div className="bg-gray-100/80 px-4 py-2 rounded-lg flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-3 w-3 text-blue-600"/>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Học vấn & Chứng chỉ</span>
                                </div>
                                <div className="bg-gray-100/80 px-4 py-2 rounded-lg flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-3 w-3 text-blue-600"/>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Thành tựu AI</span>
                                </div>
                            </div>
                        </div>

                        {/* Call to Actions */}
                        <div className="flex flex-col gap-4 mt-4">
                            <Link to="/builder"
                                  className="w-full py-4 bg-[#003580] text-white font-bold rounded-xl hover:bg-[#002a66] transition-colors flex items-center justify-center gap-3">
                                <FileText className="h-6 w-6"/>
                                Sử dụng mẫu này
                            </Link>
                            <button
                                className="w-full py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3">
                                <Bookmark className="h-6 w-6"/>
                                Lưu vào danh sách yêu thích
                            </button>
                        </div>
                    </div>
                </div>

                {/* Similar Templates */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Mẫu tương tự</h2>
                            <p className="text-gray-500">Khám phá các lựa chọn khác trong lĩnh vực Kỹ thuật</p>
                        </div>
                        <a href="#" className="text-[#0047AB] font-bold hover:underline">Xem tất cả</a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Card 1 */}
                        <div className="group cursor-pointer">
                            <div
                                className="bg-gray-50 rounded-xl aspect-[1/1.4] w-full border border-gray-200 custom-shadow overflow-hidden mb-4 group-hover:shadow-lg transition-shadow"></div>
                            <div>
                                <h4 className="font-bold text-gray-900">Minimalist Architect</h4>
                                <p className="text-xs text-gray-500">Creative • Miễn phí</p>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="group cursor-pointer">
                            <div
                                className="bg-gray-50 rounded-xl aspect-[1/1.4] w-full border border-gray-200 custom-shadow overflow-hidden mb-4 group-hover:shadow-lg transition-shadow"></div>
                            <div>
                                <h4 className="font-bold text-gray-900">Classic Corporate</h4>
                                <p className="text-xs text-gray-500">Business • Pro</p>
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="group cursor-pointer">
                            <div
                                className="bg-gray-50 rounded-xl aspect-[1/1.4] w-full border border-gray-200 custom-shadow overflow-hidden mb-4 group-hover:shadow-lg transition-shadow"></div>
                            <div>
                                <h4 className="font-bold text-gray-900">Gradient Tech</h4>
                                <p className="text-xs text-gray-500">Tech • Miễn phí</p>
                            </div>
                        </div>
                        {/* Card 4 */}
                        <div className="group cursor-pointer">
                            <div
                                className="bg-gray-50 rounded-xl aspect-[1/1.4] w-full border border-gray-200 custom-shadow overflow-hidden mb-4 group-hover:shadow-lg transition-shadow"></div>
                            <div>
                                <h4 className="font-bold text-gray-900">Modern Academic</h4>
                                <p className="text-xs text-gray-500">Education • Miễn phí</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}