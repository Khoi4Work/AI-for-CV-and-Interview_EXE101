import {cvPipelineService} from '../../cv/services/cvPipelineService.js';

function cleanFilename(value) {
    return (value || 'buoi-phong-van')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'buoi-phong-van';
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadInterviewTranscript(data, feedback = null) {
    const answers = new Map((data.answers || []).map((answer) => [
        String(answer.qid ?? answer.questionId ?? answer.id ?? ''),
        answer,
    ]));
    const reviewedEntries = feedback?.transcript || [];
    const reviewed = new Map(reviewedEntries.map((entry) => [String(entry.qid ?? entry.questionId ?? ''), entry]));
    const userTranscript = (data.transcriptLog || []).filter((entry) => entry.role === 'user');
    const lines = [
        'BẢN GHI CUỘC PHỎNG VẤN',
        `Vị trí: ${data.job?.title || data.job?.name || 'Chưa xác định'}`,
        `Loại phỏng vấn: ${data.interviewConfig?.type || 'Chưa xác định'}`,
        `Ngày: ${new Date(data.startedAt || Date.now()).toLocaleString('vi-VN')}`,
        '',
    ];

    (data.questions || []).forEach((question, index) => {
        const questionId = String(question.id ?? question.questionId ?? '');
        const answer = answers.get(questionId) || (data.answers || [])[index];
        const assessment = reviewed.get(questionId) || reviewedEntries[index];
        const transcriptAnswer = userTranscript[index]?.text || '';
        const answerText = answer?.text || answer?.answerText || answer?.answer || assessment?.answer || transcriptAnswer;
        const skipped = Boolean(answer?.skipped ?? answer?.isSkipped)
            || answerText === '(bỏ qua)'
            || assessment?.status === 'skipped';
        lines.push(`NHÀ TUYỂN DỤNG — Câu ${index + 1}`, question.text || '', '');
        lines.push('ỨNG VIÊN', skipped ? '(Đã bỏ qua câu hỏi này)' : (answerText || '(Chưa có câu trả lời)'), '');
        if (assessment?.assessment) lines.push('ĐÁNH GIÁ', assessment.assessment, '');
        for (const suggestion of assessment?.suggestions || []) {
            if (suggestion?.text) lines.push('GỢI Ý', suggestion.text, '');
        }
        lines.push('');
    });

    if (feedback) {
        lines.push('TỔNG KẾT ĐÁNH GIÁ', `Điểm: ${feedback.overallScore ?? '—'}/100`, feedback.summary || '', '');
        if (feedback.strengths?.length) lines.push('Điểm mạnh', ...feedback.strengths.map((item) => `- ${item}`), '');
        if (feedback.improvementAreas?.length) lines.push('Điểm cần cải thiện', ...feedback.improvementAreas.map((item) => `- ${item}`), '');
        if (feedback.recommendations?.length) lines.push('Đề xuất luyện tập', ...feedback.recommendations.map((item) => `- ${item}`), '');
    }

    const content = `\uFEFF${lines.join('\n')}`;
    downloadBlob(new Blob([content], {type: 'text/plain;charset=utf-8'}), `${cleanFilename(data.job?.title || data.job?.name)}-hoi-thoai.txt`);
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

function reportList(items = []) {
    if (!items.length) return '<p class="muted">Chưa có nhận xét.</p>';
    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function buildInterviewReportHtml(data, feedback = null) {
    const questions = data.questions || [];
    const answers = new Map((data.answers || []).map((answer) => [
        String(answer.qid ?? answer.questionId ?? answer.id ?? ''), answer,
    ]));
    const reviewedEntries = feedback?.transcript || [];
    const reviewed = new Map(reviewedEntries.map((entry) => [String(entry.qid ?? entry.questionId ?? ''), entry]));
    const userTranscript = (data.transcriptLog || []).filter((entry) => entry.role === 'user');
    const questionCards = questions.map((question, index) => {
        const questionId = String(question.id ?? question.questionId ?? '');
        const answer = answers.get(questionId) || (data.answers || [])[index];
        const assessment = reviewed.get(questionId) || reviewedEntries[index];
        const answerText = answer?.text || answer?.answerText || answer?.answer || assessment?.answer || userTranscript[index]?.text || '';
        const skipped = Boolean(answer?.skipped ?? answer?.isSkipped) || answerText === '(bỏ qua)' || assessment?.status === 'skipped';
        const status = {
            pass: 'Đạt', improve: 'Cần cải thiện', skipped: 'Đã bỏ qua', reviewed: 'Đã trả lời',
        }[assessment?.status] || (skipped ? 'Đã bỏ qua' : 'Đã trả lời');
        const suggestions = (assessment?.suggestions || []).filter((item) => item?.text);
        return `<article class="question-card">
            <div class="question-heading"><span class="question-number">CÂU ${index + 1}</span><span class="status ${skipped ? 'status-muted' : ''}">${escapeHtml(status)}</span></div>
            <h3>${escapeHtml(question.text || 'Câu hỏi')}</h3>
            <div class="answer"><div class="label">TRẢ LỜI</div><p>${escapeHtml(skipped ? 'Ứng viên đã bỏ qua câu hỏi này.' : (answerText || 'Chưa có câu trả lời.'))}</p></div>
            ${assessment?.assessment ? `<div class="feedback"><div class="label">NHẬN XÉT</div><p>${escapeHtml(assessment.assessment)}</p></div>` : ''}
            ${suggestions.length ? `<div class="feedback"><div class="label">GỢI Ý CẢI THIỆN</div>${reportList(suggestions.map((item) => item.text))}</div>` : ''}
        </article>`;
    }).join('');
    const criteria = (feedback?.criteria || []).map((item) => `<div class="criterion"><div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.score)}/100</strong></div><div class="meter"><i style="width:${Math.max(0, Math.min(100, Number(item.score) || 0))}%"></i></div>${item.feedback ? `<p>${escapeHtml(item.feedback)}</p>` : ''}</div>`).join('');
    const date = new Date(data.startedAt || Date.now()).toLocaleString('vi-VN');
    const job = data.job?.title || data.job?.name || 'Buổi phỏng vấn';
    const type = data.interviewConfig?.type || 'Chưa xác định';

    return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>
        @page{size:A4;margin:15mm 14mm}*{box-sizing:border-box}body{font-family:Arial,"DejaVu Sans",sans-serif;color:#172b3a;font-size:10.5pt;line-height:1.55;margin:0}
        .eyebrow{font-size:9pt;font-weight:700;letter-spacing:1.6px;color:#087e78;text-transform:uppercase}.header{border-bottom:2px solid #0a7776;padding-bottom:15px;margin-bottom:20px}.header h1{font-size:24pt;line-height:1.2;margin:5px 0 12px;color:#102d46}.meta{display:flex;gap:18px;color:#526574;font-size:9.5pt}.meta b{color:#18374f}
        h2{font-size:14pt;color:#143958;margin:0 0 12px}.summary{background:#f1f6f7;border-left:4px solid #087e78;border-radius:3px;padding:13px 16px;margin:18px 0 20px}.score{font-size:20pt;font-weight:700;color:#087e78;margin-right:9px}.score small{font-size:10pt;color:#617382;font-weight:400}.summary p{margin:5px 0 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0 20px}.panel{border:1px solid #dce5e9;border-radius:5px;padding:12px 14px;break-inside:avoid}.panel h3{font-size:11pt;margin:0 0 7px;color:#18374f}.panel ul{padding-left:18px;margin:0}.panel li{margin:3px 0}.muted{color:#758592;margin:0}
        .criterion{margin:11px 0;break-inside:avoid}.criterion>div:first-child{display:flex;justify-content:space-between;gap:12px}.criterion strong{white-space:nowrap}.meter{height:6px;background:#e8eef0;border-radius:6px;margin:5px 0}.meter i{display:block;background:#0b9385;border-radius:6px;height:100%}.criterion p{color:#5a6c79;margin:3px 0}.section-title{border-bottom:1px solid #cbd8df;padding-bottom:7px;margin:25px 0 12px}
        .question-card{border:1px solid #d9e3e8;border-radius:5px;padding:13px 15px;margin:0 0 12px;break-inside:avoid}.question-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.question-number,.label{font-size:8pt;letter-spacing:1px;font-weight:700;color:#087e78}.status{font-size:8.5pt;font-weight:700;color:#087e78;background:#e7f5f1;border-radius:20px;padding:3px 9px}.status-muted{color:#657582;background:#eef1f3}.question-card h3{font-size:11pt;margin:0 0 11px;color:#1c3447}.answer,.feedback{border-top:1px solid #edf1f3;padding-top:8px;margin-top:8px}.answer p,.feedback p{white-space:pre-wrap;margin:4px 0 0}.question-card ul{margin:4px 0 0;padding-left:18px}.footer{border-top:1px solid #dce5e9;margin-top:24px;padding-top:8px;color:#7b8993;font-size:8pt;text-align:center}
    </style></head><body>
        <header class="header"><div class="eyebrow">Báo cáo phỏng vấn</div><h1>${escapeHtml(job)}</h1><div class="meta"><span><b>Hình thức:</b> ${escapeHtml(type)}</span><span><b>Thời gian:</b> ${escapeHtml(date)}</span></div></header>
        ${feedback ? `<section class="summary"><div><span class="score">${escapeHtml(feedback.overallScore ?? '—')}<small>/100</small></span><strong>${escapeHtml(feedback.overallLabel || 'Kết quả đánh giá')}</strong></div><p>${escapeHtml(feedback.summary || '')}</p></section>
        ${(feedback.strengths?.length || feedback.improvementAreas?.length || feedback.recommendations?.length) ? `<div class="grid"><section class="panel"><h3>Điểm mạnh</h3>${reportList(feedback.strengths || [])}</section><section class="panel"><h3>Điểm cần cải thiện</h3>${reportList(feedback.improvementAreas || [])}</section>${feedback.recommendations?.length ? `<section class="panel"><h3>Đề xuất luyện tập</h3>${reportList(feedback.recommendations)}</section>` : ''}</div>` : ''}
        ${criteria ? `<section><h2 class="section-title">Năng lực được đánh giá</h2>${criteria}</section>` : ''}` : '<section class="summary"><strong>Biên bản hội thoại</strong><p>Chưa có đánh giá cho buổi phỏng vấn này.</p></section>'}
        <section><h2 class="section-title">Nội dung phỏng vấn</h2>${questionCards || '<p class="muted">Chưa có câu hỏi trong buổi phỏng vấn.</p>'}</section>
        <footer class="footer">Tài liệu được tạo từ phiên phỏng vấn trên hệ thống.</footer>
    </body></html>`;
}

export async function downloadInterviewReportPdf(data, feedback = null) {
    const filename = `${cleanFilename(data.job?.title || data.job?.name)}-bao-cao-phong-van.pdf`;
    const html = buildInterviewReportHtml(data, feedback);
    const blob = await cvPipelineService.renderPdf({
        html,
        filename,
        options: {
            format: 'A4', landscape: false, printBackground: true, preferCssPageSize: true,
            marginTop: '0mm', marginRight: '0mm', marginBottom: '0mm', marginLeft: '0mm',
        },
    });
    if (!(blob instanceof Blob) || blob.size === 0) throw new Error('PDF service không trả về file PDF hợp lệ.');
    downloadBlob(blob, filename);
    return blob.size;
}

export function downloadLocalInterviewAudio(blob, sessionId, language = 'vi') {
    const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
    downloadBlob(blob, `phong-van-${language}-${String(sessionId).slice(0, 8)}.${extension}`);
}
