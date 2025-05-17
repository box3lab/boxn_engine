import type { IGameEntity } from "../../interface/IGameEntity";
import { BaseComponent } from "../BaseComponent";

export class CameraComponent extends BaseComponent {
    constructor(name: string = "CameraComponent") {
        super(name);
    }

  public override update(deltaTime: number): void {
    super.update(deltaTime);
  }

  public dispose(): void {
    super.dispose();
  }

  public attachTo(entity: IGameEntity): void {
    super.attachTo(entity);
  }
}