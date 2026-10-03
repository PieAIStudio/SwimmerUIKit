# GameProgress

静止水滴轨道高10px，潮汐液面只在数值变化时晃动约600ms，然后完全停止绘制。
参数value、max、label、showValue、valueLabel；语义进度即时更新，不等待动画。
不占滤镜预算，不用tone换色；减少动态直接到位。不编造进度，不是可点击CTA。
