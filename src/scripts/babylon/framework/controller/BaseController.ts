import type { IGameEntity } from "../interface/IGameEntity";

export class BaseController {
    /**
     * The entity that the controller is controlling.
     * 控制器所控制的实体。
     */
    protected entity: IGameEntity;

    constructor(entity: IGameEntity) {
        this.entity = entity;
    }

    public update(deltaTime: number): void {
        // TODO: Implement update logic
    }

    public dispose(): void {
        // TODO: Implement dispose logic
    }
}