package fpt.su26.exe101.backend.modules.interview.service.impl;

import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import fpt.su26.exe101.backend.modules.interview.entity.CompanyInfo;
import fpt.su26.exe101.backend.modules.interview.repository.CompanyInfoRepository;
import java.util.Optional;
import fpt.su26.exe101.backend.modules.interview.service.CompanyContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class CompanyContextServiceImpl implements CompanyContextService {
    private final CompanyInfoRepository companies;
    @Value("${cv.analysis.enabled:false}") private boolean schemaEnabled;
    @Override public Context resolve(JobDescription jd) {
        String name=jd==null?null:jd.getCompanyName();
        Context fallback=new Context(name,"",null,null,false);
        if(name==null || name.isBlank() || !schemaEnabled) return fallback;
        Optional<CompanyInfo> company=companies.findFirstByCompanyNameIgnoreCase(name);
        if(company.isEmpty()) return fallback;
        CompanyInfo info = company.get();
        if(!info.isCultureVerified() || info.getCultureReferenceDate()==null
            || info.getCultureSourceUrl()==null || !info.getCultureSourceUrl().startsWith("https://")) return fallback;
        return new Context(name,info.getCultureDescription(),info.getCultureSourceUrl(),info.getCultureReferenceDate(),true);
    }
}
