import type { Mesh, TransformNode } from "@babylonjs/core";
import type { IGameEntity } from "../interface/IGameEntity";
import type { BaseComponent } from "./BaseComponent";

export class RootComponent implements BaseComponent{
    public name: string = "RootComponent";
    public entity: IGameEntity | undefined;

    public root: TransformNode | Mesh;

    constructor(root: TransformNode | Mesh) {
        this.root = root;
    }

    public attachTo(gameEntity: IGameEntity): void {
        this.entity = gameEntity;
    }
    public detach(): void {
        this.entity = undefined;
    }
    public update(deltaTime: number): void {

    }
    public dispose(): void {
        this.root.dispose();
    }

}