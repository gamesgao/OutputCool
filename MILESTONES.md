# OutputCool 开发里程碑

**版本**: 2.0  
**日期**: 2026-01-01  
**作者**: Yu Gao

---

## 📋 总览

本文档定义了 OutputCool 2.0 的开发里程碑，采用**循序渐进、可验证**的开发方式。每个 Milestone 都是独立可运行、可测试的完整功能模块。

**核心原则**:

- ✅ 每个阶段都可以独立运行和测试
- ✅ 完成一个阶段后才进入下一个阶段
- ✅ 每个阶段都有明确的验收标准
- ✅ 测试优先，确保代码质量

---

## 🎯 Milestone 1: 最小可用原型 (MVP)

**时间**: Week 1-2  
**目标**: 搭建基础框架，实现一个能够显示简单文本通知的桌面应用

### 开发任务

- [ ] 项目初始化（Vite + Vue 3 + TypeScript + Electron）
- [ ] 配置 TypeScript 严格模式和 ESLint
- [ ] 创建基础 Electron 窗口（透明、无边框、置顶）
- [ ] 实现简单的文本消息类型定义（`TextMessage`）
- [ ] 创建基础 Vue 组件显示文本消息
- [ ] 实现硬编码的测试消息（不依赖外部通信）

### 验证标准

- ✅ 应用可以成功启动
- ✅ 窗口显示在屏幕右下角
- ✅ 可以显示一条硬编码的文本消息
- ✅ 窗口是透明的、无边框的、置顶的

### 测试要求

```typescript
// tests/milestone1/basic-window.spec.ts
describe("Milestone 1: Basic Window", () => {
  test("应用可以启动", async () => {
    const app = await launchApp();
    expect(app.isRunning()).toBe(true);
  });

  test("窗口配置正确", async () => {
    const window = await getMainWindow();
    expect(window.isAlwaysOnTop()).toBe(true);
    expect(window.isFrameless()).toBe(true);
    expect(window.isTransparent()).toBe(true);
  });

  test("可以显示文本消息", async () => {
    const content = await getWindowContent();
    expect(content).toContain("Test Message");
  });
});
```

### 交付物

- ✅ 可运行的 Electron 应用（`npm run dev`）
- ✅ 基础项目结构和配置文件
- ✅ Milestone 1 测试套件（通过率 100%）

---

## 🎯 Milestone 2: Socket.IO 通信集成

**时间**: Week 3  
**目标**: 实现 Socket.IO 通信层，能够接收外部发送的文本消息

### 开发任务

- [ ] 实现 `ICommunicationAdapter` 接口定义
- [ ] 实现 `SocketIOAdapter` 类
- [ ] 在主进程中启动 Socket.IO 服务器（端口 6000）
- [ ] 实现消息接收和验证逻辑
- [ ] 使用 Zod 验证 `TextMessage` Schema
- [ ] 通过 IPC 将消息传递给渲染进程
- [ ] 更新 Vue 组件显示接收到的消息

### 验证标准

- ✅ Socket.IO 服务器成功启动在端口 6000
- ✅ 可以通过外部客户端发送消息
- ✅ 消息格式验证正常工作（错误消息会被拒绝）
- ✅ 渲染进程能够显示接收到的消息

### 测试要求

```typescript
// tests/milestone2/socketio-adapter.spec.ts
describe("Milestone 2: Socket.IO Communication", () => {
  test("Socket.IO 服务器启动", async () => {
    const adapter = new SocketIOAdapter(6000);
    await adapter.initialize();
    expect(adapter.isConnected()).toBe(true);
  });

  test("接收有效的文本消息", async () => {
    const client = createTestClient("http://localhost:6000");
    const receivedMessages: Message[] = [];

    adapter.listen((msg) => receivedMessages.push(msg));

    client.emit("message", {
      id: "123",
      type: "text",
      timestamp: Date.now(),
      content: { text: "Hello!" },
    });

    await waitFor(() => receivedMessages.length > 0);
    expect(receivedMessages[0].content.text).toBe("Hello!");
  });

  test("拒绝无效消息", async () => {
    const client = createTestClient("http://localhost:6000");
    const errors: any[] = [];

    adapter.onError((err) => errors.push(err));

    client.emit("message", { invalid: "data" });

    await waitFor(() => errors.length > 0);
    expect(errors[0].type).toBe("VALIDATION_ERROR");
  });
});
```

### 测试脚本

```javascript
// scripts/test-milestone2.js
// 用于手动测试的 Node.js 脚本
const io = require("socket.io-client");
const socket = io.connect("http://localhost:6000");

socket.emit("message", {
  id: Date.now().toString(),
  type: "text",
  timestamp: Date.now(),
  content: {
    text: "Hello from test script!",
    fontSize: "medium",
  },
});
```

```python
# scripts/test-milestone2.py
# Python 测试脚本
import socketio
import time

sio = socketio.Client()
sio.connect('http://localhost:6000')

sio.emit('message', {
    'id': str(int(time.time() * 1000)),
    'type': 'text',
    'timestamp': int(time.time() * 1000),
    'content': {
        'text': 'Hello from Python!',
        'fontSize': 'medium'
    }
})

sio.disconnect()
```

### 交付物

- ✅ 完整的 Socket.IO 通信层实现
- ✅ 消息验证逻辑
- ✅ Milestone 2 测试套件（通过率 100%）
- ✅ 测试脚本（Node.js 和 Python）

---

## 🎯 Milestone 3: 消息队列和基础动画

**时间**: Week 4  
**目标**: 实现消息队列管理，支持多条消息的有序显示和基础滑入动画

### 开发任务

- [ ] 实现 `MessageQueue` 类（队列管理逻辑）
- [ ] 实现 `useNotificationQueue` Composable
- [ ] 添加消息入队、出队逻辑
- [ ] 实现自动关闭功能（`autoCloseDelay`）
- [ ] 实现手动关闭功能（关闭按钮）
- [ ] 添加 CSS 滑入动画（从下方滑入）
- [ ] 添加淡出动画
- [ ] 实现消息队列的可视化状态（开发者工具）

### 验证标准

- ✅ 多条消息到达时会排队显示（不重叠）
- ✅ 当前消息关闭后，自动显示下一条
- ✅ 支持自动关闭（延迟 5 秒）
- ✅ 支持手动关闭（点击关闭按钮）
- ✅ 动画流畅自然（60fps）

### 测试要求

```typescript
// tests/milestone3/message-queue.spec.ts
describe("Milestone 3: Message Queue & Animation", () => {
  test("消息按顺序显示", async () => {
    const queue = new MessageQueue();

    queue.enqueue(createMessage("Message 1"));
    queue.enqueue(createMessage("Message 2"));
    queue.enqueue(createMessage("Message 3"));

    expect(await getCurrentMessage()).toBe("Message 1");

    queue.closeCurrent();
    await waitFor(() => getCurrentMessage() === "Message 2");
    expect(await getCurrentMessage()).toBe("Message 2");
  });

  test("自动关闭功能", async () => {
    const queue = new MessageQueue();
    const message = createMessage("Auto close", { autoCloseDelay: 1000 });

    queue.enqueue(message);
    expect(await getCurrentMessage()).toBe("Auto close");

    await sleep(1100);
    expect(await getCurrentMessage()).toBeNull();
  });

  test("动画性能", async () => {
    const metrics = await measureAnimationPerformance();
    expect(metrics.fps).toBeGreaterThan(55); // 至少 55 fps
    expect(metrics.jank).toBeLessThan(5); // 掉帧次数 < 5
  });
});
```

### 性能基准

- **动画帧率**: ≥ 55 FPS
- **内存占用**: < 100MB（10 条消息）
- **CPU 占用**: < 5%（空闲时）

### 交付物

- ✅ 消息队列管理系统
- ✅ 流畅的进入/退出动画
- ✅ Milestone 3 测试套件（通过率 100%）
- ✅ 性能测试报告

---

## 🎯 Milestone 4: 毛玻璃效果和拖拽

**时间**: Week 5  
**目标**: 实现炫酷的毛玻璃效果和窗口拖拽功能

### 开发任务

- [ ] 实现毛玻璃背景效果（CSS `backdrop-filter`）
- [ ] 配置 Electron 原生毛玻璃（macOS `vibrancy`、Windows `backgroundMaterial`）
- [ ] 实现 `useDraggable` Composable
- [ ] 添加拖拽区域（窗口顶部）
- [ ] 实现窗口位置保存（localStorage）
- [ ] 实现窗口位置恢复（下次启动时）
- [ ] 优化拖拽性能（防抖）
- [ ] 添加拖拽边界限制（不超出屏幕）

### 验证标准

- ✅ 窗口具有毛玻璃背景效果
- ✅ 可以通过鼠标拖拽窗口到任意位置
- ✅ 拖拽流畅无卡顿
- ✅ 窗口位置会被保存和恢复
- ✅ 窗口不会被拖出屏幕外

### 测试要求

```typescript
// tests/milestone4/glassmorphism-drag.spec.ts
describe("Milestone 4: Glassmorphism & Drag", () => {
  test("毛玻璃效果应用", async () => {
    const styles = await getComputedStyles(".notification-container");
    expect(styles["backdrop-filter"]).toContain("blur");
    expect(styles["background"]).toContain("rgba");
  });

  test("拖拽功能", async () => {
    const initialPos = await getWindowPosition();

    await dragWindow({ from: { x: 0, y: 0 }, to: { x: 100, y: 100 } });

    const newPos = await getWindowPosition();
    expect(newPos.x).toBe(initialPos.x + 100);
    expect(newPos.y).toBe(initialPos.y + 100);
  });

  test("位置持久化", async () => {
    await dragWindow({ from: { x: 0, y: 0 }, to: { x: 200, y: 200 } });
    const posBeforeClose = await getWindowPosition();

    await restartApp();

    const posAfterRestart = await getWindowPosition();
    expect(posAfterRestart).toEqual(posBeforeClose);
  });
});
```

### 交付物

- ✅ 完整的毛玻璃效果实现
- ✅ 拖拽功能实现
- ✅ 位置持久化
- ✅ Milestone 4 测试套件（通过率 100%）
- ✅ 视觉效果截图/录屏

---

## 🎯 Milestone 5: 多内容类型支持

**时间**: Week 6-7  
**目标**: 扩展支持 Markdown、图片、表格等多种内容类型

### 开发任务

- [ ] 实现 `MarkdownContent.vue` 组件（使用 `marked` + `highlight.js`）
- [ ] 实现 `ImageContent.vue` 组件（支持 URL 和 Base64）
- [ ] 实现 `TableContent.vue` 组件
- [ ] 实现 `ButtonContent.vue` 组件（链接、复制、自定义）
- [ ] 实现 `ProgressContent.vue` 组件
- [ ] 实现 `MixedContent.vue` 组件（混合内容）
- [ ] 为每种类型添加 Zod Schema 验证
- [ ] 实现内容类型路由逻辑
- [ ] 添加 XSS 防护（Markdown 渲染时）

### 验证标准

- ✅ 可以显示 Markdown 格式的消息（带代码高亮）
- ✅ 可以显示图片（URL 和 Base64）
- ✅ 可以显示表格数据
- ✅ 按钮可以触发操作（打开链接、复制文本）
- ✅ 进度条可以显示动态进度
- ✅ 混合内容可以组合多种类型

### 测试要求

````typescript
// tests/milestone5/content-types.spec.ts
describe("Milestone 5: Multiple Content Types", () => {
  test("Markdown 渲染", async () => {
    await sendMessage({
      type: "markdown",
      content: { markdown: '# Hello\n```js\nconsole.log("test");\n```' },
    });

    const html = await getMessageHTML();
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain('<code class="language-js">');
  });

  test("图片显示", async () => {
    await sendMessage({
      type: "image",
      content: {
        src: "https://example.com/test.png",
        width: 300,
        height: 200,
      },
    });

    const img = await getElement("img");
    expect(img.src).toBe("https://example.com/test.png");
    expect(img.width).toBe(300);
  });

  test("表格渲染", async () => {
    await sendMessage({
      type: "table",
      content: {
        headers: ["Name", "Age"],
        rows: [["Alice", "25"], ["Bob", "30"]],
      },
    });

    const table = await getElement("table");
    expect(table.rows.length).toBe(3); // header + 2 rows
  });

  test("XSS 防护", async () => {
    await sendMessage({
      type: "markdown",
      content: { markdown: '<script>alert("xss")</script>' },
    });

    const html = await getMessageHTML();
    expect(html).not.toContain("<script>");
  });
});
````

### 交付物

- ✅ 所有内容类型组件实现
- ✅ Schema 验证逻辑
- ✅ XSS 防护机制
- ✅ Milestone 5 测试套件（通过率 100%）
- ✅ 内容类型示例集合

---

## 🎯 Milestone 6: 配置系统和优化

**时间**: Week 8  
**目标**: 实现用户配置系统，优化性能和用户体验

### 开发任务

- [ ] 实现配置系统（使用 `electron-store`）
- [ ] 添加配置界面（右键菜单或设置窗口）
- [ ] 实现窗口位置配置（默认位置）
- [ ] 实现消息默认超时配置
- [ ] 实现动画配置（开关、速度）
- [ ] 实现通信端口配置
- [ ] 添加性能监控（内存、CPU、FPS）
- [ ] 优化大量消息场景（虚拟滚动）
- [ ] 优化图片加载（懒加载、缓存）

### 验证标准

- ✅ 用户可以修改配置并持久化
- ✅ 配置修改后立即生效
- ✅ 性能满足基准要求（见下方）
- ✅ 大量消息时应用依然流畅

### 测试要求

```typescript
// tests/milestone6/config-performance.spec.ts
describe("Milestone 6: Config & Performance", () => {
  test("配置持久化", async () => {
    await setConfig({ window: { defaultPosition: "top-left" } });
    await restartApp();

    const config = await getConfig();
    expect(config.window.defaultPosition).toBe("top-left");
  });

  test("大量消息性能", async () => {
    for (let i = 0; i < 100; i++) {
      await sendMessage({ type: "text", content: { text: `Message ${i}` } });
    }

    const metrics = await getPerformanceMetrics();
    expect(metrics.memoryMB).toBeLessThan(150);
    expect(metrics.cpuPercent).toBeLessThan(10);
  });

  test("图片缓存", async () => {
    const imageUrl = "https://example.com/large.png";

    await sendMessage({ type: "image", content: { src: imageUrl } });
    const firstLoadTime = await measureLoadTime();

    await sendMessage({ type: "image", content: { src: imageUrl } });
    const secondLoadTime = await measureLoadTime();

    expect(secondLoadTime).toBeLessThan(firstLoadTime * 0.2);
  });
});
```

### 性能基准

- **内存占用**: < 150MB（100 条消息）
- **CPU 占用**: < 10%（活跃显示时）
- **启动时间**: < 2 秒
- **消息显示延迟**: < 100ms

### 交付物

- ✅ 完整的配置系统
- ✅ 性能优化实现
- ✅ Milestone 6 测试套件（通过率 100%）
- ✅ 性能基准测试报告

---

## 🎯 Milestone 7: 完整测试和文档

**时间**: Week 9-10  
**目标**: 补充完整的测试覆盖率，编写完整的文档

### 开发任务

- [ ] 单元测试覆盖率达到 80%+
- [ ] E2E 测试覆盖所有核心流程
- [ ] 使用 TypeDoc 生成 API 文档
- [ ] 编写用户手册（README.md）
- [ ] 编写开发者指南（DEVELOPMENT.md）
- [ ] 编写 API 参考文档（API.md）
- [ ] 创建示例代码集合（examples/）
- [ ] 录制演示视频
- [ ] 创建 CHANGELOG.md

### 验证标准

- ✅ 单元测试覆盖率 ≥ 80%
- ✅ E2E 测试通过率 100%
- ✅ 所有公共 API 有完整文档
- ✅ README 包含快速开始指南
- ✅ 至少 5 个完整的使用示例

### 测试要求

```typescript
// tests/milestone7/integration.spec.ts
describe("Milestone 7: Integration Tests", () => {
  test("完整消息流程", async () => {
    // 1. 启动应用
    const app = await launchApp();

    // 2. 发送消息
    await sendMessage({ type: "text", content: { text: "Test" } });

    // 3. 验证显示
    expect(await isMessageVisible("Test")).toBe(true);

    // 4. 等待自动关闭
    await sleep(5000);
    expect(await isMessageVisible("Test")).toBe(false);

    // 5. 发送多条消息
    await sendMessages([
      { type: "text", content: { text: "Msg 1" } },
      { type: "markdown", content: { markdown: "# Msg 2" } },
      { type: "image", content: { src: "test.png" } },
    ]);

    // 6. 验证队列
    expect(await getQueueLength()).toBe(3);
  });
});
```

### 文档清单

- [x] README.md - 项目介绍、快速开始
- [x] DESIGN.md - 技术设计文档
- [x] MILESTONES.md - 本开发里程碑文档
- [ ] DEVELOPMENT.md - 开发环境搭建、贡献指南
- [ ] API.md - 完整 API 参考
- [ ] CHANGELOG.md - 版本更新日志
- [ ] examples/ - 示例代码目录
  - [ ] basic-text.js - 基础文本消息
  - [ ] markdown-code.js - Markdown 代码高亮
  - [ ] image-notification.js - 图片通知
  - [ ] progress-bar.js - 进度条更新
  - [ ] mixed-content.js - 混合内容

### 交付物

- ✅ 完整的测试套件
- ✅ 完整的文档体系
- ✅ 示例代码集合
- ✅ 演示视频

---

## 🎯 Milestone 8: 跨平台打包和发布

**时间**: Week 11-12  
**目标**: 完成跨平台打包，准备发布

### 开发任务

- [ ] 配置 `electron-builder`
- [ ] Windows 平台打包测试
- [ ] macOS 平台打包测试
- [ ] Linux 平台打包测试
- [ ] 应用图标设计和集成
- [ ] 自动更新功能（可选）
- [ ] 代码签名（macOS/Windows）
- [ ] 安装程序制作
- [ ] GitHub Releases 配置
- [ ] CI/CD 流程搭建

### 验证标准

- ✅ Windows、macOS、Linux 安装包可以正常安装
- ✅ 安装后的应用功能完整
- ✅ 应用图标正确显示
- ✅ 自动更新功能正常（如果实现）
- ✅ 安装包大小合理（< 100MB）

### 测试要求

```typescript
// tests/milestone8/packaging.spec.ts
describe("Milestone 8: Packaging", () => {
  test("Windows 安装包", async () => {
    const installer = await buildWindows();
    expect(installer.size).toBeLessThan(100 * 1024 * 1024); // < 100MB
    expect(installer.signed).toBe(true);
  });

  test("macOS 安装包", async () => {
    const dmg = await buildMacOS();
    expect(dmg.notarized).toBe(true);
    expect(dmg.size).toBeLessThan(100 * 1024 * 1024);
  });

  test("Linux 安装包", async () => {
    const appImage = await buildLinux();
    expect(appImage.executable).toBe(true);
  });
});
```

### 交付物

- ✅ Windows 安装包（.exe）
- ✅ macOS 安装包（.dmg）
- ✅ Linux 安装包（.AppImage / .deb）
- ✅ GitHub Release 页面
- ✅ 发布说明

---

## 📊 里程碑验收标准

每个 Milestone 必须满足以下条件才能进入下一阶段：

| 验收项          | 标准                    |
| --------------- | ----------------------- |
| **功能完整性**  | 该阶段所有功能项完成 ✅ |
| **测试通过率**  | 100% 测试通过           |
| **代码覆盖率**  | 单元测试覆盖率 ≥ 70%    |
| **性能基准**    | 满足该阶段性能要求      |
| **文档完整性**  | 代码注释 + 测试文档完整 |
| **Code Review** | 代码审查通过            |

---

## 🔄 迭代和反馈

- **每个 Milestone 结束后**: 进行回顾会议，总结经验
- **持续集成**: 每次提交都运行自动化测试
- **性能监控**: 每个阶段都进行性能基准测试
- **用户反馈**: 邀请早期用户测试并收集反馈

---

## 📈 进度追踪

### Milestone 完成状态

| Milestone       | 状态      | 开始日期 | 完成日期 | 备注 |
| --------------- | --------- | -------- | -------- | ---- |
| M1: MVP         | ⬜ 未开始 | -        | -        | -    |
| M2: Socket.IO   | ⬜ 未开始 | -        | -        | -    |
| M3: 队列&动画   | ⬜ 未开始 | -        | -        | -    |
| M4: 毛玻璃&拖拽 | ⬜ 未开始 | -        | -        | -    |
| M5: 多内容类型  | ⬜ 未开始 | -        | -        | -    |
| M6: 配置&优化   | ⬜ 未开始 | -        | -        | -    |
| M7: 测试&文档   | ⬜ 未开始 | -        | -        | -    |
| M8: 打包&发布   | ⬜ 未开始 | -        | -        | -    |

**图例**:

- ⬜ 未开始
- 🔄 进行中
- ✅ 已完成
- ⚠️ 有问题

---

**文档版本历史**

- v1.0 (2026-01-01): 初始版本，定义 8 个开发里程碑
