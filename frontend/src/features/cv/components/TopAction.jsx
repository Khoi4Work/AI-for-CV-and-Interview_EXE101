import { Link } from 'react-router-dom';
export default function TopAction() {

    return (
        <>
            {/* Top Actions */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => window.history.back()}
                      className="px-6 py-2 bg-green-800 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                    Quay lại
                </button>
                <nav className="flex items-center text-sm text-white-500 gap-2">
                    <Link to="/" className="hover:text-blue-600 transition-colors">Mẫu CV</Link>
                    <span>›</span>
                    <a href="#" className="hover:text-blue-600 transition-colors">Kỹ thuật</a>
                    <span>›</span>
                    <span className="text-green-700 font-medium">Executive Technical 2026</span>
                </nav>
            </div>
        </>
    )
}