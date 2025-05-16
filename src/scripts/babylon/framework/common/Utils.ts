
import { v4 as uuidv4 } from 'uuid';

/**
 * Utility class for common functions
 * 通用工具类
 */ 
export class Utils {
    /**
     * Get a random integer between min and max (inclusive)
     * 获取一个介于min和max之间的随机整数（包括min和max）
     * @param min The minimum value
     * 
     */
    public static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Get a random float between min and max (inclusive)
     * 获取一个介于min和max之间的随机浮点数（包括min和max）
     * @param min The minimum value
     * 
     */
    public static getRandomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }   

    /**
     * Get a UUID
     * 获取一个UUID
     * 
     */
    public static getUUID(): string {
        return uuidv4();
    }
}
