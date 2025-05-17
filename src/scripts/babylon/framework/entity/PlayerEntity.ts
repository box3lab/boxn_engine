import type { PlayerController } from "../controller/PlayerController";
import type { IScene } from "../interface/IScene";
import { GameEntity } from "./GameEntity";
export class PlayerEntity extends GameEntity {

    private _playerController: PlayerController | null = null;

    constructor(name: string, scene: IScene) {
        super(name, scene);
    }

    public override dispose(): void {
        super.dispose();
    }

    public override update(deltaTime: number): void {
        super.update(deltaTime);
    }
}