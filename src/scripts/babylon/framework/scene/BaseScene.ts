import { Scene } from "@babylonjs/core/scene";
import type { IScene } from "../interface/IScene";
import type { Engine } from "@babylonjs/core";
import type { GameEntity } from "../entity/GameEntity";
import { Utils } from "../common/Utils";
import type { IGameEntity } from "../interface/IGameEntity";

export class BaseScene implements IScene {
    public id: string = "";
    public name: string = "";
    public scene: Scene;
    public isActive: boolean = false;
    public isLoaded: boolean = false;
    public priority: number = 0;
    public engine: Engine;

    protected entityMap: Map<string, GameEntity> = new Map<string, GameEntity>();

    constructor(id: string, name: string, engine: Engine, priority: number = 0) {
        this.id = id;
        this.name = name;
        this.engine = engine;
        this.priority = priority;
        this.scene = new Scene(this.engine);
    }

    public initialize(): Promise<void> {
        return Promise.resolve();
    }
    
    public update(deltaTime: number): void {
        this.entityMap.forEach((entity) => {
            entity.update(deltaTime);
        });
    }
    public dispose(): void {
        this.entityMap.forEach((entity) => {
            entity.dispose();
        });
    }

    public addEntity(entity: IGameEntity): void {
        const uuid = Utils.getUUID();
        entity.uuid = uuid;
        this.entityMap.set(uuid, entity);
    }

    public removeEntity(uuid: string): void {
        this.entityMap.delete(uuid);
    }   

    public getEntity(uuid: string): IGameEntity | null {
        return this.entityMap.get(uuid) ?? null;
    }
}