import type { Camera } from "@babylonjs/core";
import type { IGameEntity } from "../../interface/IGameEntity";
import { BaseComponent } from "../BaseComponent";

export class CameraComponent extends BaseComponent {

    protected _camera: Camera | null = null;
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

    public setCamera(camera: Camera): void {
      this._camera = camera;
    }

    public getCamera(): Camera | null {
      return this._camera;
    }
    
    
    
}