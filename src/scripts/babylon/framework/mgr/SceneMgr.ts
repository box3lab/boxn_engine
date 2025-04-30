import { Engine } from "@babylonjs/core";
import type { IScene } from "../interface/IScene";
import { Singleton } from "../common/Singleton";
import { PhyMgr } from "./PhyMgr";

/**
 * SceneMgr - Scene Manager class that handles multiple scenes
 * 场景管理器类，用于管理多个场景
 */
export class SceneMgr extends Singleton<SceneMgr>(){
    
    private engine: Engine | null = null;   // Babylon.js engine / Babylon.js 引擎
    private canvas: HTMLCanvasElement | null = null;  // Rendering canvas / 渲染画布
    private scenes: Map<string, IScene> = new Map();  // Map of all scenes / 所有场景的映射
    private activeScenes: Set<string> = new Set();    // Currently active scenes / 当前活动的场景
    private sortedScenes: IScene[] = [];             // Sorted scenes by priority / 按优先级排序的场景
    private lastFrameTime: number = 0;      // Last frame time for delta calculation / 上一帧时间，用于计算增量
    private isRunning: boolean = false;     // Whether render loop is running / 渲染循环是否正在运行


    /**
     * Initialize the Scene Manager with a canvas
     * 使用画布初始化场景管理器
     * @param canvas HTML Canvas element to render to / 用于渲染的 HTML Canvas 元素
     * @param engineOptions Optional engine creation options / 可选的引擎创建选项
     */
    public initialize(canvas: HTMLCanvasElement, engine: Engine): void {
        this.canvas = canvas;
        this.engine = engine;
        
        // // Handle browser window resize
        // // 处理浏览器窗口大小调整
        // window.addEventListener('resize', () => {
        //     if (this.engine) {
        //         this.engine.resize();
        //     }
        // });
    }

    /**
     * Register a scene with the manager
     * 向管理器注册场景
     * @param scene Scene implementation to register / 要注册的场景实现
     */
    public registerScene(scene: IScene): void {
        if (this.scenes.has(scene.id)) {
            console.warn(`Scene with ID ${scene.id} already exists. Overwriting.`);
        }
        
        this.scenes.set(scene.id, scene);
        console.log(`Scene '${scene.name}' (ID: ${scene.id}) registered.`);
    }

    /**
     * Unregister a scene from the manager
     * 从管理器中注销场景
     * @param sceneId ID of the scene to unregister / 要注销的场景 ID
     */
    public unregisterScene(sceneId: string): void {
        const scene = this.scenes.get(sceneId);
        if (scene) {
            // If scene is active, deactivate it first
            // 如果场景处于活动状态，请先停用它
            if (this.activeScenes.has(sceneId)) {
                this.deactivateScene(sceneId);
            }
            
            // Dispose the scene if it's loaded
            // 如果场景已加载，则销毁它
            if (scene.isLoaded) {
                scene.dispose();
            }
            
            this.scenes.delete(sceneId);
            console.log(`Scene '${scene.name}' (ID: ${sceneId}) unregistered.`);
        } else {
            console.warn(`Scene with ID ${sceneId} not found.`);
        }
    }

    /**
     * Load and initialize a scene
     * 加载并初始化场景
     * @param sceneId ID of the scene to load / 要加载的场景 ID
     * @returns Promise that resolves when the scene is loaded / 场景加载完成时解析的 Promise
     */
    public async loadScene(sceneId: string): Promise<void> {
        const scene = this.scenes.get(sceneId);
        if (!scene) {
            throw new Error(`Scene with ID ${sceneId} not found.`);
        }
        
        if (!scene.isLoaded) {
            console.log(`Loading scene '${scene.name}'...`);
            await scene.initialize();
            scene.isLoaded = true;
            console.log(`Scene '${scene.name}' loaded.`);
        } else {
            console.log(`Scene '${scene.name}' already loaded.`);
        }
    }

    /**
     * Unload a scene, freeing its resources
     * 卸载场景，释放其资源
     * @param sceneId ID of the scene to unload / 要卸载的场景 ID
     */
    public unloadScene(sceneId: string): void {
        const scene = this.scenes.get(sceneId);
        if (!scene) {
            console.warn(`Scene with ID ${sceneId} not found.`);
            return;
        }
        
        if (scene.isLoaded) {
            // Deactivate the scene if it's active
            // 如果场景处于活动状态，则停用它
            if (this.activeScenes.has(sceneId)) {
                this.deactivateScene(sceneId);
            }
            
            // Dispose scene resources
            // 销毁场景资源
            scene.dispose();
            scene.isLoaded = false;
            console.log(`Scene '${scene.name}' unloaded.`);
        } else {
            console.log(`Scene '${scene.name}' is not loaded.`);
        }
    }

    /**
     * Activate a scene, making it part of the render loop
     * 激活场景，使其成为渲染循环的一部分
     * @param sceneId ID of the scene to activate / 要激活的场景 ID
     * @param loadIfNeeded Automatically load the scene if not already loaded / 如果尚未加载，则自动加载场景
     */
    public async activateScene(sceneId: string, loadIfNeeded: boolean = true): Promise<void> {
        const scene = this.scenes.get(sceneId);
        if (!scene) {
            throw new Error(`Scene with ID ${sceneId} not found.`);
        }
        
        // Load the scene if needed
        // 如果需要，加载场景
        if (!scene.isLoaded && loadIfNeeded) {
            await this.loadScene(sceneId);
        } else if (!scene.isLoaded) {
            throw new Error(`Scene '${scene.name}' is not loaded.`);
        }
        
        // Add to active scenes if not already active
        // 如果尚未激活，则添加到活动场景中
        if (!this.activeScenes.has(sceneId)) {
            this.activeScenes.add(sceneId);
            scene.isActive = true;
            console.log(`Scene '${scene.name}' activated.`);
            PhyMgr.instance.onSceneActivated(sceneId);
            
            this.refreshSortedScenes();
            // Start render loop if this is the first active scene
            // 如果这是第一个活动场景，则启动渲染循环
            if (!this.isRunning) {
                this.startRenderLoop();
            }
        } else {
            console.log(`Scene '${scene.name}' is already active.`);
        }
    }

    /**
     * Deactivate a scene, removing it from the render loop
     * 停用场景，将其从渲染循环中删除
     * @param sceneId ID of the scene to deactivate / 要停用的场景 ID
     */
    public deactivateScene(sceneId: string): void {
        const scene = this.scenes.get(sceneId);
        if (!scene) {
            console.warn(`Scene with ID ${sceneId} not found.`);
            return;
        }
        
        if (this.activeScenes.has(sceneId)) {
            this.activeScenes.delete(sceneId);
            scene.isActive = false;
            console.log(`Scene '${scene.name}' deactivated.`);
            PhyMgr.instance.onSceneDeactivated(sceneId);
            
            this.refreshSortedScenes();
            // Stop render loop if no active scenes
            // 如果没有活动场景，则停止渲染循环
            if (this.activeScenes.size === 0) {
                this.stopRenderLoop();
            }
        } else {
            console.log(`Scene '${scene.name}' is not active.`);
        }
    }

    /**
     * Get a scene by ID
     * 通过 ID 获取场景
     * @param sceneId ID of the scene to get / 要获取的场景 ID
     * @returns The requested scene or undefined if not found / 请求的场景或 undefined（如果未找到）
     */
    public getScene(sceneId: string): IScene | undefined {
        return this.scenes.get(sceneId);
    }

    /**
     * Get all registered scenes
     * 获取所有已注册的场景
     * @returns Array of all scenes / 所有场景的数组
     */
    public getAllScenes(): IScene[] {
        return Array.from(this.scenes.values());
    }

    /**
     * Get all active scenes
     * 获取所有活动场景
     * @returns Array of active scenes / 活动场景的数组
     */
    public getActiveScenes(): IScene[] {
        return Array.from(this.activeScenes)
            .map(id => this.scenes.get(id))
            .filter((scene): scene is IScene => scene !== undefined);
    }

    /**
     * Refresh the sorted scenes array
     * 刷新排序的场景数组
     */
    public refreshSortedScenes(): void {
        this.sortedScenes = this.getActiveScenes()
            .sort((a, b) => a.priority - b.priority);
    }

    /**
     * Start the render loop
     * 启动渲染循环
     */
    private startRenderLoop(): void {
        if (!this.engine) {
            throw new Error("Engine not initialized. Call initialize() first.");
        }
        
        this.lastFrameTime = performance.now();
        this.isRunning = true;
        
        this.engine.runRenderLoop(() => this.renderLoop());
        console.log("Render loop started.");
    }

    /**
     * Stop the render loop
     * 停止渲染循环
     */
    private stopRenderLoop(): void {
        if (!this.engine) {
            return;
        }
        
        this.engine.stopRenderLoop();
        this.isRunning = false;
        console.log("Render loop stopped.");
    }

    /**
     * Main render loop function
     * 主渲染循环函数
     */
    private renderLoop(): void {
        if (!this.engine) {
            return;
        }
        
        // Calculate delta time in seconds
        // 计算增量时间（秒）
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        // Update all active scenes
        // 更新所有活动场景
        for (const scene of this.sortedScenes) {
            scene.update(deltaTime);
        }
        
        // Render all active scenes
        // 渲染所有活动场景
        for (const scene of this.sortedScenes) {
            scene.scene.render();
        }
    }

    /**
     * Dispose the Scene Manager and all scenes
     * 销毁场景管理器和所有场景
     */
    public dispose(): void {
        // Stop the render loop
        // 停止渲染循环
        this.stopRenderLoop();
        
        // Dispose all scenes
        // 销毁所有场景
        for (const [id, scene] of this.scenes.entries()) {
            if (scene.isLoaded) {
                scene.dispose();
            }
            this.scenes.delete(id);
        }
        
        // Clear active scenes
        // 清除活动场景
        this.activeScenes.clear();
        
        // Dispose engine
        // 销毁引擎
        if (this.engine) {
            this.engine.dispose();
            this.engine = null;
        }
        
        console.log("Scene Manager disposed.");
    }

    /**
     * Get the Babylon.js Engine instance
     * 获取 Babylon.js 引擎实例
     * @returns The engine instance or null if not initialized / 引擎实例或 null（如果未初始化）
     */
    public getEngine(): Engine | null {
        return this.engine;
    }
} 