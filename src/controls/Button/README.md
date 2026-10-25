# Button

href输出原生链接，可传target/rel/download或linkComponent路由组件；禁用链接无href且不能聚焦。
默认md，sm高32px；primary包括链接仍是一屏唯一液体CTA，按压只改背景。

触发明确动作的原生按钮；primary 是唯一潮汐液体 CTA，其余是二维水滴。

主要参数：variant、hue、fullWidth、static、sound、pending 以及原生 button 参数。pending 表示处理中：primary 呼吸但仍是液体 CTA，其余变体轻微脉冲；设置 aria-busy，不设置 disabled。

固定控件需要跨重新挂载保持同一水滴轮廓时，传稳定且页面内唯一的原生 `id`；它同时作为平面背景的形状种子，不从文字或加载顺序猜身份。未提供 `id` 的控件保留自动分配的轮廓。`static` 控件使用干净的圆角边，不绘制手绘抖动轮廓；尺寸变化仍按原几何重新绘制，按压和减少动态规则不变。

边界：一屏最多一个 primary；表单提交写 type="submit"。不再支持 surface、liquidFinish 或按钮铜牌皮肤。
