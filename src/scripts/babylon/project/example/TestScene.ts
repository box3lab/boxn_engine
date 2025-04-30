import { 
    Scene, 
    Engine, 
    Vector3, 
    HemisphericLight, 
    MeshBuilder, 
    StandardMaterial, 
    Color3,
    ArcRotateCamera,
    // Mesh
    AbstractMesh,
    AssetsManager,
    SceneLoader,
    PhysicsImpostor,
    CannonJSPlugin,
    TransformNode,
    Mesh
} from "@babylonjs/core";
// import { ImportMeshAsync, LoadAssetContainerAsync } from "@babylonjs/core/Loading/sceneLoader";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { ResMgr } from "../../framework/mgr/ResMgr";    
import { ResourceStatus, type IGameAsset, ResourceType } from "../../framework/interface/IGameAsset";
import { GLBAsset } from "../../framework/asset/GLBAsset";
import { GameEntity } from "../../framework/entity/GameEntity";
import type { IScene } from "../../framework/interface/IScene";
import { ColliderComponent } from "../../framework/components/ColliderComponent";
import { PhyGameEntity } from "../../framework/entity/PhyGameEntity";

/**
 * TestScene - Creates a scene with a panel and a character using ThirdPersonComp
 */
export class TestScene implements IScene {
    id: string;                      // Unique identifier / 唯一标识符
    name: string;                    // Display name / 显示名称
    scene: Scene;                    // Babylon.js Scene / Babylon.js 场景
    isActive: boolean = false;       // Whether scene is active / 场景是否处于活动状态
    isLoaded: boolean = false;       // Whether scene is loaded / 场景是否已加载
    priority: number = 0;            // Render priority / 渲染优先级（较低的优先渲染）
    private engine: Engine;
    // private character: Mesh | null = null;
    // private thirdPersonController: ThirdPersonComp | null = null;
    private camera: ArcRotateCamera | null = null;

    private root:Mesh | undefined;
    
    constructor(id: string, name: string, engine: Engine, priority: number = 0) {
        this.id = id;
        this.name = name;
        this.engine = engine;
        this.priority = priority;
        this.scene = new Scene(this.engine);
        this.scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin());
        
        // Setup scene
        this.setupCamera();
        this.setupLights();
        this.createGround();
        this.createPanel();
        this.createCharacter();
        
        // // Start the render loop
        // this.engine.runRenderLoop(() => {
        //     this.scene.render();
        // });
        
        // // Handle browser resize
        // window.addEventListener('resize', () => {
        //     this.engine.resize();
        // });
    }
    initialize(): Promise<void> {
        // Initialize scene resources
        return Promise.resolve();
    }
    update(deltaTime: number): void {
        // Update scene components
        // if(this.root)console.log(this.root);
    }
    
    /**
     * Setup the camera for the scene
     */
    private setupCamera(): void {
        // Create a camera for the scene
        this.camera = new ArcRotateCamera(
            "camera", 
            Math.PI / 2, 
            Math.PI / 3, 
            10, 
            Vector3.Zero(), 
            this.scene
        );
        
        // Camera settings
        this.camera.lowerRadiusLimit = 200;
        this.camera.upperRadiusLimit = 200;
        this.camera.wheelDeltaPercentage = 0.01;
        // this.camera.position = new Vector3(500, 200, 200);
    }
    
    /**
     * Setup the lights for the scene
     */
    private setupLights(): void {
        // Create a basic light
        const light = new HemisphericLight(
            "light", 
            new Vector3(0, 1, 0), 
            this.scene
        );
        light.intensity = 0.7;
    }
    
    /**
     * Create a ground for the scene
     */
    private createGround(): void {
        // Create a ground
        const ground = MeshBuilder.CreateGround(
            "ground", 
            { width: 20, height: 20 }, 
            this.scene
        );
        
        // Create material for the ground
        const groundMaterial = new StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
        
        // Apply material to ground
        ground.material = groundMaterial;

        // Add physics impostor to ground
        ground.physicsImpostor = new PhysicsImpostor(
            ground,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.2, friction: 0.5 },
            this.scene
        );
    }
    
    /**
     * Create a panel for the scene
     */
    private createPanel(): void {
        // Create a panel
        const panel = MeshBuilder.CreateBox(
            "panel", 
            { width: 5, height: 0.1, depth: 5 }, 
            this.scene
        );
        
        // Position panel above ground
        panel.position.y = 0.5;
        
        // Create material for the panel
        const panelMaterial = new StandardMaterial("panelMaterial", this.scene);
        panelMaterial.diffuseColor = new Color3(0.2, 0.4, 0.8);
        
        // Apply material to panel
        panel.material = panelMaterial;
    }
    
    /**
     * Create character and setup third person controller
     */
    private async createCharacter(): Promise<void> {
        // Create physics cube using Babylon.js native physics
        const cube = MeshBuilder.CreateBox(
            "physicsCube",
            { size: 2 },
            this.scene
        );
        
        // Create material for the cube
        const cubeMaterial = new StandardMaterial("cubeMaterial", this.scene);
        cubeMaterial.diffuseColor = new Color3(1, 0, 0); // Red color
        cube.material = cubeMaterial;
        
        // Position the cube
        cube.position = new Vector3(0, 10, 0);

        this.root = new Mesh("root_1",this.scene);
        this.root.position = new Vector3(0, 10, 0);
        cube.setParent(this.root);
        
        // Enable physics on the cube
        cube.physicsImpostor = new PhysicsImpostor(
            cube,
            PhysicsImpostor.BoxImpostor,
            { mass: 1, restitution: 0.7, friction: 0.2 },
            this.scene
        );

        this.root.physicsImpostor = new PhysicsImpostor(
            this.root,
            PhysicsImpostor.NoImpostor,
            { mass: 1, restitution: 0.7, friction: 0.2 },
            this.scene
        );
 

        // Create the bird entity
        // const gameEntity = new PhyGameEntity("Bird_5", this);
        // const staticMeshComponent = new StaticMeshEntityComponent("StaticMeshComp", this);
        // staticMeshComponent.addMesh("./glb/Bird_5.glb", this.scene);
        // gameEntity.addComponent(staticMeshComponent.name, staticMeshComponent);

        // const colliderComponent = new ColliderComponent("ColliderComp", new Vector3(10, 10, 10), new Vector3(0, 5, 0));
    
        // gameEntity.addComponent(colliderComponent.name, colliderComponent);
        // // colliderComponent.setPhysicsProperties(1, 0.5, 0.5);
        // // colliderComponent.setUseGravity(false);  
        // gameEntity.transform.position.y = 50;

        // console.log(gameEntity);
    }
    
    /**
     * Dispose scene resources when component unmounts
     */
    public dispose(): void {
        // Dispose ThirdPersonComp controller
        
        // Stop the render loop
        this.engine.stopRenderLoop();
        
        // Dispose scene
        this.scene.dispose();
        
        // Dispose engine
        this.engine.dispose();
    }
}
