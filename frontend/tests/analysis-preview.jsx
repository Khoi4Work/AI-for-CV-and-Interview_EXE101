// Explicit browser fixture; excluded from production routes/build. No real API/model calls.
import {createRoot} from 'react-dom/client';
import {BrowserRouter,useLocation} from 'react-router-dom';
import {CVProvider} from '../src/features/cv/contexts/CVContext.jsx';
import CVAnalysisResult from '../src/features/cv/pages/CVAnalysisResult.jsx';
import {cvPipelineService} from '../src/features/cv/services/cvPipelineService.js';
import '../src/index.css';
const result={analysisId:'fixture',cvId:'cv-fixture',jdId:'jd-fixture',status:'COMPLETED',phase:'COMPLETED',rubricVersion:'rubric-v1',createdAt:'2026-10-09T12:00:00',
    snapshot:{cvName:'CV kiểm thử BA',jdTitle:'Business Analyst',companyName:'Công ty minh họa kiểm thử',source:'USER',cvText:'Dự án: Phân tích yêu cầu với stakeholder và lập sơ đồ BPMN.',jdText:JSON.stringify({title:'Business Analyst',requirements:['Phân tích yêu cầu với stakeholder','SQL'],source:'https://example.com/fixture'}),cv:{}},
    result:{score:76,summary:'Dữ liệu giả lập để kiểm tra giao diện; không phải kết quả AI thực.',evidencedSkills:Array.from({length:15},(_,i)=>`Kỹ năng có minh chứng ${i+1}`),notEvidencedSkills:Array.from({length:15},(_,i)=>`Yêu cầu chưa có minh chứng ${i+1}`),
        breakdown:[{group:'SKILLS',weight:72.7272727273,points:48.4848484848},{group:'CLARITY',weight:27.2727272727,points:27.2727272727}],
        contributions:[{points:48.4848484848,evidence:{requirementId:'r1',group:'SKILLS',description:'Phân tích yêu cầu',mandatory:true,jdEvidence:{text:'Phân tích yêu cầu với stakeholder'},cvEvidence:[{text:'Phân tích yêu cầu với stakeholder và lập sơ đồ BPMN.'}],assessment:'MET',reason:'Có mô tả hoạt động trong dự án.',suggestion:''}},{points:0,evidence:{requirementId:'r2',group:'SKILLS',description:'SQL',mandatory:false,jdEvidence:{text:'SQL'},cvEvidence:[],assessment:'NOT_EVIDENCED',reason:'CV chưa có mô tả sử dụng SQL.',suggestion:'Bổ sung dự án thật nếu đã có kinh nghiệm.'}},...['Liên hệ','Cấu trúc','Mô tả dự án'].map((name,index)=>({points:9.0909090909,evidence:{requirementId:`clarity-${index}`,group:'CLARITY',description:name,mandatory:false,cvEvidence:[{text:'Dự án: Phân tích yêu cầu với stakeholder và lập sơ đồ BPMN.'}],assessment:'MET',reason:'Checklist minh họa để kiểm tra bố cục.',suggestion:''}}))]}};
cvPipelineService.getAnalysis=async id=>id==='candidate'?{...result,analysisId:'candidate',snapshot:{...result.snapshot,jdTitle:'QA Analyst',jdText:'QA Analyst\nTrách nhiệm: Phân tích yêu cầu và viết test case.\nYêu cầu: Kiểm thử API.'}}:result;
cvPipelineService.startAlternatives=async()=>({status:'COMPLETED',items:[{analysisId:'candidate',title:'QA Analyst',companyName:'Công ty minh họa',source:'SYSTEM',reason:'Ví dụ thẻ gợi ý từ minh chứng đã lưu.'}]});
function Preview(){const location=useLocation();return <><p className="bg-amber-100 p-4 font-bold text-amber-950">Dữ liệu minh họa kiểm thử — không phải kết quả AI thực.</p><CVAnalysisResult key={location.search} analysisId="fixture"/></>;}
createRoot(document.getElementById('root')).render(<BrowserRouter><CVProvider><Preview/></CVProvider></BrowserRouter>);
