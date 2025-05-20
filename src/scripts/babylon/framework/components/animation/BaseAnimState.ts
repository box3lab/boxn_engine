import type { IState } from "../../common/state/StateMachine";
import type { SkeletonMeshComponent } from "../mesh/SkeletonMeshComponent";

export class BaseAnimState implements IState {
    public name: string;
    protected skeletonMeshComponent: SkeletonMeshComponent;
    public exitTime: number = 0;
    public isHasExitTime: boolean = false;
    public exitTimeCounter: number = 0;

    constructor(name: string, skeletonMeshComponent: SkeletonMeshComponent, 
        isHasExitTime: boolean = false) {
        this.name = name;
        this.skeletonMeshComponent = skeletonMeshComponent;
        this.isHasExitTime = isHasExitTime;
    }

    public onEnter(prevState: string): void {
        if (this.isHasExitTime) {
            this.exitTimeCounter = 0;
        }
    }

    public onExit(nextState: string): void {
     
    }

    public onUpdate(deltaTime: number): void {
        if (this.isHasExitTime) {
            this.exitTimeCounter += deltaTime;
        }
    }
    
}
