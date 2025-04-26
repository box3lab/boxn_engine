import type { IGameEntity } from "../interface/IGameEntity";
import type { IGameComponent } from "../interface/IGameComponent";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { IScene } from "../interface/IScene";

export class GameEntity implements IGameEntity {
    /**
     * The name of the entity.
     */
    public name: string;
    /**
     * The transform of the entity.
     */
    public transform: TransformNode;
    /**
     * The components of the entity.
     */
    public components: Map<string, IGameComponent> = new Map();

    /**
     * The scene of the entity.
     */
    public scene: IScene | undefined;

    constructor(name: string = "", scene?: IScene) {
        this.name = name;
        this.transform = scene ? new TransformNode(name,scene.scene) : new TransformNode(name);
        this.scene = scene;
    }

    update(deltaTime: number): void {
        // Update all components
        for (const component of this.components.values()) {
            component.update?.(deltaTime);
        }
    }

    dispose(): void {
        // Dispose all components
        for (const component of this.components.values()) {
            component.dispose();
        }
        this.components.clear();
        
        // Dispose transform
        this.transform.dispose();
    }

    addComponent(component: IGameComponent, name: string): void {
        this.components.set(name, component);
        component.attachTo(this);
    }

    getComponent<T extends IGameComponent>(name: string): T | undefined {
        return this.components.get(name) as T | undefined;
    }

    removeComponent(name: string): void {
        const component = this.components.get(name);
        if (component) {
            component.detach();
            this.components.delete(name);
        }
    }

    getName(): string {
        return this.name;
    }

    getTransform(): TransformNode {
        return this.transform;
    }

    setScene(scene: IScene): void {
        this.scene = scene;
        if (this.scene) {
            this.transform._scene = this.scene.scene;
        }
    }
}

