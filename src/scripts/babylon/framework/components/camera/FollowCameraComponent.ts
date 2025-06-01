import { FollowCamera, Vector3, Mesh } from '@babylonjs/core';
import { CameraComponent } from './CameraComponent';
import { EventEmitter } from '../../common/EventEmitter';
import type { Vector2 } from 'babylonjs';

/**
 * 跟随相机组件 / Follow Camera Component
 * 实现一个跟随目标物体的相机 / Implements a camera that follows a target object
 */
export class FollowCameraComponent extends CameraComponent {

  /**
   * 跟随相机 / Follow camera
   */
  private _followCamera: FollowCamera | null = null;

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
  private _rotationSpeed: number = 0.005;

  /**
   * 高度偏移 / Height offset
   */
  private _heightOffset: number = 4;

  /**
   * 相机的俯仰角度（弧度制） / Camera pitch angle
   */
  private pitch: number = 0;

  /**
   * 相机的偏航角度（弧度制） / Camera yaw angle
   */
  private yaw: number = 0;

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
    this._followCamera = new FollowCamera(
      `${this.name}_camera`,
      new Vector3(0, this._height, -this._radius),
      this.entity.scene.scene
    );

    // 设置相机参数 / Set camera parameters
    this._followCamera.heightOffset = this._heightOffset;
    this._followCamera.radius = this._radius;
    this._followCamera.rotationOffset = 0;
    this._followCamera.cameraAcceleration = 0.5;
    this._followCamera.maxCameraSpeed = 10;

    // 检查目标是否为Mesh / Check if target is a Mesh
    this._followCamera.lockedTarget = this._target;

    // 设置相机 / Set camera
    this.setCamera(this._followCamera);

      // // 监听鼠标位置改变 / Listen to mouse position changes
      // EventEmitter.instance.on("MouseMove", (event) => {
      //     if(!event) return;
      //     const delta = event.delta as Vector2;
      //     this.updateCameraPosition(delta);
      // })
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
   * 更新相机朝向 / Update camera forward
   * @param delta 鼠标移动增量 / Mouse movement delta
   */
  public updateCameraForward(delta: Vector2){
    this.pitch += -delta.y * this._rotationSpeed;
    this.yaw += delta.x * this._rotationSpeed;

    this.pitch = Math.max(0.01 - Math.PI / 2, Math.min(Math.PI / 2 - 0.01, this.pitch));
    this.yaw = this.yaw % (2 * Math.PI);

    if(this._followCamera){
      this._followCamera.radius = Math.cos(this.pitch) * this._radius;
      this._followCamera.heightOffset = Math.sin(this.pitch) * this._radius;
      this._followCamera.rotationOffset = this.yaw / Math.PI * 180;
    }
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
