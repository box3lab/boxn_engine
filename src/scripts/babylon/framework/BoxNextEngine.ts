import {Engine, type NullEngine, type Scene} from "@babylonjs/core";
import { Singleton } from "./common/Singleton";
import { TestScene } from "../project/example/TestScene";
import { SceneMgr } from "./mgr/SceneMgr";
import { ResMgr } from "./mgr/ResMgr";

/**
 * BoxNextEngine - A custom engine class for Babylon.js
 * 一个用于 Babylon.js 的自定义引擎类
 */
export class BoxNextEngine extends Singleton<BoxNextEngine>(){
    /**
     * 引擎实例
     */
    private engine: Engine | NullEngine | undefined;
    /**
     * 画布实例
     */
    private canvas: HTMLCanvasElement | undefined;

    /**
     * 构造函数
     * @param canvas - 用于渲染的 HTML 画布元素
     */
    public initialize(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new Engine(canvas, true);
        // Handle browser window resize
        // 处理浏览器窗口大小调整
        window.addEventListener('resize', () => {
            if (this.engine) {
                this.engine.resize();
            }
        });
        
        // Initialize Scene Manager
        SceneMgr.instance.initialize(this.canvas, this.engine);
        // Register Test Scene
        SceneMgr.instance.registerScene(new TestScene("test", "test", this.engine, 0));
        // // Load Test Scene
        // SceneMgr.instance.loadScene("test");

        SceneMgr.instance.activateScene("test",true);
        // Set Scene for Resource Manager
        ResMgr.instance.setScene(SceneMgr.instance.getScene("test")?.scene as Scene);
    }

    /**
     * 销毁引擎
     */
    public dispose() {
        this.engine?.dispose();
    }

    /**
     * 获取引擎
     * @returns 引擎
     */
    public getEngine(): Engine | NullEngine | undefined {
        return this.engine;
    }

    /**
     * 获取画布
     * @returns 画布
     */
    public getCanvas(): HTMLCanvasElement | undefined {
        return this.canvas;
    }

}

