import { Scene, PhysicsImpostor, Vector3, Mesh, AbstractMesh } from "@babylonjs/core";
import { CannonJSPlugin } from "@babylonjs/core/Physics/Plugins/cannonJSPlugin";
import { Singleton } from "../common/Singleton";
import { Const } from "../common/Const";
import { SceneMgr } from "./SceneMgr";

/**
 * PhyMgr - Physics Manager class that handles physics simulation
 * 物理管理器类，用于处理物理模拟
 */
export class PhyMgr extends Singleton<PhyMgr>() {
    private gravity: Vector3 = Const.GRAVITY;
    private physicsPlugin: CannonJSPlugin | null = null;
    private physicsEnabled: boolean = false;
    private activeSceneIds: Set<string> = new Set();

    /**
     * Initialize physics for all active scenes
     * 为所有活动场景初始化物理
     */
    public initialize(): void {
        if (this.physicsEnabled) {
            console.warn("Physics already initialized");
            return;
        }

        this.physicsPlugin = new CannonJSPlugin();
        // 配置CannonJS插件
        this.physicsPlugin.setTimeStep(1/60); // 设置物理步长
        this.enablePhysicsForActiveScenes();
        this.physicsEnabled = true;
        console.log("Physics initialized with CannonJS plugin");
    }

    /**
     * Enable physics for all active scenes
     * 为所有活动场景启用物理
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
     * Add physics impostor to a mesh in a specific scene
     * 为特定场景中的网格添加物理碰撞体
     * @param sceneId Scene ID / 场景ID
     * @param mesh Mesh to add physics to / 要添加物理的网格
     * @param type Type of physics impostor / 物理碰撞体类型
     * @param options Physics impostor options / 物理碰撞体选项
     */
    public addPhysicsImpostor(
        sceneId: string,
        mesh: Mesh,
        type: number = PhysicsImpostor.BoxImpostor,
        options: { mass?: number; friction?: number; restitution?: number } = {}
    ): void {
        if (!this.physicsEnabled || !this.activeSceneIds.has(sceneId)) {
            console.warn("Physics not initialized for scene:", sceneId);
            return;
        }

        const scene = SceneMgr.instance.getScene(sceneId);
        if (!scene) {
            console.warn("Scene not found:", sceneId);
            return;
        }

        const { mass = 0, friction = 0.2, restitution = 0.2 } = options;
        mesh.physicsImpostor = new PhysicsImpostor(
            mesh,
            type,
            { mass, friction, restitution },
            scene.scene
        );
    }

    /**
     * Remove physics impostor from a mesh
     * 从网格移除物理碰撞体
     * @param mesh Mesh to remove physics from / 要移除物理的网格
     */
    public removePhysicsImpostor(mesh: AbstractMesh): void {
        if (mesh.physicsImpostor) {
            mesh.physicsImpostor.dispose();
            mesh.physicsImpostor = null;
        }
    }

    /**
     * Enable/disable physics simulation for all active scenes
     * 启用/禁用所有活动场景的物理模拟
     * @param enabled Whether physics should be enabled / 是否启用物理
     */
    public setPhysicsEnabled(enabled: boolean): void {
        if (enabled && !this.physicsEnabled) {
            this.initialize();
        } else if (!enabled && this.physicsEnabled) {
            this.disablePhysicsForActiveScenes();
            this.physicsEnabled = false;
        }
    }

    /**
     * Handle scene activation
     * 处理场景激活
     * @param sceneId Scene ID / 场景ID
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

    /**
     * Handle scene deactivation
     * 处理场景停用
     * @param sceneId Scene ID / 场景ID
     */
    public onSceneDeactivated(sceneId: string): void {
        if (this.physicsEnabled && this.activeSceneIds.has(sceneId)) {
            const scene = SceneMgr.instance.getScene(sceneId);
            if (scene) {
                scene.scene.disablePhysicsEngine();
                this.activeSceneIds.delete(sceneId);
            }
        }
    }

    /**
     * Dispose physics manager
     * 销毁物理管理器
     */
    public dispose(): void {
        if (this.physicsEnabled) {
            this.disablePhysicsForActiveScenes();
            this.physicsEnabled = false;
        }
        this.physicsPlugin = null;
        this.activeSceneIds.clear();
        console.log("Physics Manager disposed");
    }
}
