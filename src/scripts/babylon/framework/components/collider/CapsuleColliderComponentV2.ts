import { ColliderComponentV2 } from "./ColliderComponentV2";
import { PhysicsAggregate, PhysicsShapeType, Vector3, Mesh, MeshBuilder, PhysicsShapeCapsule } from "@babylonjs/core";
import type { IGameEntity } from "../../interface/IGameEntity";

/**
 * 胶囊体碰撞器组件 / Capsule collider component
 * 用于处理胶囊体形状的物理碰撞 / Handles physical collisions for capsule-shaped objects
 */
export class CapsuleColliderComponentV2 extends ColliderComponentV2 {
    public name: string = "CapsuleColliderComponentV2";

    /**
     * 胶囊体半径 / Capsule radius
     */
    private _radius: number = 0.5;

    /**
     * 胶囊体高度 / Capsule height
     */
    private _height: number = 1;

    /**
     * 胶囊体方向 / Capsule direction
     * 0: Y轴 / Y-axis
     * 1: X轴 / X-axis
     * 2: Z轴 / Z-axis
     */
    private _direction: number = 0;

    /**
     * 碰撞器网格 / Collider mesh
     */
    private _colliderMesh: Mesh | null = null;

    /**
     * 获取胶囊体半径 / Get capsule radius
     */
    public get radius(): number {
        return this._radius;
    }

    /**
     * 设置胶囊体半径 / Set capsule radius
     */
    public set radius(value: number) {
        this._radius = value;
        this.updateShape();
    }

    /**
     * 获取胶囊体高度 / Get capsule height
     */
    public get height(): number {
        return this._height;
    }

    /**
     * 设置胶囊体高度 / Set capsule height
     */
    public set height(value: number) {
        this._height = value;
        this.updateShape();
    }

    /**
     * 获取胶囊体方向 / Get capsule direction
     */
    public get direction(): number {
        return this._direction;
    }

    /**
     * 设置胶囊体方向 / Set capsule direction
     */
    public set direction(value: number) {
        this._direction = value;
        this.updateShape();
    }

    public override set IsShowDebug(isShowDebug: boolean) {
        super.IsShowDebug = isShowDebug;
        if(this._colliderMesh){
            this._colliderMesh.isVisible = isShowDebug;
        }
    }

    /**
     * 构造函数 / Constructor
     * @param radius 胶囊体半径 / Capsule radius
     * @param height 胶囊体高度 / Capsule height
     * @param direction 胶囊体方向 / Capsule direction
     */
    constructor(name: string = "CapsuleColliderComponentV2", radius: number = 0.5, height: number = 2, direction: number = 0) {
        super(name);
        this._radius = radius;
        this._height = height;
        this._direction = direction;
        this._offset = new Vector3(0, height / 2, 0);
    }

    /**
     * 将碰撞器附加到游戏实体 / Attach collider to game entity
     * @param gameEntity 游戏实体 / Game entity
     */
    public override attachTo(gameEntity: IGameEntity): void {
        super.attachTo(gameEntity);
        this.createColliderMesh();
        this.updateShape();
        this.bindEvent();
    }

    /**
     * 创建碰撞器网格 / Create collider mesh
     */
    private createColliderMesh(): void {
        if (!this.entity?.scene?.scene) return;

        // 根据方向设置胶囊体朝向 / Set capsule orientation based on direction
        let orientation: Vector3;
        switch (this._direction) {
            case 0: // Y轴 / Y-axis
                orientation = new Vector3(0, 1, 0);
                break;
            case 1: // X轴 / X-axis
                orientation = new Vector3(1, 0, 0);
                break;
            case 2: // Z轴 / Z-axis
                orientation = new Vector3(0, 0, 1);
                break;
            default:
                orientation = new Vector3(0, 1, 0);
        }

        // 创建胶囊体网格 / Create capsule mesh
        this._colliderMesh = MeshBuilder.CreateCapsule(
            `${this.name}_collider`,
            {
                radius: this._radius,
                height: this._height,
                orientation: orientation
            },
            this.entity.scene.scene
        );

        // 设置网格属性 / Set mesh properties
        this._colliderMesh.isVisible = false; // 默认不可见 / Invisible by default
        // this._colliderMesh.parent = this.entity.root.root;
        // this._colliderMesh.position = Vector3.Zero();
    }

    /**
     * 更新碰撞器形状 / Update collider shape
     */
    private updateShape(): void {
        if (!this.entity?.physicsBody || !this.entity.scene?.scene || !this._colliderMesh) return;

        const shape = new PhysicsShapeCapsule( new Vector3(0, this._height / 2 - this._radius, 0),
            new Vector3(0, this.radius - this._height / 2, 0),
            this._radius,
            this.entity.scene.scene);

        this.setShape(shape,this._colliderMesh,this._offset);
    }

    /**
     * 释放组件资源 / Dispose component resources
     */
    public override dispose(): void {
        if (this._colliderMesh) {
            this._colliderMesh.dispose();
            this._colliderMesh = null;
        }
        this.unbindEvent();
        super.dispose();
    }
}
