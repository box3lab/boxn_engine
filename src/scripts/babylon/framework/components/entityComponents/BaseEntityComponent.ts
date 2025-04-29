import { TransformNode, Vector3 } from "@babylonjs/core";
import type { IGameEntity } from "../../interface/IGameEntity";
import { BaseComponent } from "../BaseComponent";
import type { IScene } from "../../interface/IScene";
import type { IGameComponent } from "../../interface/IGameComponent";

/**
 * Base entity component class that implements IGameEntity interface
 * 基础实体组件类，实现IGameEntity接口
 */
export class BaseEntityComponent extends BaseComponent implements IGameEntity {
    /** Name of the entity / 实体名称 */
    public name: string = "";
    
    /** Transform node for position, rotation and scaling / 用于位置、旋转和缩放的变换节点 */
    public transform: TransformNode;
    
    /** Reference to the game scene / 游戏场景的引用 */
    public scene: IScene | undefined;

    /**
     * Constructor for BaseEntityComponent
     * BaseEntityComponent的构造函数
     * @param name - Name of the entity / 实体名称
     * @param scene - Optional scene reference / 可选的场景引用
     */
    constructor(name: string, scene?: IScene) {
        super(name);
        this.scene = scene;
        this.transform = this.scene  ? new TransformNode("TransformNode",this.scene .scene) : new TransformNode("TransformNode");
    }

    /** Map of components attached to this entity / 附加到此实体的组件映射 */
    components: Map<string, IGameComponent> = new Map();
   
    /**
     * Add a component to the entity
     * 向实体添加组件
     * @param name - Name of the component / 组件名称
     * @param component - Component instance / 组件实例
     * @returns boolean indicating success / 表示是否成功的布尔值
     */
    addComponent(name: string, component: IGameComponent): boolean {
        this.components.set(name, component);
        return true;
    }

    /**
     * Get a component by name
     * 通过名称获取组件
     * @param name - Name of the component / 组件名称
     * @returns Component instance or null / 组件实例或null
     */
    getComponent(name: string): IGameComponent | null {
        return this.components.get(name) || null;
    }

    /**
     * Get a component by its class type
     * 通过类类型获取组件
     * @param componentType - Class type of the component / 组件的类类型
     * @returns Component instance or null / 组件实例或null
     */
    getComponentByClass<T extends IGameComponent>(componentType: new () => T): T | null {
        for (const component of this.components.values()) {
            if (component instanceof componentType) {
                return component as T;
            }
        }
        return null;
    }

    /**
     * Get all components of a specific class type
     * 获取特定类类型的所有组件
     * @param componentType - Class type of the components / 组件的类类型
     * @returns Array of components or null / 组件数组或null
     */
    getComponentsByClass<T extends IGameComponent>(componentType: new () => T): Array<T> | null {
        const components: Array<T> = [];
        for (const component of this.components.values()) {
            if (component instanceof componentType) {
                components.push(component as T);
            }
        }
        return components;
    }

    /**
     * Remove a component by name
     * 通过名称移除组件
     * @param name - Name of the component to remove / 要移除的组件名称
     */
    removeComponent(name: string): void {
        this.components.delete(name);
    }

    /**
     * Get the name of the entity
     * 获取实体名称
     * @returns Entity name / 实体名称
     */
    getName(): string {
        return this.name;
    }

    /**
     * Get the transform node
     * 获取变换节点
     * @returns Transform node / 变换节点
     */
    getTransform(): TransformNode {
        return this.transform;
    }

    /**
     * Attach this entity to another game entity
     * 将此实体附加到另一个游戏实体
     * @param gameEntity - Target game entity / 目标游戏实体
     */
    attachTo(gameEntity: IGameEntity): void {
        this.entity = gameEntity;
        if(this.transform){
            this.transform.setParent(this.entity?.transform);
            this.transform.position = Vector3.Zero();
            this.transform.rotation = Vector3.Zero();
            this.transform.scaling = Vector3.One();
        }
    }

    /**
     * Detach this entity from its parent
     * 将此实体从其父级分离
     */
    detach(): void {
        this.entity = undefined;
        this.transform.setParent(null);
    }

    /**
     * Update the entity and its components
     * 更新实体及其组件
     * @param deltaTime - Time since last update / 自上次更新以来的时间
     */
    update(deltaTime: number): void {
        for (const component of this.components.values()) {
            component.update?.(deltaTime);
        }
    }

    /**
     * Dispose of the entity and its components
     * 释放实体及其组件
     */
    dispose(): void {
        for (const component of this.components.values()) {
            component.dispose();
        }
    }

    /**
     * Set the scene for this entity
     * 设置实体的场景
     * @param scene - New scene reference / 新的场景引用
     */
    setScene(scene: IScene): void {
        this.scene = scene;
        if(this.transform)this.transform._scene = this.scene?.scene;
    }
}