import type { Vector } from "@babylonjs/core";
import type { IGameEntity } from "./IGameEntity";

// 基础组件接口
export interface IGameComponent {
    name:string | undefined;
    entity: IGameEntity | undefined;

    /**
     * Attach the component to a game entity
     * 将组件附加到游戏实体
     * @param gameEntity - The game entity to attach to
     */
    attachTo(gameEntity: IGameEntity): void;

    /**
     * Detach the component from the scene
     * 从场景中分离组件
     */
    detach(): void;

    /**
     * Update the component
     * 更新组件
     * @param deltaTime - The time elapsed since the last update in seconds
     */
    update?(deltaTime: number): void;

    /**
     * Dispose the component
     * 销毁组件
     */
    dispose(): void;
}