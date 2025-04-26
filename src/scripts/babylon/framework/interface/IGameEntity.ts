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
     */
    name: string;
    /**
     * The transform of the entity.
     */
    transform: TransformNode;
    /**
     * The components of the entity.
     */
    components: Map<string, IGameComponent>;

    /**
     * The scene of the entity.
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

    /**
     * Adds a component to the entity.
     * 向实体添加一个组件。
     * 
     * @param component - The component to add
     * @param name - The name of the component
     */
    addComponent(component: IGameComponent, name: string): void;

    /**
     * Gets a component from the entity by name.
     * 通过名称从实体获取一个组件。
     * 
     * @param name - The name of the component
     * @returns The component or undefined if it doesn't exist
     */
    getComponent<T extends IGameComponent>(name: string): T | undefined;

    /**
     * Removes a component from the entity.
     * 从实体中移除一个组件。
     * 
     * @param name - The name of the component
     */
    removeComponent(name: string): void;

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