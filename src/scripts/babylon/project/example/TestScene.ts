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
    PBRMaterial
} from "@babylonjs/core";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import type { IScene } from "../../framework/interface/IScene";
import HavokPhysics from "@babylonjs/havok";
import { GameEntity } from "../../framework/entity/GameEntity";
import { SkeletonMeshComponent } from "../../framework/components/mesh/SkeletonMeshComponent";
import { SkeletonAnimationComponent } from "../../framework/components/SkeletonAnimationComponent";
import { CapsuleColliderComponentV2 } from "../../framework/components/collider/CapsuleColliderComponentV2";
import { InputSystem } from "../../framework/input/InputSystem";
import { InputEventType, type InputActionEvent } from "../../framework/input/InputAction";

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
    private physicsEngine: HavokPlugin | undefined;
    // private character: Mesh | null = null;
    // private thirdPersonController: ThirdPersonComp | null = null;
    private camera: ArcRotateCamera | null = null;

    private root:TransformNode | undefined;
    
    constructor(id: string, name: string, engine: Engine, priority: number = 0) {
        this.id = id;
        this.name = name;
        this.engine = engine;
        this.priority = priority;
        this.scene = new Scene(this.engine);
        
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
        this.camera.lowerRadiusLimit = 100;
        this.camera.upperRadiusLimit = 100;
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
            { width: 50, height: 1, depth: 50 }, 
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
            PhysicsShapeType.BOX, { mass: 0, restitution:0.75, friction:0.5, mesh:panel}, this.scene);
        // panelAggregate.body.setEventMask(0x1);
    }
    
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

     
        // // Keyboard events
        InputSystem.instance.init(this.scene);
        // 注册输入动作
        const moveForward = InputSystem.instance.registerAction("MoveForward", { key: "w" });
        const moveBackward = InputSystem.instance.registerAction("MoveBackward", { key: "s" });
        const moveLeft = InputSystem.instance.registerAction("MoveLeft", { key: "a" });
        const moveRight = InputSystem.instance.registerAction("MoveRight", { key: "d" });

        // 添加监听器
        moveForward.addListener((event: InputActionEvent) => {
            if (event.eventType === InputEventType.KEYDOWN) {
                console.log("Moving forward");
                // 实际移动逻辑
            }
           else  if (event.eventType === InputEventType.KEYUP) {
                console.log("Moving forward released");
                // 实际移动逻辑
            }
        });

        // 添加监听器
        moveBackward.addListener((event: InputActionEvent) => {
            if (event.eventType === InputEventType.KEYDOWN) {
                console.log("Moving backward");
                // 实际移动逻辑
            }
            else  if (event.eventType === InputEventType.KEYUP) {
                console.log("Moving backward released");
                // 实际移动逻辑
            }
        });

        // 添加监听器
        moveLeft.addListener((event: InputActionEvent) => {
            if (event.eventType === InputEventType.KEYDOWN) {
                console.log("Moving left");
                // 实际移动逻辑
            }
            else  if (event.eventType === InputEventType.KEYUP) {
                console.log("Moving left released");
                // 实际移动逻辑
            }
        });

        // 添加监听器
        moveRight.addListener((event: InputActionEvent) => {
            if (event.eventType === InputEventType.KEYDOWN) {
                console.log("Moving right");
                // 实际移动逻辑
            }
            else  if (event.eventType === InputEventType.KEYUP) {
                console.log("Moving right released");
                // 实际移动逻辑
            }
        });
        

        const entity = new GameEntity("player",this);
        entity.root.root.position = new Vector3(0, 30, 0);
        const skeletonMeshComponent = new SkeletonMeshComponent("skeletonMeshComponent","./glb/test.glb",this.scene);
        entity.addComponent("SkeletonMeshComponent",skeletonMeshComponent);
        skeletonMeshComponent.scale = 10;

        const skeletonAnimationComponent = new SkeletonAnimationComponent("skeletonAnimationComponent",skeletonMeshComponent);
        entity.addComponent("SkeletonAnimationComponent",skeletonAnimationComponent);
        skeletonAnimationComponent.initAnimation("Idle",true);

        const capsuleColliderComponent = new CapsuleColliderComponentV2("CapsuleColliderComponentV2", 3, 18);
        entity.addComponent("CapsuleColliderComponentV2",capsuleColliderComponent);
        capsuleColliderComponent.IsShowDebug = false;

    
     
        // BABYLON.SceneLoader.ImportMesh("", "./glb/", 
        //     //@ts-ignore
        //     "test.glb", this.scene, (newMeshes, particleSystems, skeletons, animationGroups) => {
        //     var hero = newMeshes[0];

        //     //Scale the model down        
        //     hero.scaling.scaleInPlace(10);

        //     //Lock camera on the character 
        //     // camera1.target = hero;
        //     //Hero character variables 
        //     var heroSpeed = 0.03;
        //     var heroSpeedBackwards = 0.01;
        //     var heroRotationSpeed = 0.01;

        //     var animating = true;
        //     console.log("newMeshes",newMeshes);
        //     // console.log("particleSystems",particleSystems);
        //     console.log("skeletons",skeletons);
        //     console.log("animationGroups",animationGroups);

        //     const walkAnim = animationGroups.find(anim => anim.name === "Walking");
        //     const walkBackAnim = animationGroups.find(anim => anim.name === "WalkingBack");
        //     const idleAnim = animationGroups.find(anim => anim.name === "Idle");
        //     // const sambaAnim = this.scene.getAnimationGroupByName("Samba");

            

        //     //Rendering loop (executed for everyframe)
        //     this.scene.onBeforeRenderObservable.add(() => {
        //         var keydown = false;
        //         //Manage the movements of the character (e.g. position, direction)
        //         if (inputMap["w"]) {
        //             hero.moveWithCollisions(hero.forward.scaleInPlace(heroSpeed));
        //             keydown = true;
        //         }
        //         if (inputMap["s"]) {
        //             hero.moveWithCollisions(hero.forward.scaleInPlace(-heroSpeedBackwards));
        //             keydown = true;
        //         }
        //         if (inputMap["a"]) {
        //             hero.rotate(BABYLON.Vector3.Up(), -heroRotationSpeed);
        //             keydown = true;
        //         }
        //         if (inputMap["d"]) {
        //             hero.rotate(BABYLON.Vector3.Up(), heroRotationSpeed);
        //             keydown = true;
        //         }
        //         if (inputMap["b"]) {
        //             keydown = true;
        //         }

        //         //Manage animations to be played  
        //         if (keydown) {
        //             if (!animating) {
        //                 animating = true;
        //                 if (inputMap["s"]) {
        //                     //Walk backwards
        //                     walkBackAnim?.start(true, 1.0, walkBackAnim.from, walkBackAnim.to, false);
        //                 }
        //                 else if
        //                     (inputMap["b"]) {
        //                     //Samba!
        //                     // sambaAnim?.start(true, 1.0, sambaAnim.from, sambaAnim.to, false);
        //                 }
        //                 else {
        //                     //Walk
        //                     walkAnim?.start(true, 1.0, walkAnim.from, walkAnim.to, false);
        //                 }
        //             }
        //         }
        //         else {

        //             if (animating) {
        //                 //Default animation is idle when no key is down     
        //                 idleAnim?.start(true, 1.0, idleAnim.from, idleAnim.to, false);

        //                 //Stop all animations besides Idle Anim when no key is down
        //                 // sambaAnim?.stop();
        //                 walkAnim?.stop();
        //                 walkBackAnim?.stop();

        //                 //Ensure animation are played only once per rendering loop
        //                 animating = false;
        //             }
        //         }
        //     });
        // });
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
