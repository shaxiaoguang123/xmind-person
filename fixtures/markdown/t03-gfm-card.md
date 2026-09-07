# GFM 渲染

T03 GFM fixture root.

## Markdown Feature Card

普通段落支持中文与 English text。

- unordered item
- [x] completed task
- [ ] pending task

1. first ordered item
2. second ordered item

~~deprecated text~~ and `inlineCode()`.

```ts
const upload = (name: string) => name;
```

> Blockquote content remains readable inside the card.

| Feature | Status |
| --- | --- |
| table | yes |
| links | yes |

[安全链接](https://example.com/docs)

[不安全链接](javascript:alert(1))

<script>globalThis.__t03RawHtmlExecuted = true</script>

<div onclick="globalThis.__t03RawHtmlClicked = true">Raw HTML must not render.</div>
