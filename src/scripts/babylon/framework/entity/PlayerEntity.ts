import { CharactorColliderComponent } from "../components/collider/CharactorColliderComponent";
import { PlayerInputComponent } from "../components/input/PlayerInputComponent";
import { SkeletonMeshComponent } from "../components/mesh/SkeletonMeshComponent";
import { MovementComponent } from "../components/movement/MovementComponent";
import { PlayerController } from "../controller/PlayerController";
import type { IScene } from "../interface/IScene";
import { GameEntity } from "./GameEntity";
import { CameraComponent } from "../components/camera/CameraComponent";
import { FollowCameraComponent } from "../components/camera/FollowCameraComponent";
import { AnimatorComponent } from "../components/animation/AnimatorComponent";

export class PlayerEntity extends GameEntity {
    /**
     * 玩家控制器 / Player controller
     */
    public playerController: PlayerController | null = null;
    /**
     * 骨骼网格组件 / Skeleton mesh component
     */
    public skeletonMeshComponent: SkeletonMeshComponent | null = null;
    /**
     * 动画组件 / Animator component
     */
    public animatorComponent: AnimatorComponent | null = null;
    /**
     * 角色碰撞器组件 / Character collider component
     */
    public charactorColliderComponent: CharactorColliderComponent | null = null;
    /**
     * 移动组件 / Movement component
     */
    public movementComponent: MovementComponent | null = null;
    /**
     * 玩家输入组件 / Player input component
     */
    public playerInputComponent: PlayerInputComponent | null = null;
    /**
     * 相机组件 / Camera component
     */
    public cameraComponent: CameraComponent | null = null;

    constructor(name: string, scene: IScene,meshUrl: string = "./glb/test1.glb") {
        super(name, scene);
        this.skeletonMeshComponent = new SkeletonMeshComponent("skeletonMeshComponent",meshUrl,scene.scene);
        this.addComponent("SkeletonMeshComponent",this.skeletonMeshComponent);
        this.skeletonMeshComponent.scale = 0.01;

        this.animatorComponent = new AnimatorComponent("animatorComponent");
        this.addComponent("AnimatorComponent",this.animatorComponent);
        this.animatorComponent.setSkeletonMeshComponent(this.skeletonMeshComponent);

        this.charactorColliderComponent = new CharactorColliderComponent("CharactorColliderComponent", 0.5, 2, 0, true);
        this.addComponent("CharactorColliderComponent",this.charactorColliderComponent);
        this.charactorColliderComponent.IsShowDebug = false;

        this.movementComponent = new MovementComponent("MovementComponent");
        this.addComponent("MovementComponent",this.movementComponent);
        // this._movementComponent.jumpForce = 20;
        // this._movementComponent.maxMoveSpeed = 30;
        // this._movementComponent.acceleration = 5;

        this.playerInputComponent = new PlayerInputComponent("PlayerInputComponent");
        this.addComponent("PlayerInputComponent",this.playerInputComponent);

        const followCameraComponent = new FollowCameraComponent("FollowCameraComponent");
        this.addComponent("FollowCameraComponent",followCameraComponent);
        followCameraComponent.setTarget(this.charactorColliderComponent!.colliderMesh!);
        followCameraComponent.setRadius(-8);
        followCameraComponent.setHeight(3);
        this.cameraComponent = followCameraComponent;

        this.playerController = new PlayerController(this);
        this.playerController.initialize();
    }

    public override dispose(): void {
        super.dispose();
    }

    public override update(deltaTime: number): void {
        super.update(deltaTime);
        this.playerController?.update(deltaTime);
    }
}