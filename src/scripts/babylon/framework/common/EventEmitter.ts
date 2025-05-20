// 定义事件类型 / Define event type
type EventType = string | symbol;

// 定义事件处理函数接口 / Define event handler interface
interface EventHandler<T = any> {
  (payload?: T): void;
}

// 定义事件映射接口 / Define event mapping interface
interface EventHandlerMap {
  [key: EventType]: EventHandler[];
}

/**
 * 事件发射器类 / Event Emitter Class
 * 用于实现发布-订阅模式，允许对象之间进行松耦合的通信
 * Implements the publish-subscribe pattern, allowing loose coupling between objects
 */
export class EventEmitter {
  private handlers: EventHandlerMap = {};

  /**
   * 订阅事件 / Subscribe to an event
   * @param event 事件名称 / Event name
   * @param handler 事件处理函数 / Event handler function
   * @returns this 返回当前实例以支持链式调用 / Returns this instance for method chaining
   */
  on<T = any>(event: EventType, handler: EventHandler<T>): this {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
    return this;
  }

  /**
   * 一次性订阅事件 / Subscribe to an event once
   * 事件触发后自动取消订阅 / Automatically unsubscribes after the event is triggered
   * @param event 事件名称 / Event name
   * @param handler 事件处理函数 / Event handler function
   * @returns this 返回当前实例以支持链式调用 / Returns this instance for method chaining
   */
  once<T = any>(event: EventType, handler: EventHandler<T>): this {
    const onceHandler: EventHandler<T> = (payload?: T) => {
      handler(payload);
      this.off(event, onceHandler);
    };
    return this.on(event, onceHandler);
  }

  /**
   * 取消订阅事件 / Unsubscribe from an event
   * @param event 事件名称 / Event name
   * @param handler 事件处理函数（可选，不提供则移除所有该事件的监听器）/ Event handler function (optional, removes all listeners if not provided)
   * @returns this 返回当前实例以支持链式调用 / Returns this instance for method chaining
   */
  off<T = any>(event: EventType, handler?: EventHandler<T>): this {
    if (!handler) {
      // 如果没有提供handler，则移除所有该事件的监听器
      // If no handler is provided, remove all listeners for this event
      delete this.handlers[event];
      return this;
    }

    const handlers = this.handlers[event];
    if (handlers) {
      this.handlers[event] = handlers.filter(h => h !== handler);
      if (this.handlers[event].length === 0) {
        delete this.handlers[event];
      }
    }
    return this;
  }

  /**
   * 触发事件 / Emit an event
   * @param event 事件名称 / Event name
   * @param payload 事件数据（可选）/ Event data (optional)
   * @returns this 返回当前实例以支持链式调用 / Returns this instance for method chaining
   */
  emit<T = any>(event: EventType, payload?: T): this {
    const handlers = this.handlers[event];
    if (handlers) {
      // 复制一份 handlers 数组，防止在回调中修改数组导致问题
      // Create a copy of handlers array to prevent issues when modifying array during callbacks
      handlers.slice().forEach(handler => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`Error in handler for event "${event.toString()}"`, err);
        }
      });
    }
    return this;
  }

  /**
   * 获取所有事件名称 / Get all event names
   * @returns EventType[] 返回所有已注册的事件名称数组 / Returns array of all registered event names
   */
  eventNames(): EventType[] {
    return Reflect.ownKeys(this.handlers);
  }

  /**
   * 获取指定事件的监听器数量 / Get the number of listeners for a specific event
   * @param event 事件名称 / Event name
   * @returns number 返回监听器数量 / Returns the number of listeners
   */
  listenerCount(event: EventType): number {
    const handlers = this.handlers[event];
    return handlers ? handlers.length : 0;
  }

  /**
   * 移除所有监听器 / Remove all listeners
   * @returns this 返回当前实例以支持链式调用 / Returns this instance for method chaining
   */
  removeAllListeners(): this {
    this.handlers = {};
    return this;
  }
}