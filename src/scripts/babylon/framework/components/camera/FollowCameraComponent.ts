import { FollowCamera, Vector3, Mesh } from '@babylonjs/core';
import { CameraComponent } from './CameraComponent';
import type { IGameEntity } from '../../interface/IGameEntity';

/**
 * 跟随相机组件 / Follow Camera Component
 * 实现一个跟随目标物体的相机 / Implements a camera that follows a target object
 */
export class FollowCameraComponent extends CameraComponent {
  /**
   * 目标实体 / Target entity
   */
  private _target: Mesh | null = null;

  /**
   * 相机高度 / Camera height
   */
  private _height: number = 10;

  /**
   * 相机距离 / Camera distance
   */
  private _radius: number = 20;

  /**
   * 旋转速度 / Rotation speed
   */
  private _rotationSpeed: number = 0.1;

  /**
   * 高度偏移 / Height offset
   */
  private _heightOffset: number = 4;

  /**
   * 构造函数 / Constructor
   * @param name 组件名称 / Component name
   */
  constructor(name: string = 'FollowCameraComponent') {
    super(name);
  }

  /**
   * 设置目标实体 / Set target entity
   * @param target 目标实体 / Target entity
   */
  public setTarget(target: Mesh): void {
    this._target = target;
    this.initializeCamera();
  }

  /**
   * 初始化相机 / Initialize camera
   */
  private initializeCamera(): void {
    if (!this._target || !this.entity?.scene?.scene) return;

    // 创建跟随相机 / Create follow camera
    const camera = new FollowCamera(
      `${this.name}_camera`,
      new Vector3(0, this._height, -this._radius),
      this.entity.scene.scene
    );

    // 设置相机参数 / Set camera parameters
    camera.heightOffset = this._heightOffset;
    camera.radius = this._radius;
    camera.rotationOffset = 0;
    camera.cameraAcceleration = 0.5;
    camera.maxCameraSpeed = 10;

    // 检查目标是否为Mesh / Check if target is a Mesh
    camera.lockedTarget = this._target;

    // 设置相机 / Set camera
    this.setCamera(camera);
  }

  /**
   * 更新组件 / Update component
   * @param deltaTime 时间增量 / Delta time
   */
  public override update(deltaTime: number): void {
    super.update(deltaTime);

    if (!this._camera || !this._target) return;

    // 更新相机位置 / Update camera position
    // const camera = this._camera as FollowCamera;
    // if (camera.lockedTarget !== this._target) {
    //   camera.lockedTarget = this._target;
    // }
  }

  /**
   * 设置相机高度 / Set camera height
   * @param height 高度值 / Height value
   */
  public setHeight(height: number): void {
    this._height = height;
    if (this._camera) {
      (this._camera as FollowCamera).heightOffset = height;
    }
  }

  /**
   * 设置相机距离 / Set camera radius
   * @param radius 距离值 / Radius value
   */
  public setRadius(radius: number): void {
    this._radius = radius;
    if (this._camera) {
      (this._camera as FollowCamera).radius = radius;
    }
  }

  /**
   * 设置相机旋转速度 / Set camera rotation speed
   * @param speed 速度值 / Speed value
   */
  public setRotationSpeed(speed: number): void {
    this._rotationSpeed = speed;
  }

  /**
   * 销毁组件 / Dispose component
   */
  public override dispose(): void {
    if (this._camera) {
      this._camera.dispose();
    }
    super.dispose();
  }
}
