/**
 * 单例模式 (Singleton Pattern)
 * @param T 
 * @returns 
 */
export function Singleton<T>() {
    class Singleton {
        protected constructor() {}

        /**
         * 单例实例 (Singleton instance)
         */
        private static _instance: Singleton | null = null;  

        /**
         * 获取单例实例 (Get singleton instance)
         * @returns 单例实例 (Singleton instance)
         */
        public static get instance(): T {
            if(Singleton._instance == null) {
                Singleton._instance = new this();
            }
            return Singleton._instance as T;
        }

        /**
         * 销毁单例实例 (Destroy singleton instance)
         */
        public static destroyInstance(): void {
            Singleton._instance = null;
        }
    }

    return Singleton;
}