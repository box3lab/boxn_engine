import type { IGameComponent } from "./IGameComponent";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { IScene } from "./IScene";
/**
 * Game Entity Interface
 * 游戏实体接口
 * 
 * This interface defines the basic structure for all game entities in the system.
 * 该接口定义了系统中所有游戏实体的基本结构。
 */
export interface IGameEntity {

    /**
     * The name of the entity.
     * 实体的名称。
     */
    name: string;
    /**
     * The transform of the entity.
     * 实体的变换节点。
     */
    transform: TransformNode;
    /**
     * The components of the entity.
     * 实体的组件集合。
     */
    components: Map<string, IGameComponent>;

    /**
     * The scene of the entity.
     * 实体所属的场景。
     */
    scene: IScene | undefined;

    /**
     * Updates the entity's state based on the elapsed time since the last frame.
     * 根据上一帧到当前帧的经过时间来更新实体状态。
     * 
     * @param deltaTime - The time elapsed since the last update in seconds
     *                   自上次更新以来经过的时间（以秒为单位）
     */
    update(deltaTime: number): void;

    /**
     * Cleans up resources and performs necessary cleanup operations when the entity is no longer needed.
     * 当实体不再需要时，清理资源并执行必要的清理操作。
     */
    dispose(): void;

    
    addComponent(name:string, component: IGameComponent): boolean;

    getComponent(name:string): IGameComponent | null;

    getComponentByClass<T extends IGameComponent>(componentType: new () => T): T | null;

    getComponentsByClass<T extends IGameComponent>(componentType: new () => T): Array<T> | null;


    removeComponent(name:string): void;

    /**
     * Gets the name of the entity.
     * 获取实体的名称。
     * 
     * @returns The name of the entity
     */
    getName(): string;

    /**
     * Gets the transform of the entity.
     * 获取实体的变换。
     * 
     * @returns The transform of the entity
     */
    getTransform(): TransformNode;

    /**
     * Sets the scene of the entity.
     * 设置实体的场景。
     * 
     * @param scene - The scene to set
     */
    setScene(scene: IScene): void;
}