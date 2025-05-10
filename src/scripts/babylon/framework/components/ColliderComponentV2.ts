import type { PhysicsAggregate } from "babylonjs/Physics/v2/physicsAggregate";
import { BaseComponent } from "./BaseComponent";
import { HavokPlugin, Mesh, PhysicsBody, PhysicsEventType, PhysicsMotionType, PhysicsShape, Vector3, type IBasePhysicsCollisionEvent, type IPhysicsCollisionEvent } from "@babylonjs/core";
import type { IGameEntity } from "../interface/IGameEntity";
import { PhyMgrV2 } from "../mgr/PhyMgrV2";
import type { GameEntity } from "../entity/GameEntity";
import { SceneMgr } from "../mgr/SceneMgr";

/**
 * 碰撞器组件基类 / Base class for collider components
 * 用于处理游戏对象的物理碰撞 / Handles physical collisions for game objects
 */
export abstract class ColliderComponentV2 extends BaseComponent {
     public name: string = "ColliderComponentV2";

     /**
      * 质量 / Mass
      * 影响物理模拟中的重力效果 / Affects gravity effects in physics simulation
      */
     protected _mass: number = 1;   
     
     /**
      * 观察者 / Observer
      */
     protected observer: any;

     /**
      * 获取质量 / Get mass
      * @returns 质量值 / Mass value
      */
     public get mass(): number {
          return this._mass;
     }

     /**
      * 设置质量 / Set mass
      * @param value 质量值 / Mass value
      */
     public set mass(value: number) {
          this._mass = value;
          if (this.entity?.physicsBody) {
               this.entity.physicsBody.setMassProperties ({
                   mass: value,
               });
          }
     }

     /**
      * 碰撞器对应的网格ID / The mesh ID of the collider
      */
     protected _meshIds: Array<number> = [];

     /**
      * 获取碰撞器对应的网格ID / Get the mesh ID of the collider
      * @returns 碰撞器对应的网格ID / The mesh ID of the collider
      */
     public get meshIds(): Array<number> {
          return this._meshIds;
     }

     /**
      * 设置碰撞器对应的网格ID / Set the mesh ID of the collider
      * @param value 碰撞器对应的网格ID / The mesh ID of the collider
      */
     public set meshIds(value: Array<number>) {   
          this._meshIds = value;
          for(let i = 0; i < this._meshIds.length; i++) {
               PhyMgrV2.instance.registerColliderComponentByMeshId(this._meshIds[i],this);
          }
     }

     public addMeshId(meshId: number) {
          this._meshIds.push(meshId);
          PhyMgrV2.instance.registerColliderComponentByMeshId(meshId,this);
     }

     public removeMeshId(meshId: number) {
          this._meshIds.splice(this._meshIds.indexOf(meshId),1);
          PhyMgrV2.instance.unregisterColliderComponentByMeshId(meshId);
          
     }

     public clearMeshIds() {
          this._meshIds.forEach(id => {
               PhyMgrV2.instance.unregisterColliderComponentByMeshId(id);
          });
          this._meshIds = [];
     }

     /**
      * 摩擦系数 / Friction coefficient
      * 影响物体之间的摩擦力 / Affects friction between objects
      */
     public friction: number = 0.5;

     /**
      * 弹性系数 / Restitution coefficient
      * 影响碰撞后的反弹程度 / Affects bounce after collision
      */
     public restitution: number = 0.8;

     /**
      * 物理运动类型 / Physics motion type
      * 定义物体的物理行为类型 / Defines the type of physical behavior
      */
     public physicsMotionType: PhysicsMotionType = PhysicsMotionType.DYNAMIC;

     /**
      * 是否为触发器 / Whether it's a trigger
      * true: 仅检测碰撞不产生物理反应 / true: Only detect collision without physical response
      * false: 正常物理碰撞 / false: Normal physical collision
      */
     public isTrigger: boolean = false;

     /**
      * 是否初始休眠 / Whether to start asleep
      * true: 初始状态为休眠 / true: Initial state is asleep
      * false: 初始状态为激活 / false: Initial state is active
      */
     public startsAsleep: boolean = false;

     /**
      * 构造函数 / Constructor
      * @param name 组件名称 / Component name
      */
     constructor(name: string = "ColliderComponentV2") {
          super(name);
     }

     /**
      * 将碰撞器附加到游戏实体 / Attach collider to game entity
      * @param gameEntity 游戏实体 / Game entity
      */
     public attachTo(gameEntity: IGameEntity): void {
          if (this.entity?.physicsBody) {
               console.warn("ColliderComponentV2 already exists");
               return;
          }
          super.attachTo(gameEntity);
          if (PhyMgrV2.instance.addPhysicsBody(this.entity!, this.physicsMotionType, this.startsAsleep)) {
               PhyMgrV2.instance.registerColliderComponent(this.entity!, this);
          }
     }

     /**
      * 释放组件资源 / Dispose component resources
      */
     public dispose(): void {
          super.dispose();
          PhyMgrV2.instance.unregisterColliderComponent(this.entity!);
          this.entity?.physicsBody?.dispose();
          this.clearMeshIds();
     }

     /**
      * 设置碰撞器形状 / Set collider shape
      * @param shape 物理形状 / Physics shape
      */
     public setShape(shape: PhysicsShape) {
          if (this.entity?.physicsBody) {
               this.entity.physicsBody.shape = shape;
          }
     }


     /**
      * 绑定碰撞事件 / Bind collision events
      * 根据是否为触发器绑定不同的事件处理 / Bind different event handlers based on whether it's a trigger
      */
     protected bindEvent() {
          const physicsEngine = PhyMgrV2.instance.getPhysicsEngine(this.entity?.scene?.id!);
          if (!physicsEngine) return;

          if (this.isTrigger) {
               PhyMgrV2.instance.bindTriggerEvent(this.entity?.physicsBody?.transformNode.uniqueId!,
                    (collisionEvent) => {
                         this.onTriggerEnter(collisionEvent);
                    },
                    (collisionEvent) => {
                         this.onTriggerExit(collisionEvent);
                    });
          } else {
               this.entity?.physicsBody?.setCollisionCallbackEnabled(true);
               this.entity?.physicsBody?.setCollisionEndedCallbackEnabled(true);
               const observable = this.entity?.physicsBody?.getCollisionObservable();
               if (!observable) return;
               this.observer = observable.add((collisionEvent) => {
                    if (collisionEvent.type === PhysicsEventType.COLLISION_STARTED) {
                         this.onCollisionEnter(collisionEvent);
                    } else if (collisionEvent.type === PhysicsEventType.COLLISION_CONTINUED) {
                         this.onCollisionContinue(collisionEvent);
                    } else if (collisionEvent.type === PhysicsEventType.COLLISION_FINISHED) {
                         this.onCollisionExit(collisionEvent);
                    }
               });
          }
     }

     public unbindEvent() {
          if (this.isTrigger) {
               PhyMgrV2.instance.unbindTriggerEvent(this.entity?.physicsBody?.transformNode.uniqueId!);
          } else {
               this.entity?.physicsBody?.setCollisionCallbackEnabled(false);
               this.entity?.physicsBody?.setCollisionEndedCallbackEnabled(false);
               const observable = this.entity?.physicsBody?.getCollisionObservable();
               if (!observable) return;
               observable.remove(this.observer);
               this.observer = null;
          }
     }

     /**
      * 碰撞开始回调 / Collision start callback
      * @param collisionEvent 碰撞事件 / Collision event
      */
     protected onCollisionEnter(collisionEvent: IPhysicsCollisionEvent): void { }

     /**
      * 碰撞持续回调 / Collision continue callback
      * @param collisionEvent 碰撞事件 / Collision event
      */
     protected onCollisionContinue(collisionEvent: IPhysicsCollisionEvent): void { }

     /**
      * 碰撞结束回调 / Collision end callback
      * @param collisionEvent 碰撞事件 / Collision event
      */
     protected onCollisionExit(collisionEvent: IPhysicsCollisionEvent): void { }

     /**
      * 触发器进入回调 / Trigger enter callback
      * @param collisionEvent 碰撞事件 / Collision event
      */
     protected onTriggerEnter(collisionEvent: IBasePhysicsCollisionEvent): void { }

     /**
      * 触发器退出回调 / Trigger exit callback
      * @param collisionEvent 碰撞事件 / Collision event
      */
     protected onTriggerExit(collisionEvent: IBasePhysicsCollisionEvent): void { }
}