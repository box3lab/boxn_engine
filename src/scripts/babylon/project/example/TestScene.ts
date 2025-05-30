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
    HavokPlugin,
    TransformNode,
    PhysicsAggregate,
    PhysicsShapeType,
    Quaternion,
    PhysicsBody,
    PhysicsMotionType,
    PhysicsShapeContainer,
    PhysicsShapeBox,
    PhysicsEventType,
    Ray,
    PickingInfo,
    AbstractMesh,
    type Nullable,
    EnvironmentHelper,
    DefaultRenderingPipeline,
    Color4,
    DirectionalLight,
    ShadowGenerator,
    PBRMaterial,
    PhysicsCharacterController,
    CapsuleBuilder,
    PhysicsShapeCapsule,
    Vector2
} from "@babylonjs/core";
import 'babylonjs-loaders';
import type { IScene } from "../../framework/interface/IScene";
import HavokPhysics from "@babylonjs/havok";
import { GameEntity } from "../../framework/entity/GameEntity";
import { SkeletonMeshComponent } from "../../framework/components/mesh/SkeletonMeshComponent";
import { SkeletonAnimationComponent } from "../../framework/components/animation/SkeletonAnimationComponent";
import { CapsuleColliderComponentV2 } from "../../framework/components/collider/CapsuleColliderComponentV2";
import { InputSystem } from "../../framework/input/InputSystem";
import { InputEventType, type InputActionEvent } from "../../framework/input/InputAction";
import { MovementComponent } from "../../framework/components/movement/MovementComponent";
import { ColliderComponentV2 } from "../../framework/components/collider/ColliderComponentV2";
import * as GUI from "@babylonjs/gui";
import { BaseScene } from "../../framework/scene/BaseScene";
import { PlayerInputComponent } from "../../framework/components/input/PlayerInputComponent";
import { PlayerEntity } from "../../framework/entity/PlayerEntity";
import { ResMgr } from "../../framework/mgr/ResMgr";
import { GLBAsset } from "../../framework/asset/GLBAsset";
import { UINode } from "../../framework/ui/UINode";
import { Control, TextBlock } from "@babylonjs/gui";
import { UIPanel } from "../../framework/ui/UIPanel";
import { UIText } from "../../framework/ui/UIText";
import { UIButton } from "../../framework/ui/UIButton";
import { UIMgr } from "../../framework/mgr/UIMgr";
import { UIImage } from "../../framework/ui/UIImage";
/**
 * TestScene - Creates a scene with a panel and a character using ThirdPersonComp
 */
export class TestScene extends BaseScene {

    private physicsEngine: HavokPlugin | undefined;
    // private character: Mesh | null = null;
    // private thirdPersonController: ThirdPersonComp | null = null;
    private camera: ArcRotateCamera | null = null;

    private entity: GameEntity | undefined;
    entities: any;
    // private advancedTexture: GUI.AdvancedDynamicTexture | undefined;
    // private touchCoordsText: GUI.TextBlock | undefined; // Replaced for multi-touch
    // private touchDot: GUI.Ellipse | undefined; // Replaced for multi-touch
    private touchControls: Map<number, { textBlock: GUI.TextBlock; dot: GUI.Ellipse }> = new Map();
    
    constructor(id: string, name: string, engine: Engine, priority: number = 0) {
        super(id, name, engine, priority);
        
        // 设置场景背景色
        this.scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);
        
        // 设置环境光
        const envHelper = this.scene.createDefaultEnvironment({
            createGround: false,
            createSkybox: true,
            environmentTexture: "https://playground.babylonjs.com/textures/environment.env",
            cameraExposure: 1.0,
            backgroundYRotation: Math.PI / 2,
            sizeAuto: true,
            skyboxSize: 1000,
            groundSize: 1000,
        });

        // 添加主方向光
        const dirLight = new DirectionalLight("dirLight", new Vector3(-1, -2, -1), this.scene);
        dirLight.position = new Vector3(20, 40, 20);
        dirLight.intensity = 0.7;

        // 设置阴影
        const shadowGenerator = new ShadowGenerator(1024, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;
        shadowGenerator.darkness = 0.4;
        // this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
        this.setupCamera();
        this.setupLights();
        this.setupPostProcessing();
        HavokPhysics({
            locateFile: (fileName) => `${import.meta.env.BASE_URL}${fileName}`
        }).then((havok) => {
            this.physicsEngine = new HavokPlugin(true,havok);
            this.scene.enablePhysics(new Vector3(0, -9.81, 0), this.physicsEngine);
            this.createGround();
            this.createPanel();
            this.createCharacter();
            this.camera?.dispose();
        });


        
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
        // Keyboard events
        InputSystem.instance.init(this.scene);
        return Promise.resolve();
    }
    update(deltaTime: number): void {
        // Update scene components
        // if(this.root)console.log(this.root);
        if(this.entity){
            this.entity.update(deltaTime);
        }
    }

  
    /**
     * Get all entities in the scene
     * 获取场景中的所有实体
     * @returns An array of all entities in the scene / 场景中的所有实体数组
     */
    public getEntities(): GameEntity[] {
        return this.entities;
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
        this.camera.lowerRadiusLimit = 100;
        this.camera.upperRadiusLimit = 100;
        this.camera.wheelDeltaPercentage = 0.01;
        this.camera.position = new Vector3(0, 50, -50);
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
        // const ground = MeshBuilder.CreateGround(
        //     "ground", 
        //     { width: 20, height: 20 }, 
        //     this.scene
        // );
        
        // // Create material for the ground
        // const groundMaterial = new StandardMaterial("groundMaterial", this.scene);
        // groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
        
        // // Apply material to ground
        // ground.material = groundMaterial;

        // Add physics impostor to ground
        // ground.physicsImpostor = new PhysicsImpostor(
        //     ground,
        //     PhysicsImpostor.BoxImpostor,
        //     { mass: 0, restitution: 0.2, friction: 0.5 },
        //     this.scene
        // );

        // const groundAggregate = new PhysicsAggregate(ground, 
        //     PhysicsShapeType.BOX, { mass: 0, restitution:0.75, friction:0.5, mesh:ground}, this.scene);
    }
    
    /**
     * Create a panel for the scene
     */
    private createPanel(): void {
        // Create a panel
        const panel = MeshBuilder.CreateBox(
            "panel", 
            { width: 500, height: 1, depth: 500 }, 
            this.scene
        );
        
        // Position panel above ground
        panel.position.y = 0;
        
        // Create PBR material for the panel
        const panelMaterial = new PBRMaterial("panelMaterial", this.scene);
        panelMaterial.albedoColor = new Color3(0.2, 0.4, 0.8);
        panelMaterial.metallic = 0.0;
        panelMaterial.roughness = 0.8;
        panelMaterial.environmentIntensity = 1.0;
        
        // Apply material to panel
        panel.material = panelMaterial;

        const panelAggregate = new PhysicsAggregate(panel, 
            PhysicsShapeType.BOX, { mass: 0, restitution:0.1, friction:2, mesh:panel}, this.scene);
        // panelAggregate.body.setEventMask(0x1);

        // const image = new GUI.Image("testImage", "./images/test1.png");
        // // Set image properties
        // image.width = "200px";
        // image.height = "200px";
        // image.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        // image.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        
        // // Add the image to the advanced texture
        // this.advancedTexture?.addControl(image);
    }

    /**
     * Creates and displays a test image using GUI
     */
    
    /**
     * Create character and setup third person controller
     */
    private async createCharacter(): Promise<void> {
        // this.root = new TransformNode("root", this.scene);
        // this.root.position = new Vector3(0, 10, 0);

        // const capsule = MeshBuilder.CreateCapsule("capsule", {height: 20, radius: 4}, this.scene);
        // capsule.parent = this.root;
        // capsule.position = new Vector3(0, 10, 0);

        // console.log("this.root.uniqueId",this.root.uniqueId);
        // const cube = MeshBuilder.CreateBox(
        //     "physicsCube",
        //     { height: 8, width: 5, depth: 5},
        //     this.scene
        // );
        
        // // Create material for the cube
        // const cubeMaterial = new StandardMaterial("cubeMaterial", this.scene);
        // cubeMaterial.diffuseColor = new Color3(1, 0, 0); // Red color
        // cube.material = cubeMaterial;

        // cube.parent = this.root;
        // cube.position = new Vector3(0, 0, 0);

      
        // // cube.parent = this.root;

        // const cube2 = MeshBuilder.CreateBox(
        //     "physicsCube2",
        //     { height: 5, width: 5, depth: 5},
        //     this.scene
        // );
        
        // // Create material for the cube
        // const cubeMaterial2 = new StandardMaterial("cubeMaterial2", this.scene);
        // cubeMaterial2.diffuseColor = new Color3(0, 0, 0); // Red color
        // cube2.material = cubeMaterial2;

        // cube2.parent = this.root;
        // cube2.position = new Vector3(0, 4, 0);

        // const cubeShape = new PhysicsShapeBox( new Vector3(0, 0, 0),
        //     Quaternion.Identity(),
        // new Vector3(5, 8, 5),
        //     this.scene);
        // const cubeShape2 = new PhysicsShapeBox( new Vector3(0, 0, 0),
        //     Quaternion.Identity(),
        //     new Vector3(5, 5, 5),
        //     this.scene);
 
        // // const cubeAggregate = new PhysicsAggregate(cube, 
        // //     PhysicsShapeType.BOX, { mass: 1, restitution:0.75, friction:0.5, mesh:cube}, this.scene);
        // // const cubeAggregate2 = new PhysicsAggregate(cube2, 
        // //     PhysicsShapeType.BOX, { mass: 1, restitution:0.75, friction:0.5, mesh:cube2}, this.scene);

        // const shape = new PhysicsShapeContainer(this.scene);
        // shape.addChildFromParent(this.root,cubeShape,cube);
        // shape.addChildFromParent(this.root,cubeShape2,cube2);

        // const body = new PhysicsBody(this.root, 
        //     PhysicsMotionType.DYNAMIC, false, this.scene);
        // shape.material = {friction: 0.2, restitution: 0};
        // body.shape = shape;

        // body.setMassProperties ({
        //     mass: 1,
        // });
        
        // body.setCollisionCallbackEnabled(true);
        // body.shape.isTrigger = false;
        // const observable = body.getCollisionObservable();
        // const observer = observable.add((collisionEvent) => {
        //   // Process collisions for the player
        //   console.log("collisionEvent",collisionEvent);
        // //   if(collisionEvent.type === PhysicsEventType.COLLISION_STARTED){
        // //     console.log("碰撞开始");
        // //     // console.log(collisionEvent.collidedAgainstIndex);
        // //     console.log(collisionEvent.collidedAgainst.transformNode.uniqueId);
        // //     console.log(collisionEvent.collidedAgainst.transformNode.name);
        // //   }
        // });

        // const cube3 = MeshBuilder.CreateBox(
        //     "Trigger3",
        //     { height: 10, width: 10, depth: 10},
        //     this.scene
        // );
        // // cube3.position = new Vector3(0, 30, 0);
        // // cube3.parent = this.root;
        // // Create material for the cube
        // const cubeMaterial3 = new StandardMaterial("cubeMaterial3", this.scene);
        // cubeMaterial3.diffuseColor = new Color3(0, 0, 0); // Red color
        // cube3.material = cubeMaterial3;

        // const cubeShape3 = new PhysicsShapeBox( new Vector3(0, 0, 0),
        //     Quaternion.Identity(),
        //     new Vector3(10, 10, 10),
        //     this.scene);
        // cubeShape3.isTrigger = true;
        // const body3 = new PhysicsBody(cube3 ,
        //     PhysicsMotionType.STATIC, false, this.scene);
        // body3.shape = cubeShape3;
        // // body3.setCollisionCallbackEnabled(true);
        // // body3.setCollisionEndedCallbackEnabled(true);
        // body3.disablePreStep = true;
        // body3.shape.isTrigger = true;

        // cube3.parent = this.root;
        // const observable3 = body3.getCollisionObservable();
        // const observer3 = observable3.add((collisionEvent) => {
        //     console.log("collisionEvent",collisionEvent);
        // });

        // this.physicsEngine?.onTriggerCollisionObservable.add((collisionEvent) => {
        //     console.log("collisionEvent",collisionEvent);
        // });
        // 射线检测
        // this.scene.onPointerDown = (evt, pickResult) => {
        //     // if (pickResult.hit) {
        //     //     console.log("Hit:", pickResult.pickedMesh?.name);
        //     //     // 可以根据pickedMesh.name判断击中了哪个碰撞器
        //     // }
        //     const ray: Ray = new Ray(new Vector3(0, 3, -10), new Vector3(0, 0, 1), 10);
        //     const rayResult: Nullable<PickingInfo> = this.scene.pickWithRay(ray, (mesh:AbstractMesh) => {
        //         // return mesh !== cube; // 排除子弹自身
        //         return true;
        //     });

        //     if (rayResult && rayResult.hit) {
        //         console.log("Hit1:", rayResult.pickedMesh?.name);
        //         // // 处理击中逻辑
        //         // if (rayResult.pickedMesh && rayResult.pickedMesh.name === "enemy") {
        //         //     (rayResult.pickedMesh as any).takeDamage(damageAmount); // 假设敌人有takeDamage方法
        //         // }
                
        //         // if (pickResult.pickedPoint) {
        //         //     createExplosionEffect(pickResult.pickedPoint);
        //         // }
        //     }

        //     const ray2: Ray = new Ray(new Vector3(0, 10, -10), new Vector3(0, 0, 1), 10);
        //     const rayResult2: Nullable<PickingInfo> = this.scene.pickWithRay(ray2, (mesh:AbstractMesh) => {
        //         // return mesh !== cube; // 排除子弹自身
        //         return true;
        //     });

        //     if (rayResult2 && rayResult2.hit) {
        //         console.log("Hit2:", rayResult2.pickedMesh?.name);
        //         // // 处理击中逻辑
        //         // if (rayResult.pickedMesh && rayResult.pickedMesh.name === "enemy") {
        //         //     (rayResult.pickedMesh as any).takeDamage(damageAmount); // 假设敌人有takeDamage方法
        //         // }
                
        //         // if (pickResult.pickedPoint) {
        //         //     createExplosionEffect(pickResult.pickedPoint);
        //         // }
        //     }
        // };
        // cube3.parent = this.root;
      
        // You have two options:
        // Body-specific callback
        // const observable = cubeAggregate.body.getCollisionObservable();
        // const observer = observable.add((collisionEvent) => {
        // // Process collisions for the player
        //     console.log(collisionEvent);
        // });

        this.entity = new PlayerEntity("player",this);
        this.entity.root.root.position = new Vector3(0, 0, 0);

        // const mesh = await ResMgr.instance.loadResource("./glb/test1.glb", GLBAsset, 
        //     {
        //         onProgress: (progress) => {
        //             console.log("progress",progress);
        //             if(progress === 1){
        //                 // const root = new TransformNode("root",this.scene);
                       
        //                 // // @ts-ignore
        //                 // mesh.data?.addAllToScene(this.scene);
        //                 // root.position = new Vector3(5, 0, 0);
        //             }
        //         }
        //     },this.scene);
        // const root = new TransformNode("root",this.scene);
        // mesh.data?.meshes.forEach((item) => {
        //     console.log("item",item);
        //     if(item.name === "Alpha_Surface" || item.name === "Alpha_Joints"){
        //         item.isVisible = false;
        //     }
        // });
        // const model = mesh.data?.instantiateModelsToScene();
        // model?.rootNodes.forEach((item) => {
        //     console.log("item",item);
        //     // @ts-ignore
        //     item.setParent(root);
        // });
        // root.position = new Vector3(5, 0.5, 0);
        // if (model) {
        //     model.animationGroups?.forEach((item) => {
        //         if(item.name.replace("Clone of ","") === "Running"){
        //             console.log("item",item.name);
        //             item.play(true);
        //         }
        //         // else{
        //         //     item.stop();
        //         // }
        //     });
        //     console.log("model",model.animationGroups);
        // }
        // this.camera?.attachControl(displayCapsule, false);

        // characterController.keepDistance = 10;
        // characterController.keepContactTolerance = 0.01;
        // characterController.maxSlopeCosine = 0.5;
        // characterController.maxCharacterSpeedForSolver = 10;
        // characterController.characterStrength = 10;
        // characterController.acceleration = 10;
        // characterController.maxAcceleration = 10;

        const cubeMaterial = new StandardMaterial("cubeMaterial3", this.scene);
        cubeMaterial.diffuseColor = new Color3(1,0,0);
      
        const cube1 = MeshBuilder.CreateBox("cube1",{width:1,height:1,depth:1},this.scene);
        cube1.position = new Vector3(1,0.5,1);
        cube1.material = cubeMaterial;

        const cube1Aggregate = new PhysicsAggregate(cube1, 
            PhysicsShapeType.BOX, { mass: 100, restitution:0.5, friction:0.7,startAsleep:false, mesh:cube1}, this.scene);

        const cube2 = MeshBuilder.CreateBox("cube2",{width:1,height:1,depth:1},this.scene);
        cube2.position = new Vector3(-1,0.5,1);
        cube2.material = cubeMaterial;

        const cube2Aggregate = new PhysicsAggregate(cube2, 
            PhysicsShapeType.BOX, { mass: 100, restitution:0.5, friction:0.7,startAsleep:false, mesh:cube2}, this.scene);


        const cube3 = MeshBuilder.CreateBox("cube3",{width:1,height:1,depth:1},this.scene);
        cube3.position = new Vector3(0,0.5,1);
        cube3.material = cubeMaterial;

        const cube3Aggregate = new PhysicsAggregate(cube3, 
            PhysicsShapeType.BOX, { mass: 100, restitution:0, friction:0.7,startAsleep:false, mesh:cube3}, this.scene);

        const cube4 = MeshBuilder.CreateBox("cube4",{width:1,height:1,depth:1},this.scene);
        cube4.position = new Vector3(0,1.5,1);
        cube4.material = cubeMaterial;

        const cube4Aggregate = new PhysicsAggregate(cube4, 
            PhysicsShapeType.BOX, { mass: 100, restitution:0, friction:0.7,startAsleep:false, mesh:cube4}, this.scene);
        
        const cubeMaterial2 = new StandardMaterial("cubeMaterial3", this.scene);
        cubeMaterial2.diffuseColor = new Color3(0,1,0);

        const cube5 = MeshBuilder.CreateBox("cube5",{width:1,height:1,depth:1},this.scene);
        cube5.position = new Vector3(2,1,1);
        cube5.material = cubeMaterial2;
        
        const cube5Aggregate = new PhysicsAggregate(cube5, 
            PhysicsShapeType.BOX, { mass: 100, restitution:0, friction:0.1,startAsleep:false, mesh:cube5}, this.scene); 
        cube5Aggregate.body.setMotionType(PhysicsMotionType.STATIC);

        // const basePanel = new UIPanel(this.scene,"basePanel");
        // basePanel.setPosition(0,0);
        // basePanel.setWidth("1000px");
        // basePanel.setHeight("600px");
        // basePanel.isDebug = true;

        UIMgr.instance.initializeForScene(this.scene);

        // 创建主面板
        const mainPanel = new UIPanel("MainPanel", this.scene, 1, 1);
        mainPanel.position = new Vector2(0, 0);
        // mainPanel.background = "#2c3e5070";
        mainPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        mainPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        UIMgr.instance.addElement(mainPanel,this.scene);
        
        const image = new UIImage("testImage", "./images/test1.png");
        mainPanel.addChild(image);
        image.width = "100px";
        image.height = "100px";
        image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        image.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        image.position = new Vector2(0,0);
    
        const test = new UIText("text","AMC");
        mainPanel.addChild(test);
        test.fontSize = 22;
        test.color = "white";
        test.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        test.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        test.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        test.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        test.position = new Vector2(0,128);
   
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

    private setupPostProcessing(): void {
        // 创建默认渲染管线
        const pipeline = new DefaultRenderingPipeline(
            "defaultPipeline", 
            true, 
            this.scene
        );

        // 启用泛光效果
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.7;
        pipeline.bloomWeight = 0.3;
        pipeline.bloomKernel = 64;
        pipeline.bloomScale = 0.5;

        // 启用景深效果
        // pipeline.depthOfFieldEnabled = true;
        // // pipeline.depthOfField.blur = 32; // Use correct property 'blur' instead of 'blurLevel'
        // pipeline.depthOfField.focalLength = 100;
        // pipeline.depthOfField.fStop = 1.4;
        // pipeline.depthOfField.focusDistance = 2000;

        // 启用环境光遮蔽
        // pipeline.screenSpaceReflectionsEnabled = true;
        // pipeline.screenSpaceReflectionBlurKernel = 32;
        // pipeline.screenSpaceReflectionStrength = 0.5;

        // 启用色调映射
        pipeline.imageProcessingEnabled = true;
        pipeline.imageProcessing.contrast = 1.1;
        pipeline.imageProcessing.exposure = 1.0;
        pipeline.imageProcessing.toneMappingEnabled = true;
    }
}
