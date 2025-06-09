import type { BoxNextEngine } from "../BoxNextEngine";
import { EventEmitter } from "../common/EventEmitter";
import { Singleton } from "../common/Singleton";

export class PointerMgr extends Singleton<PointerMgr>() {
    private canvasEl: HTMLCanvasElement | null = null;

    initialize(canvas: HTMLCanvasElement) {
        this.canvasEl = canvas;
        this.setupPointerEvents();
    }

    private setupPointerEvents() {
        document.addEventListener("pointerlockchange", () => {
            EventEmitter.instance.emit("PointerLockChange", this.isPointerLocked)
        })
    }

    requestPointerLock() {
        
        if (!this.canvasEl) {
            console.error("Canvas element is not initialized.");
            return;
        }
        this.canvasEl.requestPointerLock()
            .catch((error) => {
                console.error("Failed to request pointer lock:", error);
            });
    }

    get isPointerLocked(): boolean {
        return document.pointerLockElement ? true : false;
    }
}