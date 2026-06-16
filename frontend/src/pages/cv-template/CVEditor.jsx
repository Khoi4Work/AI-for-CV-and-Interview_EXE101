import TopNagivationToolBar from "../../components/template/TopNagivationToolBar.jsx";
import {User} from "lucide-react";
import { useState } from 'react';
import { useApp } from '../../contexts/AppContext.jsx';

export default function CVEditor() {
    const { showToast } = useApp();
    const [zoom, setZoom] = useState(100);

    const handleExport = () => {
        showToast('Xuất PDF thành công! Tệp của bạn đang được tải xuống.', 'success');
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 10, 50));
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden editor-body">
            <TopNagivationToolBar
                onExport={handleExport}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
            />
            <main className="flex-1 overflow-auto flex justify-center p-12 bg-gray-200">

                {/* CV Document */}
                <div
                    className="cv-page-container bg-white flex overflow-hidden shrink-0 shadow-2xl transition-transform duration-200 ease-in-out"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                >

                    {/* Left Sidebar */}
                    <aside className="w-1/3 flex flex-col">
                        {/* Profile Photo Placeholder */}
                        <div
                            className="h-[280px] bg-cv-grey flex items-center justify-center relative overflow-hidden group border-b border-gray-300">
                            <User className="h-20 w-20 text-gray-400 opacity-50"/>
                        </div>

                        {/* Contact and Skills Section */}
                        <div className="flex-1 bg-cv-sidebar-blue p-8 text-white relative">

                            {/* Contact Info */}
                            <section className="mb-10">
                                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 text-[#a3c2f0]">
                                    <UserSvg/>
                                    Liên lạc
                                </h3>
                                <div className="space-y-4 text-xs">
                                    <div className="group">
                                        <p className="font-bold mb-1 opacity-90 text-[13px]">Điện thoại</p>
                                        <p contentEditable={true} className="text-blue-200 outline-none focus:bg-white/10 rounded px-1 transition-colors">--</p>
                                    </div>
                                    <div className="group">
                                        <p className="font-bold mb-1 opacity-90 text-[13px]">Email</p>
                                        <p contentEditable={true} className="text-blue-200 outline-none focus:bg-white/10 rounded px-1 transition-colors">--</p>
                                    </div>
                                    <div className="group">
                                        <p className="font-bold mb-1 uppercase opacity-90 text-[13px]">Ngày sinh</p>
                                        <p contentEditable={true} className="text-blue-200 outline-none focus:bg-white/10 rounded px-1 transition-colors">27/01/1998</p>
                                    </div>
                                    <div className="group">
                                        <p className="font-bold mb-1 opacity-90 text-[13px]">Địa chỉ</p>
                                        <p contentEditable={true} className="text-blue-200 outline-none focus:bg-white/10 rounded px-1 transition-colors">--</p>
                                    </div>
                                </div>
                            </section>

                            {/* Skills List */}
                            <section className="mb-10">
                                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 text-[#a3c2f0]">
                                    <StarSvg/>
                                    Kỹ năng
                                </h3>
                                <ul className="text-xs space-y-2.5 list-disc ml-5 marker:text-blue-400 marker:text-[10px]">
                                    <li contentEditable={true} className="pl-1 outline-none focus:bg-white/10 rounded px-1 transition-colors">Quản lý dự án</li>
                                    <li contentEditable={true} className="pl-1 outline-none focus:bg-white/10 rounded px-1 transition-colors">Giao tiếp tốt</li>
                                    <li contentEditable={true} className="pl-1 leading-tight outline-none focus:bg-white/10 rounded px-1 transition-colors">Nắm bắt kiến thức sản phẩm nhanh</li>
                                    <li contentEditable={true} className="pl-1 outline-none focus:bg-white/10 rounded px-1 transition-colors">Kỹ năng thuyết phục</li>
                                    <li contentEditable={true} className="pl-1 outline-none focus:bg-white/10 rounded px-1 transition-colors">Quản lý thời gian</li>
                                    <li contentEditable={true} className="pl-1 outline-none focus:bg-white/10 rounded px-1 transition-colors">Kỹ năng đàm phán</li>
                                </ul>
                            </section>

                            {/* Software Skills */}
                            <section>
                                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 text-[#a3c2f0]">
                                    <MonitorSvg/>
                                    Kỹ năng phần mềm
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span contentEditable={true} className="outline-none focus:bg-white/10 rounded px-1 transition-colors">Microsoft Word</span>
                                            <div className="flex">
                                                <span className="skill-rating-dot text-[10px]">★</span>
                                                <span className="skill-rating-dot text-[10px]">★</span>
                                                <span className="skill-rating-dot text-[10px]">★</span>
                                                <span className="skill-rating-dot text-[10px]">★</span>
                                                <span
                                                    className="skill-rating-dot-empty text-gray-400 text-[10px]">★</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-blue-900/50 h-1 mt-0.5 rounded-full overflow-hidden">
                                            <div className="bg-orange-400 h-full rounded-full"
                                                 style={{width: '80%'}}></div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span contentEditable={true} className="outline-none focus:bg-white/10 rounded px-1 transition-colors">Microsoft Excel</span>
                                            <div className="flex">
                                                <span className="skill-rating-dot text-[10px]">★</span>
                                                <span className="skill-rating-dot text-[10px]">★</span>
                                                <span className="skill-rating-dot text-[10px]">★</span>
                                                <span className="skill-rating-dot text-[10px]">★</span>
                                                <span className="skill-rating-dot text-[10px]">★</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-blue-900/50 h-1 mt-0.5 rounded-full overflow-hidden">
                                            <div className="bg-orange-400 h-full rounded-full"
                                                 style={{width: '100%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </aside>

                    {/* Main Content Body */}
                    <article className="flex-1 p-[4.5rem] bg-[#f8f9fa] relative">

                        {/* Header / Name */}
                        <header className="mb-12">
                            <h1 contentEditable={true} className="text-[3.25rem] font-black text-cv-text-dark tracking-tighter mb-2 leading-none uppercase outline-none focus:bg-gray-100 rounded px-2 transition-colors">
                                Nguyen Van A
                            </h1>
                            <h2 contentEditable={true} className="text-[1.1rem] text-[#6b7280] uppercase tracking-[0.2em] font-bold outline-none focus:bg-gray-100 rounded px-2 transition-colors">
                                Nhân viên MKT
                            </h2>
                        </header>

                        {/* Summary Section */}
                        <section className="mb-14">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[1.1rem] font-bold text-[#1e3a5f] uppercase tracking-wider relative z-10 bg-[#f8f9fa] pr-4">Mục
                                    tiêu nghề nghiệp</h3>
                                <div className="h-[1px] bg-gray-300 w-full absolute left-0 z-0"></div>
                            </div>
                            <p contentEditable={true} className="text-[13px] leading-[1.8] text-[#334155] text-justify outline-none focus:bg-gray-100 rounded px-2 transition-colors">
                                Tôi là một nhân viên bán hàng chuyên nghiệp, đam mê trong việc xây dựng mối quan hệ với
                                khách hàng và đạt được mục tiêu doanh số. Mục tiêu của tôi là phát triển sự nghiệp trong
                                lĩnh vực bán hàng, áp dụng kỹ năng giao tiếp mạnh mẽ và khả năng thuyết phục để tạo ra
                                giá trị cho khách hàng và đóng góp vào sự thành công của tổ chức.
                            </p>
                        </section>

                        {/* Work Experience Section */}
                        <section>
                            <div className="bg-[#003171] text-white px-6 py-2.5 mb-8 inline-block shadow-sm">
                                <h3 className="text-base font-bold uppercase tracking-widest">Kinh nghiệm làm việc</h3>
                            </div>

                            {/* Experience Items */}
                            <div className="space-y-10">

                                {/* Job Entry 1 */}
                                <div className="relative pl-9">
                                    <div className="timeline-line"></div>
                                    <div className="timeline-dot shadow-sm"></div>

                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 contentEditable={true} className="font-bold text-[#1e3a5f] text-lg outline-none focus:bg-gray-100 rounded px-1 transition-colors">Tên công ty</h4>
                                        <span contentEditable={true} className="text-[11px] font-bold text-gray-500 tracking-wider outline-none focus:bg-gray-100 rounded px-1 transition-colors">03/2019 - 09/2020</span>
                                    </div>
                                    <p contentEditable={true} className="text-[13px] italic text-[#64748b] mb-4 font-medium outline-none focus:bg-gray-100 rounded px-1 transition-colors">Marketing
                                        Manager</p>

                                    <ul className="text-[13px] text-[#475569] space-y-3 list-disc ml-5 leading-relaxed marker:text-gray-400">
                                        <li contentEditable={true} className="outline-none focus:bg-gray-100 rounded px-1 transition-colors">Phụ trách việc tìm kiếm và khai thác thị trường mới, xây dựng danh sách
                                            khách hàng tiềm năng: Tại công ty ABC, tôi đã chịu trách nhiệm tìm kiếm và
                                            khai thác các thị trường mới, từ đó tạo ra danh sách khách hàng tiềm năng.
                                        </li>
                                        <li contentEditable={true} className="outline-none focus:bg-gray-100 rounded px-1 transition-colors">Tôi đã nghiên cứu và đánh giá các xu hướng thị trường để xác định các cơ hội
                                            kinh doanh mới. Tôi đã áp dụng các kỹ thuật tiếp thị và xây dựng mạng lưới
                                            khách hàng để tăng doanh số bán hàng.
                                        </li>
                                    </ul>
                                </div>

                                {/* Job Entry 2 */}
                                <div className="relative pl-9">
                                    <div className="timeline-line"></div>
                                    <div className="timeline-dot bg-gray-400 shadow-sm"></div>

                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 contentEditable={true} className="font-bold text-[#1e3a5f] text-lg outline-none focus:bg-gray-100 rounded px-1 transition-colors">Tên công ty</h4>
                                        <span contentEditable={true} className="text-[11px] font-bold text-gray-500 tracking-wider outline-none focus:bg-gray-100 rounded px-1 transition-colors">03/2019 - 09/2020</span>
                                    </div>
                                    <p contentEditable={true} className="text-[13px] italic text-[#64748b] mb-4 font-medium outline-none focus:bg-gray-100 rounded px-1 transition-colors">Marketing
                                        Manager</p>

                                    <ul className="text-[13px] text-[#475569] space-y-3 list-disc ml-5 leading-relaxed marker:text-gray-400">
                                        <li contentEditable={true} className="outline-none focus:bg-gray-100 rounded px-1 transition-colors">Phụ trách việc tìm kiếm và khai thác thị trường mới, xây dựng danh sách
                                            khách hàng tiềm năng: Tại công ty ABC, tôi đã chịu trách nhiệm tìm kiếm và
                                            khai thác các thị trường mới, từ đó tạo ra danh sách khách hàng tiềm năng.
                                        </li>
                                        <li contentEditable={true} className="outline-none focus:bg-gray-100 rounded px-1 transition-colors">Tôi đã nghiên cứu và đánh giá các xu hướng thị trường để xác định các cơ hội
                                            kinh doanh mới. Tôi đã áp dụng các kỹ thuật tiếp thị và xây dựng mạng lưới
                                            khách hàng để tăng doanh số bán hàng.
                                        </li>
                                    </ul>
                                </div>

                            </div>
                        </section>
                    </article>

                </div>
            </main>
        </div>
    )

    function UserSvg() {
        return (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
        );
    }

    function StarSvg() {
        return (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
        );
    }

    function MonitorSvg() {
        return (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2 2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
        );
    }
}
