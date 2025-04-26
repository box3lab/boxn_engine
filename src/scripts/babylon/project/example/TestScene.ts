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
    AbstractMesh
} from "@babylonjs/core";
// import { ImportMeshAsync, LoadAssetContainerAsync } from "@babylonjs/core/Loading/sceneLoader";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { ResMgr } from "../../framework/mgr/ResMgr";    
import { ResourceStatus, type IGameAsset, ResourceType } from "../../framework/interface/IGameAsset";
import { GLBAsset } from "../../framework/asset/GLBAsset";
import { GameEntity } from "../../framework/entity/GameEntity";
import type { IScene } from "../../framework/interface/IScene";

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
    
        constructor(id: string, name: string, engine: Engine, priority: number = 0) {
        this.id = id;
        this.name = name;
        this.engine = engine;
        this.priority = priority;
        this.scene = new Scene(this.engine);
        
        // Setup scene
        this.setupCamera();
        this.setupLights();
        this.createGround();
        this.createPanel();
        this.createCharacter();
        
        // Start the render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        
        // Handle browser resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
    initialize(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    update(deltaTime: number): void {
        throw new Error("Method not implemented.");
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
    private createCharacter(): void {
        // Load the blackPearl.glb model from local assets
        // ImportMeshAsync("./glb/ship.babylon", this.scene)
        //     .then((result) => {
        //         console.log(result)
        //         // newMeshes[0].position.copyFrom(shipPostion);
        //         // result.meshes[0].setParent(null);
        //         if (this.camera) {
        //             this.camera.target = result.meshes[1].position;
        //         }
        //     });

        // //@ts-ignore
        // BABYLON.SceneLoader.ImportMesh("", "./glb/", "Bird_5.glb", this.scene, function(newMeshes: AbstractMesh[]){
        //     // Add code here
        // });

        ResMgr.instance.setScene(this.scene);

        ResMgr.instance.loadResource("./glb/Bird_5.glb", GLBAsset).then((mesh: GLBAsset) => {
            console.log(mesh);
            // const gameEntity = new GameEntity("Bird_5");
            // gameEntity.addComponent(new MeshComp(mesh), "ThirdPersonComp");
        });
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
