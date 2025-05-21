/**
 * State interface - 状态接口
 * Defines the basic structure that all states must implement
 * 定义所有状态必须实现的基本结构
 */
export interface IState {
  /**
   * State name - 状态名称
   */
  name: string;

  /**
   * Called when entering the state - 进入状态时调用
   * @param prevState Previous state name - 前一个状态名称
   */
  onEnter?(prevState: string): void;

  /**
   * Called when updating the state - 更新状态时调用
   * @param deltaTime Time elapsed since last update - 距离上次更新的时间
   */
  onUpdate?(deltaTime: number): void;

  /**
   * Called when exiting the state - 退出状态时调用
   * @param nextState Next state name - 下一个状态名称
   */
  onExit?(nextState: string): void;
}

/**
 * Transition condition interface - 转换条件接口
 * Defines the structure for transition conditions
 * 定义转换条件的结构
 */
export interface ITransitionCondition {
  /**
   * Condition function that returns true if transition should occur
   * 返回true时表示应该进行转换的条件函数
   */
  check: () => boolean;

  /**
   * Priority of this condition (higher number = higher priority)
   * 条件的优先级（数字越大优先级越高）
   */
  priority?: number;
}

/**
 * State configuration interface - 状态配置接口
 * Defines the configuration options for a state
 * 定义状态的配置选项
 */
export interface IStateConfig {
  /**
   * Initial state name - 初始状态名称
   */
  initialState: string;

  /**
   * State transition map - 状态转换映射
   * Key: Current state, Value: Map of target states and their conditions
   * 键：当前状态，值：目标状态及其条件的映射
   */
  transitions: {
    [key: string]: {
      [targetState: string]: ITransitionCondition[];
    }
  };
}

/**
 * State Machine base class - 状态机基类
 * Manages states and their transitions with configuration support
 * 管理状态及其转换，支持配置
 */
export class StateMachine {
  /**
   * Map of all registered states - 所有注册状态的映射
   */
  protected states: Map<string, IState>;

  /**
   * Current active state - 当前激活的状态
   */
  protected currentState: IState | null;

  /**
   * State configuration - 状态配置
   */
  protected config: IStateConfig;

  protected _curPossibleTransitions: {
    targetState: string;
    conditions: ITransitionCondition[];
  }[] = [];

  /**
   * Constructor - 构造函数
   * @param config State configuration - 状态配置
   */
  constructor(config: IStateConfig) {
    this.states = new Map();
    this.currentState = null;
    this.config = config;
  }

  /**
   * Add a new state to the state machine - 向状态机添加新状态
   * @param state State instance to add - 要添加的状态实例
   */
  public addState(state: IState): void {
    if (this.states.has(state.name)) {
      console.warn(`State ${state.name} already exists in the state machine`);
      return;
    }
    this.states.set(state.name, state);
    // Initialize with initial state if this is the first state added
    // 如果这是第一个添加的状态，则使用初始状态进行初始化
    if (this.states.size === 1 && state.name === this.config.initialState) {
      this.currentState = state;
      this.updateCurPossibleTransitions();
      this.currentState.onEnter?.(this.config.initialState);
    }
  }

  /**
   * Transition to a new state - 转换到新状态
   * @param newStateName Name of the state to transition to - 要转换到的状态名称
   * @param isSkipCheck Whether to skip the check for allowed transitions - 是否跳过允许的转换检查
   * @returns boolean indicating if transition was successful - 布尔值表示转换是否成功
   */
  public transitionTo(newStateName: string, isSkipCheck: boolean = false): boolean {
    // Check if the new state exists
    const newState = this.states.get(newStateName);
    if (!newState) {
      console.error(`State ${newStateName} does not exist in the state machine`);
      return false;
    }

    // Check if transition is allowed
    if (!isSkipCheck && this.currentState) {
      const allowedTransitions = this.config.transitions[this.currentState.name];
      if (!allowedTransitions || !(newStateName in allowedTransitions)) {
        console.error(`Transition from ${this.currentState.name} to ${newStateName} is not allowed`);
        return false;
      }
    }
    console.log("transitionTo",newStateName);
    // Perform the transition
    const prevStateName = this.currentState?.name ?? '';
    this.currentState?.onExit?.(newStateName);
    this.currentState = newState;
    this.currentState.onEnter?.(prevStateName);
    this.updateCurPossibleTransitions();
    return true;
  }

  /**
   * Update the current state - 更新当前状态
   * @param deltaTime Time elapsed since last update - 距离上次更新的时间
   */
  public update(deltaTime: number): void {
    this.currentState?.onUpdate?.(deltaTime);
    this.checkTransitions();
  }

  public updateCurPossibleTransitions(): void {
    this._curPossibleTransitions = [];
    if(this.currentState){
      const currentStateTransitions = this.config.transitions[this.currentState.name];
      currentStateTransitions && (this._curPossibleTransitions = Object.entries(currentStateTransitions)
      .map(([targetState, conditions]) => ({
        targetState,
        conditions: conditions.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      }))
      .filter(transition => transition.conditions.length > 0));
    }
  }

  /**
   * Get the current state name - 获取当前状态名称
   * @returns Current state name or null if no state is active
   * 返回当前状态名称，如果没有激活的状态则返回null
   */
  public getCurrentStateName(): string | null {
    return this.currentState?.name ?? null;
  }

  /**
   * Check if a state exists in the state machine - 检查状态机中是否存在某个状态
   * @param stateName Name of the state to check - 要检查的状态名称
   * @returns boolean indicating if the state exists - 布尔值表示状态是否存在
   */
  public hasState(stateName: string): boolean {
    return this.states.has(stateName);
  }

  /**
   * Get the number of registered states - 获取注册状态的数量
   * @returns Number of states - 状态数量
   */
  public getStateCount(): number {
    return this.states.size;
  }

  /**
   * Transition to a new state based on conditions - 基于条件转换到新状态
   * @returns boolean indicating if any transition occurred - 布尔值表示是否发生了转换
   */
  public checkTransitions(): boolean {
    if (!this.currentState) return false;
    // Check conditions in priority order
    // 按优先级顺序检查条件
    for (const transition of this._curPossibleTransitions) {
      const shouldTransition = transition.conditions.every(condition => condition.check());
      if (shouldTransition) {
        return this.transitionTo(transition.targetState);
      }
    }

    return false;
  }

  /**
   * Add a transition condition - 添加转换条件
   * @param fromState Source state name - 源状态名称
   * @param toState Target state name - 目标状态名称
   * @param condition Transition condition - 转换条件
   */
  public addTransitionCondition(
    fromState: string,
    toState: string,
    condition: ITransitionCondition
  ): void {
    if (!this.config.transitions[fromState]) {
      this.config.transitions[fromState] = {};
    }
    if (!this.config.transitions[fromState][toState]) {
      this.config.transitions[fromState][toState] = [];
    }
    this.config.transitions[fromState][toState].push(condition);
  }

  /**
   * Remove a transition condition - 移除转换条件
   * @param fromState Source state name - 源状态名称
   * @param toState Target state name - 目标状态名称
   * @param conditionCheck Function reference to identify the condition - 用于识别条件的函数引用
   */
  public removeTransitionCondition(
    fromState: string,
    toState: string,
    conditionCheck: () => boolean
  ): void {
    const conditions = this.config.transitions[fromState]?.[toState];
    if (conditions) {
      const index = conditions.findIndex(c => c.check === conditionCheck);
      if (index !== -1) {
        conditions.splice(index, 1);
      }
    }
  }
}
