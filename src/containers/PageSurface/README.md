# PageSurface

工具页面的通用骨架：标题区、可选标题旁槽位、主动作槽、内容槽、可选侧栏和底部槽位。

`PageSurface` 不负责路由、数据、文案、加载或业务状态；宿主用 `children` 和槽位注入这些内容。`layout="split"` 适合审阅/设置类左右结构，`layout="centered"` 让内容保持可读宽度。
