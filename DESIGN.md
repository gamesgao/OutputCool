# OutputCool 技术设计文档

**版本**: 2.0  
**日期**: 2025-12-31  
**作者**: Yu Gao  
**状态**: Draft

---

## 1. 项目概述

### 1.1 项目定位

OutputCool 是一个基于 Electron 的桌面通知展示系统，通过远程通信方式接收各类消息，并以炫酷的视觉效果在桌面上展示。核心特色是毛玻璃效果和流畅的动画交互。

### 1.2 核心价值

- **酷炫视觉**: 毛玻璃背景、流畅动画、优雅的渐变过渡
- **多样化内容**: 支持文本、图片、表格、富文本等多种内容格式
- **灵活通信**: 可扩展的通信层设计，支持多种数据源接入
- **开发友好**: 完整的 TypeScript 类型支持和文档注释

### 1.3 使用场景

- 开发调试时的实时消息提醒
- 系统监控告警展示
- 远程通知推送
- 演示和展示场景

---

## 2. 技术栈

### 2.1 核心技术

| 技术           | 版本              | 用途         |
| -------------- | ----------------- | ------------ |
| **Electron**   | 最新稳定版 (v28+) | 桌面应用框架 |
| **Vue 3**      | 最新版 (v3.4+)    | 前端框架     |
| **TypeScript** | 最新版 (v5.3+)    | 类型安全     |
| **Vite**       | 最新版 (v5+)      | 构建工具     |
| **Socket.IO**  | v4+               | 实时通信     |

### 2.2 UI/样式方案

| 技术          | 选择        | 理由                                 |
| ------------- | ----------- | ------------------------------------ |
| **UI 组件库** | 自定义组件  | 保证视觉效果的完全可控，避免库的冗余 |
| **CSS 方案**  | UnoCSS      | 性能优秀，按需生成，配置灵活         |
| **动画库**    | GSAP (可选) | 复杂动画场景的备选方案               |
| **图标**      | Iconify     | 海量图标库，按需加载                 |

### 2.3 开发工具

- **代码规范**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **文档生成**: TypeDoc (自动生成 API 文档)
- **测试**: Vitest (单元测试)

---

## 3. 架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────┐
│           Electron Main Process             │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │ Window       │      │ Communication   │ │
│  │ Manager      │◄────►│ Layer           │ │
│  └──────────────┘      └─────────────────┘ │
│         │                       │           │
│         │                       │           │
└─────────┼───────────────────────┼───────────┘
          │                       │
          │ IPC                   │ External
          │                       │ Connections
          │                       │
┌─────────▼───────────────────────▼───────────┐
│        Electron Renderer Process            │
│  ┌──────────────────────────────────────┐  │
│  │         Vue 3 Application            │  │
│  │  ┌────────────┐  ┌────────────────┐ │  │
│  │  │ Notification│  │ Message Queue  │ │  │
│  │  │ Component  │  │ Manager        │ │  │
│  │  └────────────┘  └────────────────┘ │  │
│  │  ┌────────────┐  ┌────────────────┐ │  │
│  │  │ Content    │  │ Animation      │ │  │
│  │  │ Renderer   │  │ Controller     │ │  │
│  │  └────────────┘  └────────────────┘ │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 3.2 模块划分

#### 3.2.1 主进程模块 (Main Process)

```typescript
src/main/
├── index.ts                 // 主进程入口
├── window/
│   ├── WindowManager.ts     // 窗口管理器
│   └── WindowConfig.ts      // 窗口配置
├── communication/
│   ├── ICommunicationAdapter.ts  // 通信层接口
│   ├── SocketIOAdapter.ts        // Socket.IO 实现
│   ├── WebSocketAdapter.ts       // WebSocket 实现 (未来扩展)
│   └── HTTPAdapter.ts            // HTTP 实现 (未来扩展)
└── utils/
    └── logger.ts            // 日志工具
```

#### 3.2.2 渲染进程模块 (Renderer Process)

```typescript
src/renderer/
├── main.ts                  // 渲染进程入口
├── App.vue                  // 根组件
├── components/
│   ├── Notification.vue          // 通知主组件
│   ├── ContentRenderer/
│   │   ├── TextContent.vue       // 文本内容
│   │   ├── MarkdownContent.vue   // Markdown 内容
│   │   ├── ImageContent.vue      // 图片内容
│   │   ├── TableContent.vue      // 表格内容
│   │   ├── ButtonContent.vue     // 按钮内容
│   │   └── ProgressContent.vue   // 进度条内容
│   └── animations/
│       └── SlideInAnimation.vue  // 滑入动画组件
├── composables/
│   ├── useNotificationQueue.ts   // 消息队列管理
│   ├── useAnimation.ts           // 动画控制
│   └── useDraggable.ts           // 拖拽功能
├── types/
│   ├── Message.ts                // 消息类型定义
│   └── Config.ts                 // 配置类型定义
└── utils/
    └── messageParser.ts          // 消息解析工具
```

---

## 4. 核心功能设计

### 4.1 窗口管理

#### 4.1.1 窗口特性

```typescript
/**
 * 通知窗口配置
 */
interface NotificationWindowConfig {
  /** 窗口宽度 */
  width: number;
  /** 窗口高度（根据内容动态调整） */
  height: number;
  /** 是否透明 */
  transparent: boolean;
  /** 是否置顶 */
  alwaysOnTop: boolean;
  /** 是否无边框 */
  frame: boolean;
  /** 是否可拖动 */
  movable: boolean;
  /** 是否可调整大小 */
  resizable: boolean;
  /** 初始位置（可配置） */
  position:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "custom";
  /** 自定义位置 */
  customPosition?: { x: number; y: number };
}
```

#### 4.1.2 窗口行为

- **初始位置**: 默认屏幕右下角，距离边缘 20px
- **拖拽支持**: 可通过鼠标拖动到任意位置
- **记忆位置**: 保存用户最后拖拽的位置（localStorage）
- **毛玻璃效果**: 使用 CSS `backdrop-filter: blur()` + Electron `vibrancy` 效果

### 4.2 消息队列系统

#### 4.2.1 队列管理

```typescript
/**
 * 消息队列管理器
 */
class MessageQueue {
  private queue: Message[] = [];
  private isDisplaying: boolean = false;
  private currentMessage: Message | null = null;

  /**
   * 添加消息到队列
   * @param message - 消息对象
   */
  enqueue(message: Message): void;

  /**
   * 显示下一条消息
   */
  showNext(): void;

  /**
   * 关闭当前消息
   */
  closeCurrent(): void;

  /**
   * 清空队列
   */
  clear(): void;
}
```

#### 4.2.2 显示逻辑

1. 消息入队到 `MessageQueue`
2. 如果当前没有正在显示的消息，立即显示
3. 如果正在显示，等待当前消息关闭后显示下一条
4. 支持自动关闭（超时）和手动关闭

### 4.3 消息数据模型

#### 4.3.1 消息 Schema

```typescript
/**
 * 消息类型枚举
 */
enum MessageContentType {
  TEXT = "text",
  MARKDOWN = "markdown",
  IMAGE = "image",
  TABLE = "table",
  BUTTON = "button",
  PROGRESS = "progress",
  MIXED = "mixed", // 混合内容
}

/**
 * 基础消息接口
 */
interface BaseMessage {
  /** 消息唯一ID */
  id: string;
  /** 消息类型 */
  type: MessageContentType;
  /** 时间戳 */
  timestamp: number;
  /** 优先级 (1-10, 10最高) */
  priority?: number;
  /** 自动关闭延迟（毫秒），null 表示不自动关闭 */
  autoCloseDelay?: number | null;
  /** 是否允许手动关闭 */
  closable?: boolean;
}

/**
 * 文本消息
 */
interface TextMessage extends BaseMessage {
  type: MessageContentType.TEXT;
  content: {
    text: string;
    /** 文字大小 */
    fontSize?: "small" | "medium" | "large";
    /** 文字颜色 */
    color?: string;
  };
}

/**
 * Markdown 消息
 */
interface MarkdownMessage extends BaseMessage {
  type: MessageContentType.MARKDOWN;
  content: {
    markdown: string;
  };
}

/**
 * 图片消息
 */
interface ImageMessage extends BaseMessage {
  type: MessageContentType.IMAGE;
  content: {
    /** 图片 URL 或 Base64 */
    src: string;
    /** 替代文字 */
    alt?: string;
    /** 图片宽度 */
    width?: number;
    /** 图片高度 */
    height?: number;
  };
}

/**
 * 表格消息
 */
interface TableMessage extends BaseMessage {
  type: MessageContentType.TABLE;
  content: {
    headers: string[];
    rows: string[][];
  };
}

/**
 * 按钮消息
 */
interface ButtonMessage extends BaseMessage {
  type: MessageContentType.BUTTON;
  content: {
    text: string;
    buttons: Array<{
      label: string;
      action: "link" | "copy" | "custom";
      payload?: string; // URL for link, text for copy, custom data
    }>;
  };
}

/**
 * 进度条消息
 */
interface ProgressMessage extends BaseMessage {
  type: MessageContentType.PROGRESS;
  content: {
    label: string;
    /** 进度值 0-100 */
    value: number;
    /** 显示百分比 */
    showPercentage?: boolean;
  };
}

/**
 * 混合内容消息
 */
interface MixedMessage extends BaseMessage {
  type: MessageContentType.MIXED;
  content: {
    /** 内容块数组 */
    blocks: Array<
      | TextMessage["content"]
      | ImageMessage["content"]
      | TableMessage["content"]
      | ProgressMessage["content"]
    >;
  };
}

/**
 * 消息联合类型
 */
type Message =
  | TextMessage
  | MarkdownMessage
  | ImageMessage
  | TableMessage
  | ButtonMessage
  | ProgressMessage
  | MixedMessage;
```

#### 4.3.2 Schema 验证

使用 [Zod](https://github.com/colinhacks/zod) 进行运行时 Schema 验证：

```typescript
import { z } from "zod";

/**
 * 文本消息验证 Schema
 */
const textMessageSchema = z.object({
  id: z.string(),
  type: z.literal(MessageContentType.TEXT),
  timestamp: z.number(),
  priority: z
    .number()
    .min(1)
    .max(10)
    .optional(),
  autoCloseDelay: z
    .number()
    .nullable()
    .optional(),
  closable: z.boolean().optional(),
  content: z.object({
    text: z.string(),
    fontSize: z.enum(["small", "medium", "large"]).optional(),
    color: z.string().optional(),
  }),
});

// ... 其他消息类型的 Schema
```

### 4.4 通信层设计

#### 4.4.1 通信适配器接口

```typescript
/**
 * 通信适配器接口
 * 所有通信实现都必须实现此接口
 */
interface ICommunicationAdapter {
  /**
   * 初始化连接
   * @param config - 连接配置
   */
  initialize(config: any): Promise<void>;

  /**
   * 开始监听消息
   * @param callback - 消息接收回调
   */
  listen(callback: (message: Message) => void): void;

  /**
   * 发送消息（可选，用于双向通信）
   * @param message - 要发送的消息
   */
  send?(message: any): Promise<void>;

  /**
   * 断开连接
   */
  disconnect(): Promise<void>;

  /**
   * 获取连接状态
   */
  isConnected(): boolean;
}
```

#### 4.4.2 Socket.IO 适配器实现

```typescript
/**
 * Socket.IO 通信适配器
 */
class SocketIOAdapter implements ICommunicationAdapter {
  private io: Server | null = null;
  private port: number;
  private messageCallback: ((message: Message) => void) | null = null;

  constructor(port: number = 6000) {
    this.port = port;
  }

  /**
   * 初始化 Socket.IO 服务器
   */
  async initialize(config?: { port?: number }): Promise<void> {
    if (config?.port) {
      this.port = config.port;
    }

    const httpServer = require('http').createServer();
    this.io = require('socket.io')(httpServer);

    httpServer.listen(this.port);

    this.io.on('connection', (socket) => {
      socket.on('message', (data) => {
        if (this.messageCallback) {
          // 验证消息格式
          const message = this.parseAndValidate(data);
          if (message) {
            this.messageCallback(message);
          }
        }
      });
    });
  }

  /**
   * 解析并验证消息
   */
  private parseAndValidate(data: any): Message | null {
    try {
      // 使用 Zod 验证
      // 返回验证后的消息对象
      return data as Message;
    } catch (error) {
      console.error('Invalid message format:', error);
      return null;
    }
  }

  listen(callback: (message: Message) => void): void {
    this.messageCallback = callback;
  }

  async send(message: any): Promise<void> {
    if (this.io) {
      this.io.emit('response', message);
    }
  }

  async disconnect(): Promise<void> {
    if (this.io) {
      this.io.close();
      this.io = null;
    }
  }

  isConnected(): boolean {
    return this.io !== null;
  }
}
```

#### 4.4.3 未来扩展支持

- **WebSocket**: 原生 WebSocket 支持
- **HTTP/REST**: 通过 HTTP POST 接收消息
- **IPC**: Electron 进程间通信
- **消息队列**: RabbitMQ、Redis Pub/Sub 等

### 4.5 动画系统

#### 4.5.1 动画类型

```typescript
/**
 * 动画配置
 */
interface AnimationConfig {
  /** 动画类型 */
  type: "slide-in-bottom" | "slide-in-right" | "fade-in" | "scale-in";
  /** 动画持续时间（毫秒） */
  duration: number;
  /** 缓动函数 */
  easing: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "cubic-bezier";
  /** 退出动画类型 */
  exitType: "slide-out-bottom" | "slide-out-right" | "fade-out" | "scale-out";
  /** 退出动画持续时间 */
  exitDuration: number;
}
```

#### 4.5.2 默认动画

- **进入**: 从下方滑入（slide-in-bottom）
- **退出**: 淡出（fade-out）
- **持续时间**: 300ms (进入) / 200ms (退出)
- **缓动**: ease-out

### 4.6 交互功能

#### 4.6.1 拖拽功能

```typescript
/**
 * 拖拽功能 Composable
 */
function useDraggable(elementRef: Ref<HTMLElement | null>) {
  const isDragging = ref(false);
  const startX = ref(0);
  const startY = ref(0);

  /**
   * 开始拖拽
   */
  const onDragStart = (event: MouseEvent) => {
    // 实现拖拽逻辑
  };

  /**
   * 拖拽中
   */
  const onDragMove = (event: MouseEvent) => {
    // 更新窗口位置
  };

  /**
   * 结束拖拽
   */
  const onDragEnd = () => {
    // 保存位置
  };

  return {
    isDragging,
    onDragStart,
    onDragMove,
    onDragEnd,
  };
}
```

#### 4.6.2 用户操作

- **关闭按钮**: 手动关闭通知
- **复制按钮**: 复制消息内容
- **链接按钮**: 打开外部链接
- **自定义按钮**: 触发自定义事件

---

## 5. 视觉设计

### 5.1 毛玻璃效果实现

#### 5.1.1 Electron 配置

```typescript
// 主进程窗口配置
const win = new BrowserWindow({
  transparent: true,
  frame: false,
  vibrancy: "ultra-dark", // macOS
  backgroundMaterial: "acrylic", // Windows 11
});
```

#### 5.1.2 CSS 实现

```css
.notification-container {
  /* 毛玻璃背景 */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* 边框和阴影 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 5.2 配色方案

```typescript
/**
 * 主题配色
 */
const theme = {
  // 背景
  background: {
    light: "rgba(255, 255, 255, 0.1)",
    dark: "rgba(0, 0, 0, 0.3)",
  },
  // 文字
  text: {
    primary: "rgba(255, 255, 255, 0.9)",
    secondary: "rgba(255, 255, 255, 0.6)",
  },
  // 边框
  border: "rgba(255, 255, 255, 0.2)",
  // 强调色
  accent: "#3B82F6",
};
```

### 5.3 动画参数

```typescript
/**
 * 动画配置常量
 */
const ANIMATION_CONFIG = {
  // 滑入动画
  slideIn: {
    duration: 300,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    distance: "100px",
  },
  // 淡出动画
  fadeOut: {
    duration: 200,
    easing: "ease-out",
  },
  // 悬停效果
  hover: {
    scale: 1.02,
    duration: 150,
  },
};
```

---

## 6. 配置系统

### 6.1 用户配置

```typescript
/**
 * 用户配置接口
 */
interface UserConfig {
  /** 窗口配置 */
  window: {
    defaultPosition: NotificationWindowConfig["position"];
    customPosition?: { x: number; y: number };
    width: number;
  };

  /** 消息配置 */
  message: {
    defaultAutoCloseDelay: number;
    maxQueueSize: number;
  };

  /** 动画配置 */
  animation: AnimationConfig;

  /** 通信配置 */
  communication: {
    adapter: "socketio" | "websocket" | "http";
    socketio?: {
      port: number;
    };
    websocket?: {
      url: string;
    };
    http?: {
      port: number;
      endpoint: string;
    };
  };
}
```

### 6.2 配置存储

- 使用 `electron-store` 持久化配置
- 位置: `~/.outputcool/config.json`

---

## 7. 代码规范

### 7.1 文档注释规范

所有公共 API 必须使用 JSDoc/TSDoc 注释：

````typescript
/**
 * 窗口管理器类
 * 负责创建、管理和销毁通知窗口
 *
 * @example
 * ```typescript
 * const manager = new WindowManager(config);
 * await manager.createWindow();
 * ```
 */
class WindowManager {
  /**
   * 创建新的通知窗口
   *
   * @param config - 窗口配置对象
   * @returns Promise<BrowserWindow> 创建的窗口实例
   * @throws {Error} 如果窗口创建失败
   */
  async createWindow(config: NotificationWindowConfig): Promise<BrowserWindow> {
    // 实现...
  }
}
````

### 7.2 命名规范

- **文件名**: PascalCase (组件/类) 或 camelCase (工具函数)
- **类名**: PascalCase
- **接口名**: PascalCase，以 `I` 开头（接口）
- **类型别名**: PascalCase
- **函数名**: camelCase
- **变量名**: camelCase
- **常量**: UPPER_SNAKE_CASE
- **枚举**: PascalCase，成员 UPPER_SNAKE_CASE

### 7.3 TypeScript 规范

- 所有函数必须有明确的类型声明
- 避免使用 `any`，使用 `unknown` 代替
- 使用严格模式 (`strict: true`)
- 使用接口而非类型别名定义对象形状

### 7.4 Vue 3 规范

- 使用 `<script setup lang="ts">`
- 使用 Composition API
- Props 必须定义类型
- 使用 `defineProps` 和 `defineEmits`

---

## 8. 项目结构

```
OutputCool/
├── docs/                           # 文档
│   ├── DESIGN.md                  # 本设计文档
│   ├── API.md                     # API 文档
│   └── DEVELOPMENT.md             # 开发指南
├── src/
│   ├── main/                      # 主进程
│   │   ├── index.ts
│   │   ├── window/
│   │   ├── communication/
│   │   └── utils/
│   ├── renderer/                  # 渲染进程
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── components/
│   │   ├── composables/
│   │   ├── types/
│   │   ├── utils/
│   │   └── assets/
│   └── shared/                    # 共享代码
│       ├── types/
│       └── constants/
├── tests/                         # 测试文件
│   ├── unit/
│   └── e2e/
├── scripts/                       # 构建脚本
├── public/                        # 静态资源
├── package.json
├── tsconfig.json
├── vite.config.ts
├── electron.vite.config.ts        # Electron Vite 配置
└── README.md
```

---

## 9. 开发路线图

### Phase 1: 基础架构 (Week 1-2)

- [ ] 项目初始化和技术栈迁移
- [ ] TypeScript 配置
- [ ] 基础窗口管理
- [ ] 基础通信层（Socket.IO 适配器）
- [ ] 消息类型定义

### Phase 2: 核心功能 (Week 3-4)

- [ ] 消息队列系统
- [ ] 基础通知组件
- [ ] 文本内容渲染
- [ ] 毛玻璃效果实现
- [ ] 基础动画系统

### Phase 3: 内容扩展 (Week 5-6)

- [ ] Markdown 渲染
- [ ] 图片显示
- [ ] 表格组件
- [ ] 按钮组件
- [ ] 进度条组件
- [ ] 混合内容支持

### Phase 4: 交互优化 (Week 7-8)

- [ ] 拖拽功能
- [ ] 用户配置系统
- [ ] 位置记忆
- [ ] 自动关闭逻辑
- [ ] 手动关闭
- [ ] 交互按钮（复制、链接等）

### Phase 5: 测试和文档 (Week 9-10)

- [ ] 单元测试
- [ ] E2E 测试
- [ ] API 文档生成
- [ ] 使用示例
- [ ] README 完善

### Phase 6: 打包和发布 (Week 11-12)

- [ ] 跨平台测试
- [ ] 应用打包
- [ ] 安装程序制作
- [ ] 自动更新功能
- [ ] 发布准备

---

## 10. 性能优化策略

### 10.1 渲染优化

- 虚拟滚动（如果队列很长）
- 组件懒加载
- 图片懒加载
- 防抖和节流

### 10.2 内存管理

- 消息队列大小限制（默认 100 条）
- 及时清理已关闭的窗口
- 图片缓存策略

### 10.3 动画性能

- 使用 CSS Transform 和 Opacity（GPU 加速）
- 避免布局抖动
- requestAnimationFrame 优化

---

## 11. 安全考虑

### 11.1 Content Security Policy

```typescript
const csp = {
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  scriptSrc: ["'self'"],
};
```

### 11.2 消息验证

- 所有外部消息必须经过 Schema 验证
- 防止 XSS 攻击（Markdown 渲染时）
- URL 白名单机制

### 11.3 通信安全

- 支持 HTTPS/WSS
- 可选的身份验证机制（Token）
- 限流保护

---

## 12. 测试策略

### 12.1 单元测试

- 所有 Composables 必须测试
- 工具函数测试覆盖率 > 90%
- 适配器接口测试

### 12.2 组件测试

- 使用 Vue Test Utils
- 快照测试
- 交互测试

### 12.3 E2E 测试

- 使用 Playwright
- 完整消息流程测试
- 跨平台测试

---

## 13. 未来扩展

### 13.1 短期扩展

- 主题系统（亮色/暗色）
- 声音提醒
- 桌面通知集成

### 13.2 中期扩展

- 消息历史记录
- 搜索和过滤
- 多窗口支持
- 自定义插件系统

### 13.3 长期扩展

- 云同步
- 移动端支持
- WebView 嵌入模式
- 性能监控和分析

---

## 14. 参考资料

- [Electron Documentation](https://www.electronjs.org/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Vite Documentation](https://vitejs.dev/)

---

## 15. 附录

### 15.1 消息示例

#### 简单文本消息

```json
{
  "id": "msg-001",
  "type": "text",
  "timestamp": 1704038400000,
  "priority": 5,
  "autoCloseDelay": 5000,
  "closable": true,
  "content": {
    "text": "Hello, OutputCool!",
    "fontSize": "medium",
    "color": "#ffffff"
  }
}
```

#### 混合内容消息

```json
{
  "id": "msg-002",
  "type": "mixed",
  "timestamp": 1704038400000,
  "priority": 8,
  "autoCloseDelay": null,
  "closable": true,
  "content": {
    "blocks": [
      {
        "text": "Build completed successfully!"
      },
      {
        "src": "https://example.com/success.png",
        "width": 200
      },
      {
        "headers": ["File", "Size", "Status"],
        "rows": [["app.js", "256KB", "✓"], ["style.css", "48KB", "✓"]]
      }
    ]
  }
}
```

### 15.2 Socket.IO 客户端示例

```javascript
// Node.js 客户端示例
const io = require('socket.io-client');
const socket = io.connect('http://localhost:6000');

// 发送文本消息
socket.emit('message', {
  id: Date.now().toString(),
  type: 'text',
  timestamp: Date.now(),
  autoCloseDelay: 5000,
  content: {
    text: 'Hello from Node.js!'
  }
});

// Python 客户端示例
import socketio

sio = socketio.Client()
sio.connect('http://localhost:6000')

sio.emit('message', {
    'id': '123',
    'type': 'text',
    'timestamp': 1704038400000,
    'content': {
        'text': 'Hello from Python!'
    }
})
```

---

**文档版本历史**

- v2.0 (2025-12-31): 初始版本，完整设计文档
