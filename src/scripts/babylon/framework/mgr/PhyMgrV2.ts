import type { PhysicsEngine } from "@babylonjs/core/Physics/v2/physicsEngine";
import { Singleton } from "../common/Singleton";
import { Const } from "../common/Const";
import type { ColliderComponent } from "../components/collider/ColliderComponent";
import { Vector3, HavokPlugin, PhysicsBody, PhysicsMotionType, type Nullable, PhysicsEventType, type IBasePhysicsCollisionEvent, PhysicsShapeContainer, PhysicsAggregate, PhysicsShapeType, } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { SceneMgr } from "./SceneMgr";
import type { GameEntity } from "../entity/GameEntity";
import type { ColliderComponentV2 } from "../components/collider/ColliderComponentV2";
import type { IPhysicsEngine } from "@babylonjs/core/Physics/IPhysicsEngine";

/**
 * Physics Manager V2 - Handles physics simulation and collision detection
 * 物理管理器 V2 - 处理物理模拟和碰撞检测
 */
export class PhyMgrV2 extends Singleton<PhyMgrV2>() {
    /** Gravity vector for physics simulation / 物理模拟的重力向量 */
    private gravity: Vector3 = Const.GRAVITY;
    
    /** Havok physics plugin instance / Havok物理插件实例 */
    private physicsPlugin: HavokPlugin | null = null;
    
    /** Flag indicating if physics is enabled / 物理是否启用的标志 */
    private physicsEnabled: boolean = false;
    
    /** Set of active scene IDs with physics enabled / 启用了物理的活动场景ID集合 */
    private activeSceneIds: Set<string> = new Set();
    
    /** Map of collider components by unique ID / 碰撞体组件映射表，以唯一ID为键 */
    private colliderComponents: Map<number, ColliderComponentV2> = new Map();
    
    /** Map of trigger enter event handlers / 触发器进入事件处理函数映射表 */
    private triggerEnterEventMap: Map<number, (collisionEvent: IBasePhysicsCollisionEvent) => void> = new Map();
    
    /** Map of trigger exit event handlers / 触发器退出事件处理函数映射表 */
    private triggerExitEventMap: Map<number, (collisionEvent: IBasePhysicsCollisionEvent) => void> = new Map();

    /**
    * Initialize physics for all active scenes
    * 为所有活动场景初始化物理
    * Loads Havok physics plugin and sets up physics simulation
    * 加载Havok物理插件并设置物理模拟
    */
    public async initialize(): Promise<void> {
        if (this.physicsEnabled) {
            console.warn("Physics already initialized");
            return;
        }

        await HavokPhysics({
            locateFile: (fileName) => `${import.meta.env.BASE_URL}${fileName}`
        }).then((havok) => {
            this.physicsPlugin = new HavokPlugin(true, havok);
            this.physicsPlugin.setTimeStep(1 / 60); // 设置物理步长
            this.enablePhysicsForActiveScenes();
            this.physicsEnabled = true;
            console.log("Physics initialized with HavokPlugin plugin");

            // 绑定触发事件
            this.physicsPlugin.onTriggerCollisionObservable.add((collisionEvent) => {
               this.triggerEvent(collisionEvent);
            });
        });
    }

    /**
    * Enable physics for all active scenes
    * 为所有活动场景启用物理
    * Enables physics simulation for each active scene
    * 为每个活动场景启用物理模拟
    */
    private enablePhysicsForActiveScenes(): void {
        const activeScenes = SceneMgr.instance.getActiveScenes();
        for (const scene of activeScenes) {
            if (!this.activeSceneIds.has(scene.id)) {
                scene.scene.enablePhysics(this.gravity, this.physicsPlugin!);
                this.activeSceneIds.add(scene.id);
            }
        }
    }

    /**
    * Disable physics for all active scenes
    * 为所有活动场景禁用物理
    * Disables physics simulation for each active scene
    * 为每个活动场景禁用物理模拟
    */
    private disablePhysicsForActiveScenes(): void {
        const activeScenes = SceneMgr.instance.getActiveScenes();
        for (const scene of activeScenes) {
            if (this.activeSceneIds.has(scene.id)) {
                scene.scene.disablePhysicsEngine();
                this.activeSceneIds.delete(scene.id);
            }
        }
    }

    /**
     * Set gravity for all active scenes
     * 设置所有活动场景的重力
     * @param gravity Gravity vector / 重力向量
     * Updates the gravity vector for all active scenes
     * 更新所有活动场景的重力向量
     */
    public setGravity(gravity: Vector3): void {
        if (!this.physicsEnabled) {
            console.warn("Physics not initialized");
            return;
        }
        this.gravity = gravity;

        const activeScenes = SceneMgr.instance.getActiveScenes();
        for (const scene of activeScenes) {
            if (this.activeSceneIds.has(scene.id)) {
                scene.scene.getPhysicsEngine()?.setGravity(gravity);
            }
        }
    }

    /**
     * Add a physics aggregate to a game entity
     * 为游戏实体添加物理聚合
     * @param gameEntity The game entity to add physics aggregate to / 要添加物理聚合的游戏实体
     * @param motionType Type of physics motion (default: DYNAMIC) / 物理运动类型（默认：动态）
     * @param shape Type of physics shape (default: CONTAINER) / 物理形状类型（默认：容器）
     * @param isTrigger Whether the aggregate is a trigger (default: false) / 是否为触发器（默认：否）
     * @param startsAsleep Whether the aggregate starts in sleep state (default: false) / 是否以休眠状态开始（默认：否）
     * @returns The created physics aggregate or null if failed / 创建的物理聚合，如果失败则返回null
     */
    public addPhysicsAggregate(gameEntity: GameEntity, motionType: PhysicsMotionType = PhysicsMotionType.DYNAMIC,
        shape: PhysicsShapeType = PhysicsShapeType.CONTAINER,
        isTrigger: boolean = false,
            startsAsleep: boolean = false): PhysicsAggregate | null {
        if(!this.physicsEnabled || !gameEntity.scene?.id) return null;
        if(!this.activeSceneIds.has(gameEntity.scene?.id)){
            console.warn("Physics not initialized for scene:", gameEntity.scene?.id);
            return null;
        }
        const scene = SceneMgr.instance.getScene(gameEntity.scene?.id);
        if(!scene)return null;
        const physicsEngine = scene.scene.getPhysicsEngine();
        if(!physicsEngine)return null;
        const physicsAggregate = new PhysicsAggregate(gameEntity.getRoot().root, shape, {
            mass: 1,
            restitution: 0,
            friction: 0
        }, scene.scene);
        // Use proper methods from PhysicsAggregate
        physicsAggregate.body.setMotionType(motionType);
        // physicsAggregate.body.setMassProperties({ inertia: Vector3.ZeroReadOnly });
        if (physicsAggregate.body.shape) {
            physicsAggregate.body.shape.isTrigger = isTrigger;
        }
        if(startsAsleep) {
            physicsAggregate.body.disablePreStep = true;
        }
        return physicsAggregate;
    }

    /**
     * Add physics body to a game entity
     * 为游戏实体添加物理体
     * @param gameEntity The game entity to add physics to / 要添加物理的游戏实体
     * @param motionType Type of physics motion (default: DYNAMIC) / 物理运动类型（默认：动态）
     * @param startsAsleep Whether the body starts in sleep state (default: false) / 是否以休眠状态开始（默认：否）
     * @returns The created physics body or null if failed / 创建的物理体，如果失败则返回null
     */
    public addPhysicsBody(gameEntity: GameEntity, motionType: PhysicsMotionType = PhysicsMotionType.DYNAMIC,
            startsAsleep: boolean = false): PhysicsBody | null {
        if(!this.physicsEnabled || !gameEntity.scene?.id) return null;
        if(!this.activeSceneIds.has(gameEntity.scene?.id)){
            console.warn("Physics not initialized for scene:", gameEntity.scene?.id);
            return null;
        }
        const scene = SceneMgr.instance.getScene(gameEntity.scene?.id);
            if(!scene)return null;
        const physicsEngine = scene.scene.getPhysicsEngine();
        if(!physicsEngine)return null;
        const physicsBody = new PhysicsBody(gameEntity.getRoot().root,
            motionType,startsAsleep,scene.scene);
        gameEntity.physicsBody = physicsBody;
        const shape = new PhysicsShapeContainer(scene.scene);
        physicsBody.shape = shape;
        return physicsBody;
    }

    /**
     * Register a collider component for a game entity
     * 为游戏实体注册碰撞体组件
     * @param gameEntity The game entity / 游戏实体
     * @param collider The collider component to register / 要注册的碰撞体组件
     */
    public registerColliderComponent(gameEntity: GameEntity, collider: ColliderComponentV2){
        if(!this.physicsEnabled || !gameEntity.scene?.id)return;
        if(!this.activeSceneIds.has(gameEntity.scene?.id)){
            console.warn("Physics not initialized for scene:", gameEntity.scene?.id);
            return;
        }           
        if(this.colliderComponents.has(gameEntity.getRoot().root.uniqueId)){
            console.warn("Collider component already registered for gameEntity:", gameEntity.getRoot().root.uniqueId);
            return;
        }
        this.colliderComponents.set(gameEntity.getRoot().root.uniqueId,collider);
    }

    /**
     * Register a collider component for a mesh ID
     * 为网格ID注册碰撞体组件
     * @param meshId The mesh ID / 网格ID
     * @param collider The collider component to register / 要注册的碰撞体组件
     */
    public registerColliderComponentByMeshId(meshId: number, collider: ColliderComponentV2){
        if(!this.physicsEnabled || !meshId)return;
        if(!this.colliderComponents.has(meshId)){
            console.warn("Physics not initialized for scene:", meshId);
            return;
        }
        this.colliderComponents.set(meshId,collider);
    }

    /**
     * Unregister a collider component from a game entity
     * 从游戏实体注销碰撞体组件
     * @param gameEntity The game entity / 游戏实体
     */
    public unregisterColliderComponent(gameEntity: GameEntity){
        if(!this.physicsEnabled || !gameEntity.scene?.id)return;
        if(!this.activeSceneIds.has(gameEntity.scene?.id)){
            console.warn("Physics not initialized for scene:", gameEntity.scene?.id);
            return;
        }
        if(!this.colliderComponents.has(gameEntity.getRoot().root.uniqueId)){
            console.warn("Collider component not registered for gameEntity:", gameEntity.getRoot().root.uniqueId);
            return;
        }
        this.colliderComponents.delete(gameEntity.getRoot().root.uniqueId);
    }

    /**
     * Unregister a collider component from a mesh ID
     * 从网格ID注销碰撞体组件
     * @param meshId The mesh ID / 网格ID
     */
    public unregisterColliderComponentByMeshId(meshId: number){
        if(!this.colliderComponents.has(meshId)){
            console.warn("Collider component not registered for meshId:", meshId);
            return;
        }
        this.colliderComponents.delete(meshId);
    }

    /**
     * Handle scene activation
     * 处理场景激活
     * @param sceneId Scene ID / 场景ID
     * Enables physics for the newly activated scene
     * 为新激活的场景启用物理
     */
    public onSceneActivated(sceneId: string): void {
        if (this.physicsEnabled) {
            const scene = SceneMgr.instance.getScene(sceneId);
            if (scene && !this.activeSceneIds.has(sceneId)) {
                scene.scene.enablePhysics(this.gravity, this.physicsPlugin!);
                this.activeSceneIds.add(sceneId);
            }
        }
    }

    public onSceneDeactivated(sceneId: string): void {
        if (this.physicsEnabled) {
            const scene = SceneMgr.instance.getScene(sceneId);
            if (scene && this.activeSceneIds.has(sceneId)) {
                scene.scene.disablePhysicsEngine();
                this.activeSceneIds.delete(sceneId);    
            }
        }
    }

    /**
     * Get physics engine for a specific scene
     * 获取特定场景的物理引擎
     * @param sceneId Scene ID / 场景ID
     * @returns The physics engine or null if not found / 物理引擎，如果未找到则返回null
     */
    public getPhysicsEngine(sceneId:string):Nullable<IPhysicsEngine>{
        const scene = SceneMgr.instance.getScene(sceneId);
        if(!scene)return null;
        return scene.scene.getPhysicsEngine();
    }

    /**
     * Get collider component by unique ID
     * 通过唯一ID获取碰撞体组件
     * @param uniqueId Unique ID of the collider / 碰撞体的唯一ID
     * @returns The collider component or null if not found / 碰撞体组件，如果未找到则返回null
     */
    public getColliderComponent(uniqueId: number):Nullable<ColliderComponentV2>  {
        return this.colliderComponents.get(uniqueId) || null;
    }

    /**
     * Handle trigger collision events
     * 处理触发器碰撞事件
     * @param collisionEvent The collision event data / 碰撞事件数据
     */
    private triggerEvent(collisionEvent: IBasePhysicsCollisionEvent){
        const physicsBody = collisionEvent.collidedAgainst;
        if(!physicsBody)return;
     
        if(collisionEvent.type === PhysicsEventType.TRIGGER_ENTERED){
            const enterMap = this.triggerEnterEventMap.get(physicsBody.transformNode.uniqueId);
            if(enterMap){
                enterMap(collisionEvent);
            }
         
        }  else if(collisionEvent.type === PhysicsEventType.TRIGGER_EXITED){
            const exitMap = this.triggerExitEventMap.get(physicsBody.transformNode.uniqueId);
            if(exitMap){
                exitMap(collisionEvent);
            }
       }
    }

    /**
     * Bind trigger events for a specific entity
     * 为特定实体绑定触发器事件
     * @param uniqueId Unique ID of the entity / 实体的唯一ID
     * @param enterEvent Trigger enter event handler / 触发器进入事件处理函数
     * @param exitEvent Trigger exit event handler / 触发器退出事件处理函数
     */
    public bindTriggerEvent(uniqueId: number, enterEvent: (collisionEvent: IBasePhysicsCollisionEvent) => void,
        exitEvent: (collisionEvent: IBasePhysicsCollisionEvent) => void){
        this.triggerEnterEventMap.set(uniqueId, enterEvent);
        this.triggerExitEventMap.set(uniqueId, exitEvent);
    }

    /**
     * Unbind trigger events for a specific entity
     * 为特定实体解绑触发器事件
     * @param uniqueId Unique ID of the entity / 实体的唯一ID
     */
    public unbindTriggerEvent(uniqueId: number){
        this.triggerEnterEventMap.delete(uniqueId);
        this.triggerExitEventMap.delete(uniqueId);
    }
}