import type { Engine } from "@babylonjs/core";
import type { Scene } from "@babylonjs/core/scene";
import type { IGameEntity } from "./IGameEntity";

/**
 * Scene interface that defines the structure of a scene in the application
 * 场景接口，定义应用程序中场景的结构
 */
export interface IScene {
    /**
     * The unique identifier of the scene.
     * 场景的唯一标识符。
     */     
    id: string;             

    /**
     * The display name of the scene.
     * 场景的显示名称。
     */
    name: string;        

    /**
     * The Babylon.js Scene object.
     * Babylon.js 场景对象。
     */
    scene: Scene;          

    /**
     * Whether the scene is currently active.
     * 场景当前是否处于活动状态。
     */
    isActive: boolean;       

    /**
     * Whether the scene is loaded in memory.
     * 场景是否已加载到内存。
     */
    isLoaded: boolean;       
    
    /**
     * The render priority of the scene.
     * 场景的渲染优先级。
     */
    priority: number;        
    
    /**
     * The Babylon.js Engine object.
     * Babylon.js 引擎对象。
     */
    engine: Engine;          
    
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

    /**
     * Add an entity to the scene
     * 添加一个实体到场景
     * @param entity The entity to add
     */
    addEntity(entity: IGameEntity): void;

    /**
     * Remove an entity from the scene
     * 从场景中移除一个实体
     * @param entity The entity to remove
     */
    removeEntity(uuid: string): void;

    /**
     * Get an entity from the scene
     * 从场景中获取一个实体
     * @param uuid The uuid of the entity to get
     */
    getEntity(uuid: string): IGameEntity | null;
        
}