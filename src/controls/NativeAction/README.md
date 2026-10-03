# NativeAction（内部）

统一文字按钮与图标按钮的 button / a 语义，ref始终指向原生控件。
href存在才是链接，可交给宿主路由组件；禁用链接不带href、不响应激活、不使用路由组件。
不拥有外观、路由状态或导航服务；外观由 GameButton / GameIconButton 负责。
