import type { IGameComponent } from "../interface/IGameComponent";
import type { IGameEntity } from "../interface/IGameEntity";

export class BaseComponent implements IGameComponent{

    /**
     * 组件的名称。
     */
    public name: string = "";
    /**
     * 组件所属的实体。
     */
    public entity: IGameEntity | undefined;

    constructor(name: string) {
        this.name = name;
    }
    
    /**
     * 将组件附加到实体。
     * 
     * @param gameEntity - 要附加的实体。
     */
    attachTo(gameEntity: IGameEntity): void {
        this.entity = gameEntity;
    }

    /**
     * 从实体分离组件。
     */         
    detach(): void {
        this.entity = undefined;
    }

    /**
     * 更新组件。   
     * 
     */
    update(deltaTime: number): void {
    }

    /**
     * 销毁组件。
     */
    dispose(): void {
        this.entity = undefined;
    }
    
}