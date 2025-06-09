import { FollowCamera, Vector3, Mesh, Quaternion } from '@babylonjs/core';
import { CameraComponent } from './CameraComponent';
import { EventEmitter } from '../../common/EventEmitter';
import { Vector2 } from 'babylonjs';

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
  private _height: number = 4;

  /**
   * 相机高度改变速度 / Camera height change speed
   */
  private _heightSpeed: number = 0.05;

  /**
   * 最小相机高度 / Minimum camera height
   */
  private _minHeight: number = -2;

  /**
   * 最大相机高度 / Maximum camera height
   */
  private _maxHeight: number = 10;

  /**
   * 相机距离 / Camera distance
   */
  private _radius: number = -10;

  /**
   * 相机半径改变速度 / Camera radius change speed
   */
  private _radiusSpeed: number = 0.05;

  /**
   * 最小相机半径 / Minimum camera radius
   */
  private _minRadius: number = -20;

  /**
   * 最大相机半径 / Maximum camera radius
   */
  private _maxRadius: number = -8;

  /**
   * 旋转速度 / Rotation speed
   */
  private _rotationSpeed: Vector2 = new Vector2(0.005, 0.002);

  // /**
  //  * 高度偏移 / Height offset
  //  */
  // private _heightOffset: number = 4;

  /**
   * 相机的旋转四元数 / Camera rotation quaternion
   */
  private _rotation: Quaternion = Quaternion.Identity();

  /**
   * 当前俯仰角度（弧度制，用于限制） / Current pitch angle (radians, for clamping)
   */
  private _currentPitch: number = 0;

  /**
   * 平滑因子，用于防止抖动 / Smoothing factor to prevent jittering
   */
  private _smoothingFactor: number = 0.1;

  /**
   * 上一帧的相机参数，用于平滑过渡 / Previous frame camera parameters for smooth transition
   */
  private _previousRadius: number = 0;
  private _previousHeight: number = 0;

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
    this._followCamera.heightOffset = this._height;
    this._followCamera.radius = this._radius;
    this._followCamera.rotationOffset = 0;
    this._followCamera.cameraAcceleration = 0.5;
    this._followCamera.maxCameraSpeed = 10;

    // 检查目标是否为Mesh / Check if target is a Mesh
    this._followCamera.lockedTarget = this._target;

    // 设置相机 / Set camera
    this.setCamera(this._followCamera);

    // 初始化平滑参数 / Initialize smoothing parameters
    this._previousRadius = this._radius;
    this._previousHeight = this._height;

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
    // 更新俯仰角度并限制范围，使用更安全的边界值 / Update pitch angle and clamp range with safer boundary values
    this._currentPitch += delta.y * this._rotationSpeed.y;

    // 使用更安全的角度限制，避免接近奇点 / Use safer angle limits to avoid singularities
    const maxPitch = Math.PI / 2 - 0.1; // 避免完全垂直，留出0.1弧度的缓冲 / Avoid complete vertical, leave 0.1 radian buffer
    const minPitch = -Math.PI / 2 + 0.1;
    this._currentPitch = Math.max(minPitch, Math.min(maxPitch, this._currentPitch));

    // 计算偏航角度增量 / Calculate yaw angle delta
    const yawDelta = delta.x * this._rotationSpeed.x;

    // 创建偏航四元数并应用到当前旋转 / Create yaw quaternion and apply to current rotation
    const yawQuaternion = Quaternion.RotationAxis(Vector3.Up(), yawDelta);
    this._rotation = this._rotation.multiply(yawQuaternion);

    if(this._followCamera){
      // 使用更稳定的三角函数计算，添加数值稳定性检查 / Use more stable trigonometric calculations with numerical stability checks
      const cosValue = Math.cos(this._currentPitch);
      const sinValue = Math.sin(this._currentPitch);

      // 确保数值在合理范围内 / Ensure values are within reasonable range
      const clampedCos = Math.max(-1, Math.min(1, cosValue));
      const clampedSin = Math.max(-1, Math.min(1, sinValue));

      // 计算新的半径和高度 / Calculate new radius and height
      const targetRadius = clampedCos * this._radius;
      const targetHeight = clampedSin * Math.abs(this._radius); // 使用绝对值确保高度计算正确 / Use absolute value to ensure correct height calculation

      // 应用平滑过渡以防止抖动 / Apply smooth transition to prevent jittering
      const smoothedRadius = this._previousRadius + (targetRadius - this._previousRadius) * this._smoothingFactor;
      const smoothedHeight = this._previousHeight + (targetHeight - this._previousHeight) * this._smoothingFactor;

      // 更新上一帧的值 / Update previous frame values
      this._previousRadius = smoothedRadius;
      this._previousHeight = smoothedHeight;

      // 分别设置属性，避免冲突 / Set properties separately to avoid conflicts
      this._followCamera.radius = smoothedRadius;
      this._height = Math.max(this._minHeight, Math.min(this._maxHeight, smoothedHeight));
      this._followCamera.heightOffset = this._height;

      // 从四元数提取偏航角度用于相机旋转偏移 / Extract yaw angle from quaternion for camera rotation offset
      const yawAngle = this.getYawFromQuaternion(this._rotation);
      this._followCamera.rotationOffset = yawAngle * 180 / Math.PI;
    }
  }

  /**
   * 设置相机高度 / Set camera height
   * @param height 高度值 / Height value
   */
  public setHeight(height: number): void {
    this._height = Math.max(this._minHeight, Math.min(this._maxHeight, height));
    if (this._followCamera) {
      this._followCamera.heightOffset = this._height; // 使用限制后的高度值 / Use the clamped height value
    }
  }

  /**
   * 设置相机高度范围 / Set camera height range
   * @param min 最小高度 / Minimum height
   * @param max 最大高度 / Maximum height
   */
  public setHeightRange(min: number, max: number): void {
    this._minHeight = min;
    this._maxHeight = max;
  }

  /**
   * 设置相机距离 / Set camera radius
   * @param radius 距离值 / Radius value
   */
  public setRadius(radius: number): void {
    this._radius = Math.max(this._minRadius, Math.min(this._maxRadius, radius))
    if (this._camera) {
      (this._camera as FollowCamera).radius = radius;
    }
  }

  /**
   * 设置相机距离范围 / Set camera radius range
   * @param min 最小距离 / Minimum radius
   * @param max 最大距离 / Maximum radius
   */
  public setRadiusRange(min: number, max: number): void {
    this._minRadius = min;
    this._maxRadius = max;
  }

  /**
   * 设置相机旋转速度 / Set camera rotation speed
   * @param speed 速度值 / Speed value
   */
  public setRotationSpeed(speed: Vector2): void {
    this._rotationSpeed = speed;
  }

  /**
   * 设置平滑因子 / Set smoothing factor
   * @param factor 平滑因子 (0-1之间，值越小越平滑) / Smoothing factor (between 0-1, smaller values are smoother)
   */
  public setSmoothingFactor(factor: number): void {
    this._smoothingFactor = Math.max(0.01, Math.min(1, factor));
  }
  
  /**
   * 更新相机半径 / Update camera radius
   * @param delta 增量 / Delta
   */
  public updateCameraRadius(delta: number): void {
    if(this._followCamera){
      const newRadius = this._radius + delta * this._radiusSpeed;
      this.setRadius(Math.max(this._minRadius, Math.min(this._maxRadius, newRadius)));
    }
  }
  
  /**
   * 更新相机高度 / Update camera height
   * @param delta 增量 / Delta
   */
  public updateCameraHeight(delta: number): void {
    if(this._followCamera){
      const newHeight = this._height + delta * this._heightSpeed;
      this.setHeight(Math.max(this._minHeight, Math.min(this._maxHeight, newHeight)));
    }
  }

  /**
   * 设置相机半径改变速度 / Set camera radius change speed
   * @param speed 速度值 / Speed value
   */
  public setRadiusSpeed(speed: number): void {
    this._radiusSpeed = speed;
  }

  /**
   * 设置相机高度改变速度 / Set camera height change speed
   * @param speed 速度值 / Speed value
   */
  public setHeightSpeed(speed: number): void {
    this._heightSpeed = speed;
  }

  /**
   * 从四元数提取偏航角度 / Extract yaw angle from quaternion
   * @param quaternion 四元数 / Quaternion
   * @returns 偏航角度（弧度） / Yaw angle in radians
   */
  private getYawFromQuaternion(quaternion: Quaternion): number {
    // 使用更稳定的方法直接从四元数计算偏航角 / Use more stable method to calculate yaw directly from quaternion
    // 避免完整的欧拉角转换可能导致的万向节锁问题 / Avoid gimbal lock issues from full Euler angle conversion
    const { x, y, z, w } = quaternion;

    // 计算偏航角（绕Y轴旋转） / Calculate yaw angle (rotation around Y-axis)
    const yaw = Math.atan2(2 * (w * y + x * z), 1 - 2 * (y * y + z * z));

    return yaw;
  }

  /**
   * 从四元数提取俯仰角度 / Extract pitch angle from quaternion
   * @param quaternion 四元数 / Quaternion
   * @returns 俯仰角度（弧度） / Pitch angle in radians
   */
  private getPitchFromQuaternion(quaternion: Quaternion): number {
    // 将四元数转换为欧拉角并提取X轴旋转（俯仰） / Convert quaternion to Euler angles and extract X-axis rotation (pitch)
    const euler = quaternion.toEulerAngles();
    return euler.x;
  }

  /**
   * 重置相机旋转 / Reset camera rotation
   */
  public resetRotation(): void {
    this._rotation = Quaternion.Identity();
    this._currentPitch = 0;
  }

  /**
   * 获取当前旋转四元数 / Get current rotation quaternion
   * @returns 旋转四元数 / Rotation quaternion
   */
  public getRotationQuaternion(): Quaternion {
    return this._rotation.clone();
  }

  /**
   * 设置旋转四元数 / Set rotation quaternion
   * @param quaternion 四元数 / Quaternion
   */
  public setRotationQuaternion(quaternion: Quaternion): void {
    this._rotation = quaternion.clone();
    this._currentPitch = this.getPitchFromQuaternion(quaternion);
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
