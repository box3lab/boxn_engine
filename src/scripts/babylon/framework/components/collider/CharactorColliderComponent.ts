import type { IGameEntity } from "../../interface/IGameEntity";
import { CapsuleColliderComponentV2 } from "./CapsuleColliderComponentV2";

/**
 * 角色碰撞器组件 / Character collider component
 */
export class CharactorColliderComponent extends CapsuleColliderComponentV2 {
    public name: string = "CharactorColliderComponent";
    
    constructor(name: string = "CharactorColliderComponent", radius: number = 0.5, height: number = 2, 
        direction: number = 0, isPhysicsBody: boolean = false) {
        super(name, radius, height, direction, isPhysicsBody);
    }

    public override attachTo(gameEntity: IGameEntity): void {
        super.attachTo(gameEntity);
        this.setMassPropertiesToZero();
    }

    public override dispose(): void {
        super.dispose();
    }

    public override update(deltaTime: number): void {
        super.update(deltaTime);
    }
    
    
}