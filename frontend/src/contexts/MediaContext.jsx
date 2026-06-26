import React, { createContext, useContext, useState, useCallback } from 'react';

const MediaContext = createContext(null);

export function MediaProvider({ children }) {
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);

  const updateStream = useCallback((newStream) => {
    setStream(newStream);
  }, []);

  const setCameraState = useCallback((state) => setCameraOn(state), []);
  const setMicState = useCallback((state) => setMicOn(state), []);

  return (
    <MediaContext.Provider value={{
      stream,
      updateStream,
      cameraOn,
      setCameraState,
      micOn,
      setMicState
    }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMediaContext() {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMediaContext must be used within a MediaProvider');
  }
  return context;
}
