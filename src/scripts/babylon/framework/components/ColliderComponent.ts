import { BaseComponent } from "./BaseComponent";
import type { IGameEntity } from "../interface/IGameEntity";
import { Vector3, PhysicsImpostor, CannonJSPlugin, MeshBuilder, Mesh, TransformNode } from "@babylonjs/core";
import type { PhysicsImpostorParameters } from "@babylonjs/core";
import type { PhyGameEntity } from "../entity/PhyGameEntity";
import { Const } from "../common/Const";
export class ColliderComponent extends BaseComponent {
    /**
     * 碰撞器的尺寸
     */
    public size: Vector3;
    
    /**
     * 碰撞器的中心点偏移
     */
    public offset: Vector3;
    
    /**
     * 是否启用碰撞检测
     */
    public enabled: boolean = true;

    /**
     * 物理模拟器
     */
    private physicsImpostor: PhysicsImpostor | null = null;

    /**
     * 碰撞器网格
     */
    private collisionMesh: Mesh | null = null;

    /**
     * 质量
     */
    public mass: number = 1;

    /**
     * 摩擦系数
     */
    public friction: number = 0.5;

    /**
     * 弹性系数
     */
    public restitution: number = 0.8;

    /**
     * 是否受重力影响
     */
    public useGravity: boolean = true;

    /**
     * 是否启用连续碰撞检测
     */
    public enableCCD: boolean = false;

    constructor(name: string, size: Vector3, offset: Vector3 = new Vector3(0, 0, 0)) {
        super(name);
        this.size = size;
        this.offset = offset;
    }

    /**
     * 将组件附加到实体
     * @param gameEntity 要附加的实体
     */
    public attachTo(gameEntity: PhyGameEntity): void {
        super.attachTo(gameEntity);
        this.initializePhysics();
    }

    /**
     * 初始化物理系统
     */
    private initializePhysics(): void {
        if (!this.entity || !this.entity.transform || !this.entity.scene?.scene) return;

        // 判断是否是物理实体
        let isPhysical = this.entity.transform instanceof Mesh;

        // 创建物理模拟器
        const impostorParams: PhysicsImpostorParameters = {
            mass: this.mass,
            friction: this.friction,
            restitution: this.restitution
        };

        if(isPhysical){
            // 创建碰撞器网格
            this.collisionMesh = MeshBuilder.CreateBox(
                `${this.name}_collider`,
                { size: this.size.x },
                this.entity.scene.scene
            );
            this.collisionMesh.isVisible = true; // 隐藏碰撞器网格
            this.collisionMesh.position = this.entity.transform.position;
            this.collisionMesh.rotation = this.entity.transform.rotation;
            this.collisionMesh.scaling = this.entity.transform.scaling;
            this.entity.transform.getChildren().forEach(child => {
                child.parent = this.collisionMesh;
                if(this.offset.length() > 0 && child instanceof TransformNode){
                    child.position = child.position.subtract(this.offset);
                }
            });
            this.entity.transform.dispose();
            this.entity.transform = this.collisionMesh;
            this.physicsImpostor = new PhysicsImpostor(
                this.collisionMesh,
                PhysicsImpostor.BoxImpostor,
                impostorParams,
                this.entity.scene.scene
            );
        }else{
            this.physicsImpostor = new PhysicsImpostor(
                this.entity.transform as Mesh,
                PhysicsImpostor.NoImpostor,
                impostorParams,
                this.entity.scene.scene
            );
        }
    }

    /**
     * 设置物理属性
     * @param mass 质量
     * @param friction 摩擦系数
     * @param restitution 弹性系数
     */
    public setPhysicsProperties(mass: number, friction: number, restitution: number): void {
        this.mass = mass;
        this.friction = friction;
        this.restitution = restitution;

        if (this.physicsImpostor) {
            this.physicsImpostor.setParam("mass", mass);
            this.physicsImpostor.setParam("friction", friction);
            this.physicsImpostor.setParam("restitution", restitution);
        }
    }

    /**
     * 设置是否受重力影响
     * @param useGravity 是否受重力影响
     */
    public setUseGravity(useGravity: boolean): void {
        this.useGravity = useGravity;

        if (this.physicsImpostor) {
            this.physicsImpostor.setParam("mass", useGravity ? this.mass : 0);
        }
    }

    /**
     * 应用力
     * @param force 要应用的力
     */
    public applyForce(force: Vector3): void {
        if (this.physicsImpostor && this.collisionMesh) {
            this.physicsImpostor.applyForce(force, this.collisionMesh.position);
        }
    }

    /**
     * 应用冲量
     * @param impulse 要应用的冲量
     */
    public applyImpulse(impulse: Vector3): void {
        if (this.physicsImpostor && this.collisionMesh) {
            this.physicsImpostor.applyImpulse(impulse, this.collisionMesh.position);
        }
    }

    /**
     * 更新碰撞器
     * @param deltaTime 帧间隔时间
     */
    public update(deltaTime: number): void {
        // 可以在这里添加每帧的碰撞检测逻辑
    }

    /**
     * 销毁组件
     */
    public dispose(): void {
        if (this.physicsImpostor) {
            this.physicsImpostor.dispose();
            this.physicsImpostor = null;
        }
        if (this.collisionMesh) {
            this.collisionMesh.dispose();
            this.collisionMesh = null;
        }
        super.dispose();
        this.enabled = false;
    }
}
