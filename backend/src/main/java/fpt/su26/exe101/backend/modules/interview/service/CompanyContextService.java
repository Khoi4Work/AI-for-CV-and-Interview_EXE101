package fpt.su26.exe101.backend.modules.interview.service;

import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import java.time.LocalDate;

public interface CompanyContextService {
    record Context(String companyName,String culture,String sourceUrl,LocalDate referenceDate,boolean verified) {}
    Context resolve(JobDescription jd);
}
