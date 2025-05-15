---
description: 
globs: 
alwaysApply: true
---

# Babylon ts
- 使用babylon.js 8.1.1作为基础框架开发
- 使用typescript进行代码编写
- 需要添加详尽中英文注释

## Directory Structure
- 根目录`/babylon-project`包含项目的基本结构
- `/node_modules`: 项目依赖模块

## Source Directory (/src)
- `/scripts`: 核心代码结构
- `/scripts/BoxNextEngine.ts`: 框架入口文件。
- `/scripts/babylon/framework`: 框架代码
- `/scripts/babylon/framework/mgr`: 各个模块管理者
- `/scripts/babylon/framework/common`: 公共模块
- `/scripts/babylon/framework/interface`: 各种类型的抽象接口
- `/scripts/babylon/framework/asset`: 资源管理基类
- `/scripts/babylon/framework/asset/loader`: 资源加载器
- `/scripts/babylon/framework/entity`: 游戏实体对象（场景上所有物体基于实体对象拓展）
- `/scripts/babylon/framework/component`: 游戏组件对象
- `/scripts/babylon/framework/input`: 游戏输入系统

## 逻辑组成
- 使用GameEntity + Component机制完成逻辑
- 单一Component只完成一个对应模块的功能

# TypeScript Coding Standards
## 基本规范
- 使用 `const` 而不是 `let` 来声明常量
- 使用 `const` 而不是 `let` 来声明变量
- 使用2个空格缩进
- 显式声明函数返回类型
- 使用单引号
- 使用箭头函数
- 使用解构赋值
- 避免使用 `any` 类型
