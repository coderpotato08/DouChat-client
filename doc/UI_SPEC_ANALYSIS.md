# DouChat-client UI 规范诊断报告 & 重构路线图

> 分析日期：2026-06-25
> 分析范围：`src/` 全部文件

---

## 一、技术现状

| 层 | 技术 | 版本 | 利用率 |
|---|---|---|---|
| 组件库 | Ant Design | v5.29.3 | 组件使用充分 |
| CSS 方案 | styled-components | v6.1.8 | 34 个文件使用 |
| 主题配置 | ConfigProvider | - | ❌ 极低（仅 `colorPrimary`） |
| Token 体系 | antd GlobalToken | 200+ token 可用 | ❌ 仅用了 5 个 |
| 暗色模式 | - | - | ❌ 未实现 |
| CSS 自定义属性 | - | - | ❌ 未使用 |
| Tailwind CSS | - | - | ❌ 未使用 |

---

## 二、量化诊断

### 2.1 颜色：40 种硬编码 vs 5 个 Token

**高频硬编码颜色及替换映射：**

| 硬编码值 | 出现次数 | 语义 | 应替换为 antd token |
|---|---|---|---|
| `#fff` / `#FFFFFF` | 53 | 面板/弹窗/搜索区/消息气泡背景 | `token.colorBgContainer` |
| `#666` | 25 | 次要文字、图标色 | `token.colorTextSecondary` |
| `#333` | 15 | 主文字色、标题 | `token.colorText` |
| `#f3f3f3` | 9 | 侧边栏/输入区背景 | `token.colorBgLayout` |
| `#ececec` | 7 | 边框、头像边框、分割线 | `token.colorBorderSecondary` |
| `#1677ff` | 5 | **主色硬编码**（message-box 等） | `token.colorPrimary` |
| `#f2f2f2` | 4 | hover 背景 | `token.colorFillSecondary` |
| `#999` | 4 | 弱化文字/图标 | `token.colorTextTertiary` |
| `#bfc8d2` | 3 | 文件图标色 | 业务特定（保留） |
| `#d9d9d9` | 2 | 输入框边框 | `token.colorBorder` |
| `#aaa` | 2 | 文件图标色 | 业务特定（保留） |

**严重 BUG**：`message-box.tsx` 第 32、126 行直接硬编码了 `#1677ff` 作为自己发送消息的气泡颜色，修改 `App.tsx` 的 `colorPrimary` 不会影响聊天 UI。

**其他散落颜色**（1-2 次使用）：

```
#4586f9 (Word 图标), #e94748 (PDF 图标), #ee632e (PPT 图标),
#09a960 (Excel 图标), #fb506f (女性图标), #1296db, #1890ff (旧版 antd 主色),
#52c41a, #fadb14, #f5222d, #ded300, #dd9700, #bc8300, #545454,
#fcfcfc, #f0f0f0, #222, #ff0000, #444
```

---

### 2.2 字号：50 处硬编码，零 Token

| 硬编码值 | 出现次数 | 典型使用场景 | 应替换为 |
|---|---|---|---|
| `12px` | ~14 | 搜索、时间戳、视频工具栏、群信息 | `token.fontSizeSM` |
| `14px` | ~10 | 群列表、搜索项、输入工具 | `token.fontSize` |
| `16px` | ~5 | 聊天输入、消息框标题 | `token.fontSizeLG` |
| `18px` | ~4 | 登录按钮、关系页标题 | `token.fontSizeXL` |
| `20px` | ~2 | 表情选择器、聊天标题 | `token.fontSizeHeading4` |
| `24px` | ~2 | 好友信息、群信息标题 | `token.fontSizeHeading3` |
| `28px` | ~2 | 菜单图标、视频计时器 | - |
| `36px` | ~2 | 注册头像图标、消息框图片图标 | - |
| `40px` | ~2 | 视频计时器 | - |
| `60px` | 1 | 登录页标题 | `token.fontSizeHeading1` |

**问题**：无字号层级体系，10 种字号随意选取。

---

### 2.3 间距：45 处硬编码，零 Token

| 硬编码值 | 出现次数 | 应替换为 |
|---|---|---|
| `4px` | ~4 | `token.marginXXS` / `token.paddingXXS` |
| `8px` | ~5 | `token.marginXS` / `token.paddingXS` |
| `10px` | ~3 | - |
| `12px` | ~15 | `token.marginSM` / `token.paddingSM` |
| `18px` | ~3 | - |
| `20px` | ~3 | `token.marginMD` |
| `24px` | ~3 | `token.marginLG` |
| `40px` / `48px` / `64px` | ~4 | `token.marginXL` / `token.marginXXL` |

**问题**：无间距尺度体系，antd 内置的 `marginXS(8) → SM(12) → (16) → LG(24) → XL(32)` 完全闲置。

---

### 2.4 圆角：30 处硬编码

| 硬编码值 | 出现次数 | 应替换为 |
|---|---|---|
| `4px` | ~16 | `token.borderRadiusSM` |
| `8px` | ~10 | `token.borderRadiusLG` |
| `6px` | 1 | `token.borderRadius` |
| `2px` | 1 | `token.borderRadiusXS` |
| `50%` | 2 | 圆形（保留） |

---

### 2.5 阴影：7 种不同定义，无一致性

| 文件 | 值 |
|---|---|
| `custom-styles.tsx` | `3px 3px 5px -2px rgba(0,0,0,.2)` |
| `draggable-layout.tsx` | `0px 0 15px 5px rgba(0,0,0,.2)` |
| `info-box.tsx` | `0 0 3px 3px rgba(0,0,0,.2)` |
| `chat-container.tsx` | `0 10px 10px -10px rgba(0, 0, 0, .2)` |
| `chat-search.tsx` | `0 0 3px 3px rgba(0,0,0,.05)` |
| `input-tools.tsx` | `0 0 5px 5px rgba(0,0,0,.06)` |
| `chat-input.tsx` | `0 0 5px 5px rgba(0,0,0,0.02)` |

---

### 2.6 重复样式模式

以下模式在 10+ 组件中重复出现，可抽取为共享 mixins：

| 模式 | 出现次数 | 建议 |
|---|---|---|
| `display: flex; align-items: center; justify-content: center` | 15+ | `flexCenter` mixin |
| `white-space: nowrap; text-overflow: ellipsis; overflow: hidden` | 10+ | `textEllipsis` mixin |
| `transition: all .4s` / `all 0.3s` | 10+ | `$transition` token |
| `border: 2px solid #ececec` / `#d9d9d9` | 6+ | `$border` token |
| `height: 100vh` | 5+ | 布局常量 |
| `cursor: pointer` | 20+ | 全局默认 |

---

### 2.7 样式组织现状

- **模式**：所有 styled-components 定义在组件文件底部
- **共享样式**：仅 `src/components/custom-styles.tsx`（1 个组件 `ShadowFloatBox`，**未被任何文件引用**）
- **无 `styles/` 目录**、无共享 mixins、无 token 抽象层
- **目录命名**：`_compt` 不符合规范，应为 `_components`

---

## 三、当前 Token 使用评估

### 已使用的 antd Token（仅 5 个）

| Token | 使用位置 | 次数 |
|---|---|---|
| `token.colorPrimary` | info-box, chat/index, chat-group, chat-search, add-friend-modal, highlight-text, chat-input, group-info | 14 |
| `token.colorPrimaryBg` | add-friend-modal, chat-group | 3 |
| `token.colorPrimaryBgHover` | chat/index (activeMark glow) | 1 |
| `token.colorInfoBg` | chat-search-item, chat-input (remind user) | 3 |
| `token.colorPrimaryText` | chat-search-detail-modal | 2 |

### 未使用但可用的关键 Token

| Token | 可替换的硬编码 |
|---|---|
| `colorText` | `#333` (15次) |
| `colorTextSecondary` | `#666` (25次) |
| `colorTextTertiary` | `#999` (4次) |
| `colorBgLayout` | `#f3f3f3` (9次) |
| `colorBgContainer` | `#fff` (53次) |
| `colorBorder` | `#d9d9d9` (2次) |
| `colorBorderSecondary` | `#ececec` (7次) |
| `fontSizeSM` / `fontSize` / `fontSizeLG` | 所有字号 |
| `marginXS` / `marginSM` / `marginLG` | 所有间距 |
| `borderRadiusSM` / `borderRadiusLG` | 所有圆角 |
| `boxShadow` / `boxShadowSecondary` | 所有阴影 |

---

## 四、重构优先级路线

### 🥇 P0 — 建立 Design Token 层（预计第 1-2 周）

**目标**：消灭 80% 硬编码值，建立统一的设计语言。

#### Step 1: 创建 `src/styles/tokens.ts`

```typescript
import type { GlobalToken } from 'antd';

/**
 * 语义化 Design Token 映射
 * 将 antd GlobalToken 封装为语义化别名，方便统一管理和替换
 */
export const semanticTokens = (t: GlobalToken) => ({
  // ── 文字 ──
  textPrimary:     t.colorText,
  textSecondary:   t.colorTextSecondary,
  textTertiary:    t.colorTextTertiary,
  textQuaternary:  t.colorTextQuaternary,

  // ── 背景 ──
  bgLayout:        t.colorBgLayout,
  bgContainer:     t.colorBgContainer,
  bgElevated:      t.colorBgElevated,
  bgSpotlight:     t.colorBgSpotlight,

  // ── 边框 ──
  border:          t.colorBorder,
  borderSecondary: t.colorBorderSecondary,

  // ── 主色扩展 ──
  primary:         t.colorPrimary,
  primaryBg:       t.colorPrimaryBg,
  primaryBgHover:  t.colorPrimaryBgHover,
  primaryText:     t.colorPrimaryText,

  // ── 功能色 ──
  success:         t.colorSuccess,
  warning:         t.colorWarning,
  error:           t.colorError,
  info:            t.colorInfo,
  infoBg:          t.colorInfoBg,

  // ── 字号 ──
  fontSizeXS:      t.fontSizeSM,      // 12
  fontSizeSM:      t.fontSize,         // 14
  fontSizeMD:      t.fontSizeLG,       // 16
  fontSizeLG:      t.fontSizeXL,       // 18
  fontSizeXL:      t.fontSizeHeading4, // 20
  fontSizeXXL:     t.fontSizeHeading3, // 24
  fontSizeDisplay: t.fontSizeHeading1, // 38

  // ── 间距 ──
  spaceXXS: t.marginXXS,  // 4
  spaceXS:  t.marginXS,   // 8
  spaceSM:  t.marginSM,   // 12
  spaceMD:  t.margin,     // 16
  spaceLG:  t.marginLG,   // 24
  spaceXL:  t.marginXL,   // 32
  spaceXXL: t.marginXXL,  // 48

  // ── 圆角 ──
  radiusXS: t.borderRadiusXS,  // 2
  radiusSM: t.borderRadiusSM,  // 4
  radiusMD: t.borderRadius,    // 6
  radiusLG: t.borderRadiusLG,  // 8

  // ── 阴影 ──
  shadowSM: t.boxShadow,
  shadowMD: t.boxShadowSecondary,
});
```

#### Step 2: 第一批替换清单（高频、高影响）

| 优先级 | 硬编码 | → token | 影响文件数 | 风险 |
|---|---|---|---|---|
| 🔴 紧急 | `#1677ff` → `token.colorPrimary` | `message-box.tsx` 等 | 3 | 低（修bug） |
| 1 | `#666` → `token.colorTextSecondary` | 10+ | 低 |
| 2 | `#333` → `token.colorText` | 8+ | 低 |
| 3 | `#f3f3f3` → `token.colorBgLayout` | 5+ | 低 |
| 4 | `#fff` → `token.colorBgContainer` | 15+ | 中（需逐一确认背景语义） |
| 5 | `#ececec` → `token.colorBorderSecondary` | 5+ | 低 |
| 6 | `font-size: 12px` → `token.fontSizeSM` | 10+ | 低 |
| 7 | `padding: 12px` → `token.marginSM` | 10+ | 低 |
| 8 | `border-radius: 4px` → `token.borderRadiusSM` | 10+ | 低 |

**预期效果**：硬编码颜色从 40 种降至约 5 种（仅保留文件图标等业务特定色）。

---

### 🥈 P1 — 抽取公共样式 + 统一目录结构（预计第 3 周）

#### Step 1: 创建 `src/styles/mixins.ts`

```typescript
import { css } from 'styled-components';

/** 弹性居中 */
export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

/** 文字单行省略 */
export const textEllipsis = css`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

/** 卡片悬浮阴影 */
export const cardShadow = css`
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

/** 通用过渡动画 */
export const transitionBase = css`
  transition: all 0.3s ease;
`;

/** 可点击元素 */
export const clickable = css`
  cursor: pointer;
  user-select: none;
`;
```

#### Step 2: 统一样式目录结构

```
src/
├── styles/
│   ├── tokens.ts        # 语义化 token 映射
│   ├── mixins.ts        # 复用样式片段
│   ├── global.ts        # createGlobalStyle 全局样式
│   └── theme.ts         # 完整 ThemeConfig 配置
```

#### Step 3: 重命名 `_compt` → `_components`

---

### 🥉 P2 — 暗色模式基础设施（预计第 4-5 周）

P0 完成后，暗色模式变成**一行配置**：

```typescript
// store/themeReducer.ts
import { theme } from 'antd';
const { darkAlgorithm, defaultAlgorithm } = theme;

// App.tsx
const currentAlgorithm = themeMode === 'dark' ? darkAlgorithm : defaultAlgorithm;

<ConfigProvider theme={{ algorithm: currentAlgorithm, token: { colorPrimary: '#1677ff' } }}>
```

**关键收益**：所有组件已通过 `useToken()` 引用颜色，切换 algorithm 后 token 值自动变为暗色对应值，**零组件修改**。

---

### 🏅 P3 — 响应式断点 + 布局常量（预计第 5-6 周）

```typescript
// src/styles/breakpoints.ts
export const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const;

// src/styles/layout.ts — 消除硬编码的 calc(100vw - 90px)
export const SIDEBAR_WIDTH = 90;
export const HEADER_HEIGHT = 60;
```

---

## 五、量化收益预估

| 指标 | 当前状态 | 重构后 |
|---|---|---|
| 硬编码颜色种类 | ~40 种 | ~5 种（仅业务特定色） |
| 硬编码总次数 | ~160 处 | ~20 处 |
| 主题切换成本 | 不可行 | 一行 algorithm 切换 |
| 新增组件样式开发 | 从零写颜色/字号/间距 | 基于 token + mixin 组合 |
| 字号层级 | 10 种值，无体系 | 7 级语义化层级 |
| 间距尺度 | 10+ 种值，无规律 | 7 级标准间距（4 → 8 → 12 → 16 → 24 → 32 → 48） |
| 阴影种类 | 7 种定义 | 2-3 种语义化层级 |
| 全局视觉统一调整 | 逐文件手动修改 | 改一处 token 即可 |
| 代码可维护性 | 低（样式散落） | 高（集中管理） |
| 暗色模式支持 | 无 | 完整支持 |

---

## 六、风险提示

1. **回归风险**：P0 替换涉及 30+ 文件，建议逐文件替换 + 每次独立 commit，不要一次性全改
2. **视觉差异**：antd token 默认值与当前硬编码值可能有微小色差（如 `colorTextSecondary` 默认值可能不是 `#666`），需人工验收
3. **高优先级 Bug**：`message-box.tsx` 中硬编码的 `#1677ff` 是第一优先级，应最先修复
4. **styled-components transient props**：所有 token 传递使用 `$token` 前缀（transient prop），这是正确的实践，重构时保持不变
5. **antd version lock**：token 映射依赖 antd v5，升级 v6 时需重新验证 token 名称
6. **业务特定颜色**：文件类型图标色（`#4586f9`、`#e94748`、`#ee632e`、`#09a960`、`#bfc8d2`）不适合 token 化，保留在各自组件中

---

## 七、建议执行顺序

```
Week 1-2: 创建 src/styles/ → 替换高频颜色 + 修 message-box bug
Week 3:   替换字号 + 间距 + 圆角 + 抽取 mixins
Week 4:   统一目录结构 + 清理冗余代码
Week 5:   暗色模式基础设施 + 验证
Week 6:   响应式断点 + 布局常量（可选）
```
