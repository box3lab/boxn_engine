import { CameraComponent } from "../components/camera/CameraComponent";
import { InputComponent } from "../components/input/InputComponent";
import { MovementComponent } from "../components/movement/MovementComponent";
import type { IGameEntity } from "../interface/IGameEntity";
import { BaseController } from "./BaseController";

export class PlayerController extends BaseController {
    private _movementComponent: MovementComponent | null = null;
    private _cameraComponent: CameraComponent | null = null;
    private _inputComponent: InputComponent | null = null;

    constructor(entity: IGameEntity) {
        super(entity);
        this._movementComponent = this.entity.getComponentByClass(MovementComponent);
        this._cameraComponent = this.entity.getComponentByClass(CameraComponent);
        this._inputComponent = this.entity.getComponentByClass(InputComponent);
    }

    public override update(deltaTime: number): void {
        super.update(deltaTime);
    }
    
    public dispose(): void {
        super.dispose();
    }
    
    
    
    

}