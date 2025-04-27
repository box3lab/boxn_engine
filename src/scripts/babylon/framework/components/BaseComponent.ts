import type { IGameComponent } from "../interface/IGameComponent";
import type { IGameEntity } from "../interface/IGameEntity";

export class BaseComponent implements IGameComponent{
    public name: string | undefined;
    
    public entity: IGameEntity | undefined;
    

    attachTo(gameEntity: IGameEntity): void {
        this.entity = gameEntity;
    }
    detach(): void {
    }
    update?(deltaTime: number): void {
    }
    dispose(): void {
    }
    
}