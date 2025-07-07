# CSS Import Example

This example shows how to easily import the VitePress-compatible CSS for the multiple choice plugin.

## Simple Import

Just like other VitePress plugins, you can now import the CSS directly:

```js
// In your VitePress config or theme setup
import 'markdown-it-multiple-choice/style.css'
```

## VitePress Theme Setup

Here's a complete example of setting up the plugin with VitePress:

### 1. Install the plugin

```bash
npm install markdown-it-multiple-choice
```

### 2. Configure VitePress (.vitepress/config.js)

```js
import { defineConfig } from 'vitepress'
import multipleChoicePlugin from 'markdown-it-multiple-choice'

export default defineConfig({
  markdown: {
    config: (md) => {
      md.use(multipleChoicePlugin)
    }
  },
  ssr: {
    noExternal: ['markdown-it-multiple-choice']
  }
})
```

### 3. Setup Theme (.vitepress/theme/index.js)

```js
import DefaultTheme from 'vitepress/theme'
import { setupMultipleChoice } from 'markdown-it-multiple-choice'
import 'markdown-it-multiple-choice/style.css'  // Easy CSS import!
import { onMounted } from 'vue'

export default {
  extends: DefaultTheme,
  setup() {
    onMounted(() => {
      setupMultipleChoice()
    })
  }
}
```

### 4. Use in Markdown

```markdown
[?] What is the capital of France?

[ ] London
[x] Paris
[ ] Berlin
[ ] Madrid
```

That's it! The CSS will be automatically loaded and your multiple choice questions will be properly styled.

## Alternative: Programmatic Theme Creation

You can also use the helper function:

```js
import DefaultTheme from 'vitepress/theme'
import { createVitePressTheme } from 'markdown-it-multiple-choice'
import 'markdown-it-multiple-choice/style.css'

export default createVitePressTheme(DefaultTheme)
``` 