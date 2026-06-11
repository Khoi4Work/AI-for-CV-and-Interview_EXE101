import { Link } from 'react-router-dom';
export default function TopAction() {

    return (
        <>
            {/* Top Actions */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => window.history.back()}
                      className="px-6 py-2 bg-[#0047AB] text-white font-medium rounded-lg hover:bg-blue-800 transition-colors">
                    Quay lại
                </button>
                <nav className="flex items-center text-sm text-gray-500 gap-2">
                    <Link to="/" className="hover:text-blue-600 transition-colors">Mẫu CV</Link>
                    <span>›</span>
                    <a href="#" className="hover:text-blue-600 transition-colors">Kỹ thuật</a>
                    <span>›</span>
                    <span className="text-gray-900 font-medium">Executive Technical 2026</span>
                </nav>
            </div>
        </>
    )
}