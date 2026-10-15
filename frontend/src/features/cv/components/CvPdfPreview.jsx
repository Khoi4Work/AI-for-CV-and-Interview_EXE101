import EditableCvHtmlTemplate from '../pdf-renderer/templates/EditableCvHtmlTemplate.jsx';
import {useEffect, useRef, useState} from 'react';

const A4_PAGE_HEIGHT_PX = 297 * 96 / 25.4;

export default function CvPdfPreview({cvData, templateId, className = '', showPageMarkers = false, onInlineEdit, onInlineAdd, onInlineMove, onInlineRemove,
    onInlineSectionMove, onInlineSectionReorder, onInlineSectionRemove, onInlineSkillGroupMove, onInlineSkillGroupRemove,
    onInlineSkillRename, onInlineClear}) {
    const layerRef = useRef(null);
    const [pageMarkers, setPageMarkers] = useState([]);
    const [hoveredPage, setHoveredPage] = useState(null);

    const handlePreviewDragOverCapture = event => {
        if (!Array.from(event.dataTransfer?.types || []).includes('text/plain')) return;

        const viewport = event.currentTarget;
        const bounds = viewport.getBoundingClientRect();
        const edgeSize = Math.min(64, bounds.height / 5);
        const pointerFromTop = event.clientY - bounds.top;
        const pointerFromBottom = bounds.bottom - event.clientY;
        let scrollDelta = 0;

        if (pointerFromTop < edgeSize && viewport.scrollTop > 0) {
            scrollDelta = -Math.ceil(4 + (1 - Math.max(0, pointerFromTop) / edgeSize) * 18);
        } else if (pointerFromBottom < edgeSize
            && viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight) {
            scrollDelta = Math.ceil(4 + (1 - Math.max(0, pointerFromBottom) / edgeSize) * 18);
        }

        if (scrollDelta) {
            event.preventDefault();
            viewport.scrollTop += scrollDelta;
        }
    };

    useEffect(() => {
        if (!showPageMarkers) return undefined;

        const layer = layerRef.current;
        const documentElement = layer?.querySelector('.cv-standard-document');
        const cvElement = layer?.querySelector('.cv-standard');
        if (!layer || !documentElement || !cvElement) return undefined;

        const updateMarkers = () => {
            const height = Math.max(documentElement.scrollHeight, cvElement.scrollHeight);
            const pageCount = Math.ceil(height / A4_PAGE_HEIGHT_PX);
            const left = cvElement.offsetLeft;
            const width = cvElement.offsetWidth;
            setPageMarkers(Array.from({length: Math.max(0, pageCount - 1)}, (_, index) => ({
                page: index + 2,
                top: (index + 1) * A4_PAGE_HEIGHT_PX,
                left,
                width,
            })));
        };

        updateMarkers();
        const observer = new ResizeObserver(updateMarkers);
        observer.observe(documentElement);
        observer.observe(cvElement);
        return () => observer.disconnect();
    }, [showPageMarkers, cvData, templateId]);

    return <div className={`h-full w-full overflow-auto bg-white ${className}`} onDragOverCapture={handlePreviewDragOverCapture}>
        <div ref={layerRef} className="cv-preview-page-layer">
            <EditableCvHtmlTemplate data={cvData} templateId={templateId} onEdit={onInlineEdit} onAdd={onInlineAdd} onMove={onInlineMove}
                onRemove={onInlineRemove} onSectionMove={onInlineSectionMove} onSectionReorder={onInlineSectionReorder} onSectionRemove={onInlineSectionRemove}
                onSkillGroupMove={onInlineSkillGroupMove} onSkillGroupRemove={onInlineSkillGroupRemove}
                onSkillRename={onInlineSkillRename} onClear={onInlineClear}/>
            {showPageMarkers && pageMarkers.map(marker => <div key={marker.page}
                className={`cv-preview-page-marker${hoveredPage === marker.page ? ' is-active' : ''}`}
                style={{top: `${marker.top}px`, left: `${marker.left}px`, width: `${marker.width}px`}} aria-hidden="true">
                <span onPointerEnter={() => setHoveredPage(marker.page)} onPointerLeave={() => setHoveredPage(null)}>Trang {marker.page}</span>
            </div>)}
        </div>
    </div>;
}
