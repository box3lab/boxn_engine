import { Mesh, type TransformNode } from "@babylonjs/core";
import type { IGameComponent } from "../interface/IGameComponent";
import type { IGameEntity } from "../interface/IGameEntity";
import type { IScene } from "../interface/IScene";
export class PhyGameEntity implements IGameEntity {
     /**
     * The name of the entity.
     * 实体的名称。
     */
     public name: string;
     /**
      * The transform of the entity.
      * 实体的变换节点。
      */
     public transform: Mesh;
     /**
      * The components of the entity.
      * 实体的组件集合。
      */
     public components: Map<string, IGameComponent> = new Map<string, IGameComponent>();
 
     /**
      * The scene of the entity.
      * 实体所属的场景。
      */
     public scene: IScene | undefined;


    constructor(name: string, scene: IScene) {
        this.name = name;
        this.transform = scene ? new Mesh(name, scene.scene) : new Mesh(name);
        this.scene = scene;
    }
    update(deltaTime: number): void {
        for (const component of this.components.values()) {
            component.update?.(deltaTime);
        }
    }

    dispose(): void {
        this.transform.dispose();
    }
   /**
     * Adds a component to the entity with the specified name.
     * 使用指定名称将组件添加到实体。
     * 
     * @param name - The name to identify the component
     *               用于标识组件的名称
     * @param component - The component to add
     *                    要添加的组件
     * @returns True if the component was added successfully, false if a component with the same name already exists
     *          如果组件添加成功则返回true，如果同名组件已存在则返回false
     */
   addComponent(name: string, component: IGameComponent): boolean {
    if(this.components.has(name)) return false;
    component.attachTo(this);
    this.components.set(name, component);
    return true;
}

/**
 * Gets a component by its name.
 * 通过名称获取组件。
 * 
 * @param name - The name of the component to get
 *               要获取的组件的名称
 * @returns The component with the specified name, or null if not found
 *          具有指定名称的组件，如果未找到则返回null
 */
getComponent(name: string): IGameComponent | null {
    return this.components.get(name) || null;
}

/**
 * Gets the first component of the specified type.
 * 获取指定类型的第一个组件。
 * 
 * @param componentType - The constructor of the component type to get
 *                        要获取的组件类型的构造函数
 * @returns The first component of the specified type, or null if not found
 *          指定类型的第一个组件，如果未找到则返回null
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
 * Gets all components of the specified type.
 * 获取指定类型的所有组件。
 * 
 * @param componentType - The constructor of the component type to get
 *                        要获取的组件类型的构造函数
 * @returns An array of all components of the specified type, or null if none found
 *          指定类型的所有组件的数组，如果未找到则返回null
 */
getComponentsByClass<T extends IGameComponent>(componentType: new () => T): Array<T> | null {
    const result: Array<T> = [];
    for (const component of this.components.values()) {
        if (component instanceof componentType) {
            result.push(component as T);
        }
    }
    return result.length > 0 ? result : null;
}

/**
 * Removes a component by its name.
 * 通过名称移除组件。
 * 
 * @param name - The name of the component to remove
 *               要移除的组件的名称
 */
removeComponent(name: string): void {
    const component = this.components.get(name);
    if (component) {
        component.detach();
        this.components.delete(name);
    }
}

/**
 * Gets the name of the entity.
 * 获取实体的名称。
 * 
 * @returns The name of the entity
 *          实体的名称
 */
getName(): string {
    return this.name;
}

/**
 * Gets the transform of the entity.
 * 获取实体的变换。
 * 
 * @returns The transform of the entity
 *          实体的变换
 */
getTransform(): TransformNode {
    return this.transform;
}

/**
 * Sets the scene of the entity.
 * 设置实体的场景。
 * 
 * @param scene - The scene to set
 *                要设置的场景
 */
setScene(scene: IScene): void {
    this.scene = scene;
    if (this.scene) {
        this.transform._scene = this.scene.scene;
    }
}
    
}