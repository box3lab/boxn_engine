import { CharactorColliderComponent } from "../components/collider/CharactorColliderComponent";
import { PlayerInputComponent } from "../components/input/PlayerInputComponent";
import { SkeletonAnimationComponent } from "../components/animation/SkeletonAnimationComponent";
import { SkeletonMeshComponent } from "../components/mesh/SkeletonMeshComponent";
import { MovementComponent } from "../components/movement/MovementComponent";
import { PlayerController } from "../controller/PlayerController";
import type { IScene } from "../interface/IScene";
import { GameEntity } from "./GameEntity";
import { CameraComponent } from "../components/camera/CameraComponent";
import { FollowBehavior } from "babylonjs";
import { FollowCameraComponent } from "../components/camera/FollowCameraComponent";

export class PlayerEntity extends GameEntity {

    private _playerController: PlayerController | null = null;
    private _skeletonMeshComponent: SkeletonMeshComponent | null = null;
    private _skeletonAnimationComponent: SkeletonAnimationComponent | null = null;
    private _charactorColliderComponent: CharactorColliderComponent | null = null;
    private _movementComponent: MovementComponent | null = null;
    private _playerInputComponent: PlayerInputComponent | null = null;
    private _cameraComponent: CameraComponent | null = null;

    constructor(name: string, scene: IScene,meshUrl: string = "./glb/test.glb") {
        super(name, scene);
        this._skeletonMeshComponent = new SkeletonMeshComponent("skeletonMeshComponent",meshUrl,scene.scene);
        this.addComponent("SkeletonMeshComponent",this._skeletonMeshComponent);
        this._skeletonMeshComponent.scale = 10;

        this._skeletonAnimationComponent = new SkeletonAnimationComponent("skeletonAnimationComponent",this._skeletonMeshComponent);
        this.addComponent("SkeletonAnimationComponent",this._skeletonAnimationComponent);
        this._skeletonAnimationComponent.initAnimation("Idle",true);

        this._charactorColliderComponent = new CharactorColliderComponent("CharactorColliderComponent", 3, 18, 0, true);
        this.addComponent("CharactorColliderComponent",this._charactorColliderComponent);
        this._charactorColliderComponent.IsShowDebug = true;

        this._movementComponent = new MovementComponent("MovementComponent");
        this.addComponent("MovementComponent",this._movementComponent);
        this._movementComponent.jumpForce = 15;
        this._movementComponent.maxMoveSpeed = 30;
        this._movementComponent.acceleration = 5;

        this._playerInputComponent = new PlayerInputComponent("PlayerInputComponent");
        this.addComponent("PlayerInputComponent",this._playerInputComponent);

        const followCameraComponent = new FollowCameraComponent("FollowCameraComponent");
        this.addComponent("FollowCameraComponent",followCameraComponent);
        followCameraComponent.setTarget(this._charactorColliderComponent.colliderMesh!);
        followCameraComponent.setRadius(-80);
        followCameraComponent.setHeight(30);
        this._cameraComponent = followCameraComponent;

        this._playerController = new PlayerController(this);
    }

    public override dispose(): void {
        super.dispose();
    }

    public override update(deltaTime: number): void {
        super.update(deltaTime);
    }
}