package fpt.su26.exe101.backend.modules.cv.service;

import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Extraction;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Snapshot;

public interface CVEvidenceService {
    record Output(Extraction extraction, String provider, String model, int calls) {}
    Output extract(Snapshot snapshot);
}
