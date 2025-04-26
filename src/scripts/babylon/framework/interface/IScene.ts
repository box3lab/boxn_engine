import type { Scene } from "@babylonjs/core/scene";

/**
 * Scene interface that defines the structure of a scene in the application
 * 场景接口，定义应用程序中场景的结构
 */
export interface IScene {
    id: string;               // Unique identifier for the scene / 场景的唯一标识符
    name: string;             // Display name of the scene / 场景的显示名称
    scene: Scene;             // Babylon.js Scene object / Babylon.js 场景对象
    isActive: boolean;        // Whether the scene is currently active / 场景当前是否处于活动状态
    isLoaded: boolean;        // Whether the scene is loaded in memory / 场景是否已加载到内存
    priority: number;         // Render priority of the scene (lower renders first) / 场景的渲染优先级（较低的优先渲染）
    
    /**
     * Initialize the scene
     * 初始化场景
     */
    initialize(): Promise<void>;
    
    /**
     * Update scene logic
     * 更新场景逻辑
     * @param deltaTime Time elapsed since last update in seconds / 自上次更新以来经过的时间（秒）
     */
    update(deltaTime: number): void;
    
    /**
     * Clean up resources when scene is disposed
     * 场景销毁时清理资源
     */
    dispose(): void;

}