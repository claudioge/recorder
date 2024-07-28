'use client';
import React, { useRef, useState, useEffect } from 'react';
import styled from "styled-components";


const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;


interface DisplayMediaOptions {
  video: {
    displaySurface: string;
  };
  audio: boolean;
}

const ScreenCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [log, setLog] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const displayMediaOptions: DisplayMediaOptions = {
    video: {
      displaySurface: "window",
    },
    audio: false,
  };

  const appendToLog = (msg: string): void => {
    setLog((prevLog) => `${prevLog}\n${msg}`);
  };

  const appendErrorToLog = (msg: string): void => {
    setLog((prevLog) => `${prevLog}\nError: ${msg}`);
  };

  const startRecording = (stream: MediaStream): void => {
    setRecordedChunks([]);
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorder.start();
  };

  const startCapture = async (): Promise<void> => {
    setLog('');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions as DisplayMediaStreamOptions);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
      dumpOptionsInfo(stream);
      startRecording(stream);
    } catch (err) {
      appendErrorToLog(err instanceof Error ? err.message : String(err));
    }
  };

  const saveVideo = (): void => {
    if (recordedChunks.length === 0) {
      appendToLog("No recorded data available.");
      return;
    }

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = 'screen-capture.webm';
    a.click();
    window.URL.revokeObjectURL(url);
    appendToLog("Video saved successfully.");
  };

  const stopCapture = (): void => {
    if (videoRef.current && videoRef.current.srcObject) {
      let tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsCapturing(false);
  };

  const dumpOptionsInfo = (stream: MediaStream): void => {
    const videoTrack = stream.getVideoTracks()[0];
    appendToLog("Track settings:");
    appendToLog(JSON.stringify(videoTrack.getSettings(), null, 2));
    appendToLog("Track constraints:");
    appendToLog(JSON.stringify(videoTrack.getConstraints(), null, 2));
  };

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, []);

  return (
    <div>
      <p>
        This example shows you the contents of the selected part of your display.
        Click the Start Capture button to begin.
      </p>
      <p>
        <button onClick={startCapture} disabled={isCapturing}>Start Capture</button>
        &nbsp;
        <button onClick={stopCapture} disabled={!isCapturing}>Stop Capture</button>
        &nbsp;
        <button onClick={saveVideo} disabled={isCapturing || recordedChunks.length === 0}>Save Video</button>
      </p>
      <VideoWrapper>

        <video height={'100%'} width={'100%'} ref={videoRef} autoPlay/>
      </VideoWrapper>
      <br />
      <strong>Log:</strong>
      <br />
      <pre>{log}</pre>
    </div>
  );
};

export default ScreenCapture;