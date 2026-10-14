package fpt.su26.exe101.backend.modules.cv.service;

import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Extraction;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Result;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Snapshot;

public interface CVScoringService { Result score(Snapshot snapshot, Extraction extraction); }
