import { useEffect, useRef } from 'react';
import { Alert, Button, Card, Collapse, Space, Typography } from 'antd';
import { effect, queueJob, reactive } from './reactivity';
import source from './reactivity.ts?raw';

const { Title, Paragraph } = Typography;

export default function ReactiveRendering() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current!;
    const state = reactive({ count: 0, user: { name: '小明' }, showCount: true });
    let renders = 0;
    root.innerHTML = `
      <p data-output aria-live="polite"></p>
      <p data-renders></p>
      <p data-branch></p>
      <p data-status aria-live="polite">点击按钮观察更新</p>
    `;
    const stop = effect(() => {
      root.querySelector('[data-output]')!.textContent = state.showCount
        ? `${state.user.name} 点击了 ${state.count} 次`
        : `${state.user.name}：计数已隐藏`;
      root.querySelector('[data-renders]')!.textContent = `渲染次数：${++renders}`;
      root.querySelector('[data-branch]')!.textContent = state.showCount
        ? '当前依赖：user、name、showCount、count'
        : '当前依赖：user、name、showCount（修改 count 不会渲染）';
    }, queueJob);

    const controls = root.parentElement!;
    const click = (event: MouseEvent) => {
      const action = (event.target as HTMLElement).closest('[data-action]')?.getAttribute('data-action');
      if (!action) return;
      const before = renders;
      if (action === 'increment') state.count++;
      if (action === 'batch') { state.count++; state.count++; state.count++; }
      if (action === 'rename') state.user.name = state.user.name === '小明' ? '小红' : '小明';
      if (action === 'toggle') state.showCount = !state.showCount;
      if (action === 'same') { const current = state.count; state.count = current; }
      queueMicrotask(() => {
        if (root.isConnected) root.querySelector('[data-status]')!.textContent =
          `操作完成：本轮渲染 ${renders - before} 次，当前 count = ${state.count}`;
      });
    };
    controls.addEventListener('click', click);
    return () => { stop(); controls.removeEventListener('click', click); root.replaceChildren(); };
  }, []);

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={2}>实现一个响应式渲染系统</Title>
        <Paragraph type="secondary">前端面试示例：Proxy 拦截读取与赋值，effect 收集依赖，微任务队列合并渲染。</Paragraph>
      </div>
      <Alert type="info" showIcon title="观察重点" description="连续增加三次只渲染一次；隐藏计数后再增加不会渲染；恢复显示后会读取最新值。相同值赋值不会触发更新。" />
      <Card title="交互演示">
        <div ref={host} />
        <Space wrap>
          <Button data-action="increment" type="primary">增加一次</Button>
          <Button data-action="batch">同步增加三次</Button>
          <Button data-action="rename">切换姓名（嵌套对象）</Button>
          <Button data-action="toggle">显示 / 隐藏计数</Button>
          <Button data-action="same">赋相同值</Button>
        </Space>
      </Card>
      <Card title="实现思路">
        <Paragraph>① 读取属性时，将当前 effect 存入 WeakMap → Map → Set 依赖表。</Paragraph>
        <Paragraph>② 修改属性时，使用 Object.is 判断变化，再通知依赖该属性的 effect。</Paragraph>
        <Paragraph>③ Set 去重任务，queueMicrotask 批量执行；每次执行前清理旧依赖，以支持条件分支。</Paragraph>
        <Paragraph>④ 页面卸载时停止 effect 并移除依赖。演示区域由手写响应式系统直接更新 DOM，React 负责页面外壳。</Paragraph>
        <Paragraph type="secondary">范围：普通对象和嵌套属性的读取、赋值。删除、遍历、数组及 Map / Set 的完整响应式语义需要额外实现。</Paragraph>
      </Card>
      <Collapse items={[{ key: 'source', label: '查看完整响应式核心源码（TypeScript）', children: <pre style={{ overflowX: 'auto', margin: 0 }}><code>{source}</code></pre> }]} />
    </Space>
  );
}
