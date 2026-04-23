"use client";

import { useEffect, useRef, useState } from "react";
import { useHUDStore } from "@/lib/store/hudStore";

type MouseRef = React.RefObject<[number, number]>;

interface SketchfabAPI {
  addEventListener: (event: string, callback: (payload?: unknown) => void, options?: unknown) => void;
  getCameraLookAt: (
    callback: (error: unknown, camera?: { position: number[]; target: number[] }) => void,
  ) => void;
  start: (callback?: (error: unknown) => void) => void;
  setCameraLookAt: (
    position: number[],
    target: number[],
    duration?: number,
    callback?: (error: unknown) => void,
  ) => void;
  setFov: (angle: number, callback?: (error: unknown, value?: number) => void) => void;
  setUserInteraction: (enabled: boolean, callback?: (error: unknown) => void) => void;
  recenterCamera: (duration?: number) => void;
}

interface SketchfabClient {
  init: (
    uid: string,
    options: {
      success: (api: SketchfabAPI) => void;
      error: () => void;
      autostart?: number;
      autospin?: number;
      camera?: number;
      controls?: number;
      preload?: number;
      transparent?: number;
      ui_controls?: number;
      ui_help?: number;
      ui_hint?: number;
      ui_infos?: number;
      ui_inspector?: number;
      ui_settings?: number;
      ui_stop?: number;
      ui_watermark?: number;
      ui_watermark_link?: number;
    },
  ) => void;
}

declare global {
  interface Window {
    Sketchfab?: new (version: string, iframe: HTMLIFrameElement) => SketchfabClient;
  }
}

const MODEL_UID = "4dd7b9979a624a53aa7ce601ea98a707";
const SKETCHFAB_SCRIPT_ID = "sketchfab-viewer-api";
const SKETCHFAB_SCRIPT_SRC = "https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js";
const DEFAULT_CAMERA = {
  position: [0, 0, 6.5],
  target: [0, 0, 0],
};
const FOCUS_CAMERA = {
  position: [0.42, 0.18, 2.35],
  target: [0, 0, 0.08],
};

function bootScript(onReady: () => void, onError: () => void) {
  if (window.Sketchfab) {
    onReady();
    return;
  }

  const existing = document.getElementById(SKETCHFAB_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    existing.addEventListener("load", onReady, { once: true });
    existing.addEventListener("error", onError, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.id = SKETCHFAB_SCRIPT_ID;
  script.src = SKETCHFAB_SCRIPT_SRC;
  script.async = true;
  script.onload = onReady;
  script.onerror = onError;
  document.body.appendChild(script);
}

export default function ThreeScene({ mouseRef }: { mouseRef: MouseRef }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const apiRef = useRef<SketchfabAPI | null>(null);
  const orbitCameraRef = useRef(DEFAULT_CAMERA);
  const orbitAngleRef = useRef(0);
  const [cameraLocked, setCameraLocked] = useState(false);

  const {
    modelStatus,
    modelView,
    modelAutospin,
    modelInteractions,
    lastModelGesture,
    setModelStatus,
    setModelView,
    toggleModelAutospin,
    registerModelGesture,
  } = useHUDStore((state) => ({
    modelStatus: state.modelStatus,
    modelView: state.modelView,
    modelAutospin: state.modelAutospin,
    modelInteractions: state.modelInteractions,
    lastModelGesture: state.lastModelGesture,
    setModelStatus: state.setModelStatus,
    setModelView: state.setModelView,
    toggleModelAutospin: state.toggleModelAutospin,
    registerModelGesture: state.registerModelGesture,
  }));

  useEffect(() => {
    let disposed = false;

    const handleReady = () => {
      if (disposed || !iframeRef.current || !window.Sketchfab) {
        return;
      }

      const client = new window.Sketchfab("1.12.1", iframeRef.current);
      client.init(MODEL_UID, {
        autostart: 1,
        autospin: 0,
        camera: 0,
        controls: 1,
        preload: 1,
        transparent: 1,
        ui_controls: 0,
        ui_help: 0,
        ui_hint: 0,
        ui_infos: 0,
        ui_inspector: 0,
        ui_settings: 0,
        ui_stop: 0,
        ui_watermark: 0,
        ui_watermark_link: 0,
        success: (api) => {
          if (disposed) {
            return;
          }

          apiRef.current = api;
          api.start();
          api.addEventListener("viewerready", () => {
            setModelStatus("ready");
            api.setFov(34);
            api.getCameraLookAt((error, camera) => {
              if (!error && camera) {
                orbitCameraRef.current = camera;
              }
            });
          });
          api.addEventListener("click", () => {
            registerModelGesture("Direct model tap");
          });
          api.addEventListener("camerastop", () => {
            api.getCameraLookAt((error, camera) => {
              if (!error && camera && modelView === "orbit") {
                orbitCameraRef.current = camera;
              }
            });
          });
        },
        error: () => {
          if (!disposed) {
            setModelStatus("error");
          }
        },
      });
    };

    const handleError = () => {
      if (!disposed) {
        setModelStatus("error");
      }
    };

    setModelStatus("booting");
    bootScript(handleReady, handleError);

    return () => {
      disposed = true;
    };
  }, [registerModelGesture, setModelStatus]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || modelStatus !== "ready") {
      return;
    }

    if (modelView === "focus") {
      api.setCameraLookAt(FOCUS_CAMERA.position, FOCUS_CAMERA.target, 1.6);
      registerModelGesture("Camera focus pulse");
      return;
    }

    api.setCameraLookAt(orbitCameraRef.current.position, orbitCameraRef.current.target, 1.2);
  }, [modelStatus, modelView, registerModelGesture]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || modelStatus !== "ready") {
      return;
    }

    if (cameraLocked) {
      api.setUserInteraction(false);
      registerModelGesture("Manual controls locked");
      return;
    }

    api.setUserInteraction(true);
  }, [cameraLocked, modelStatus, registerModelGesture]);

  useEffect(() => {
    if (modelStatus !== "ready" || modelView !== "orbit") {
      return;
    }

    const timer = window.setInterval(() => {
      const api = apiRef.current;
      if (!api) {
        return;
      }

      const [mouseX, mouseY] = mouseRef.current ?? [0, 0];
      orbitAngleRef.current += modelAutospin ? 0.025 : 0;

      const nextPosition = [
        Math.sin(orbitAngleRef.current) * 0.6 + mouseX * 0.35,
        Math.cos(orbitAngleRef.current * 0.7) * 0.12 - mouseY * 0.16,
        6.35 - Math.cos(orbitAngleRef.current) * 0.08,
      ];
      const nextTarget = [mouseX * 0.05, -mouseY * 0.04, 0];

      orbitCameraRef.current = {
        position: nextPosition,
        target: nextTarget,
      };

      api.setCameraLookAt(nextPosition, nextTarget, 0.65);
    }, 140);

    return () => window.clearInterval(timer);
  }, [modelAutospin, modelStatus, modelView, mouseRef]);

  const resetCamera = () => {
    const api = apiRef.current;
    if (!api) {
      return;
    }
    setModelView("orbit");
    orbitCameraRef.current = DEFAULT_CAMERA;
    api.recenterCamera(1.2);
    api.setCameraLookAt(DEFAULT_CAMERA.position, DEFAULT_CAMERA.target, 1.2);
    registerModelGesture("Camera recentered");
  };

  const toggleSpinMode = () => {
    toggleModelAutospin();
    registerModelGesture(modelAutospin ? "Autospin disabled" : "Autospin enabled");
  };

  return (
    <div className="model-layer">
      <div className="model-backdrop" />
      <div className="model-frame">
        <iframe
          ref={iframeRef}
          title="SCI-FI HUD QuillVR model"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
        />
      </div>

      <div className="model-status-chip">
        <span className={`status-dot status-${modelStatus}`} />
        <span>{modelStatus === "ready" ? "Viewer Synced" : modelStatus === "error" ? "Viewer Fault" : "Linking Viewer"}</span>
      </div>

      <div className="model-orbit-grid" />

      <div className="model-controls">
        <div className="hud-kicker">SCULPTED SIGNAL</div>
        <div className="model-title-row">
          <div>
            <div className="hud-heading model-title">SCI-FI HUD / QUILLVR</div>
            <div className="model-subtitle">Sketchfab asset with live camera controls</div>
          </div>
          <div className="model-counter">{String(modelInteractions).padStart(2, "0")} INPUTS</div>
        </div>

        <div className="model-button-row">
          <button
            type="button"
            className={`model-button ${modelView === "focus" ? "active" : ""}`}
            onClick={() => setModelView(modelView === "focus" ? "orbit" : "focus")}
          >
            {modelView === "focus" ? "Return Orbit" : "Focus Core"}
          </button>
          <button type="button" className={`model-button ${modelAutospin ? "active" : ""}`} onClick={toggleSpinMode}>
            {modelAutospin ? "Autospin On" : "Autospin Off"}
          </button>
          <button type="button" className="model-button" onClick={resetCamera}>
            Reset Camera
          </button>
          <button
            type="button"
            className={`model-button ${cameraLocked ? "active" : ""}`}
            onClick={() => setCameraLocked((value) => !value)}
          >
            {cameraLocked ? "Unlock Input" : "Lock Input"}
          </button>
        </div>

        <div className="model-readout">
          <span className="hud-kicker">LAST GESTURE</span>
          <span className="hud-value">{lastModelGesture}</span>
        </div>
      </div>
    </div>
  );
}
