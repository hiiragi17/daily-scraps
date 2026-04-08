---
title: '今日学んだこと：MCPに関して'
description: 'AnthropicがオープンソースとしてリリースしたMCPの仕組みを、N×M問題の解決・技術的構造・サーバー実装の観点から整理した。'
pubDate: 2026-04-08
tags: ['MCP', 'AI', 'Anthropic', 'JSON-RPC', 'Claude']
draft: false
customSlug: 'mcp-model-context-protocol'
---

MCP（Model Context Protocol）は、Anthropicが2024年11月にオープンソース（MITライセンス）として公開したプロトコル規格だ。Claudeだけでなく、あらゆるAIが採用できるよう設計されている。

---

## MCPとは何か

一言でいうと、**「AIと外部ツールをつなぐ共通のインターフェース規格」**だ。

ChatGPT・Gemini・VS Code・Cursorなど、主要なAIアプリが次々と採用しており、「AIのUSB-C」とも呼ばれるような標準化の役割を担っている。

---

## なぜ必要だったか（N×M問題）

MCPが登場する前、AIに外部ツールを使わせるには「そのAI専用 × そのツール専用」の連携コードを一から書く必要があった。

```
【MCP以前】
Claude    × Slack    = 専用実装
Claude    × GitHub   = 専用実装
ChatGPT   × Slack    = 専用実装
ChatGPT   × GitHub   = 専用実装
...（AIの数 × ツールの数 = N×M通りの実装）
```

MCPが共通規格を定めたことで、「MCPサーバー」を一度作ればどのAIからでも使えるようになった。実装コストが **N×M → N+M** に削減される。

```
【MCP以後】
Claude ─┐
ChatGPT ─┤── MCPプロトコル ──→ Slack MCPサーバー
Gemini  ─┘                  → GitHub MCPサーバー
```

---

## 技術的な仕組み

通信フォーマットとして **JSON-RPC 2.0** を採用している。MCPサーバーはAIに対して主に3種類のものを提供する。

| 種別 | 役割 | 例 |
|------|------|----|
| **Tools** | 関数の実行 | ファイル作成、APIコール、DB操作 |
| **Resources** | ファイルやデータの読み取り | ドキュメント参照、ログ確認 |
| **Prompts** | 定型プロンプトのテンプレート | よく使う指示のパターン化 |

AIがMCPサーバーを使う流れはシンプルだ。

```
1. AI → MCPサーバー：「何ができるか教えて」（capabilities問い合わせ）
2. MCPサーバー → AI：「こんなToolsとResourcesがあります」
3. AI → MCPサーバー：「じゃあこのToolを呼んで」（tool_call）
4. MCPサーバー → AI：「結果はこれです」
```

JSON-RPCのリクエスト例はこんな形になる。

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "read_file",
    "arguments": {
      "path": "/tmp/example.txt"
    }
  },
  "id": 1
}
```

---

## 誰でもサーバーを作れる

MCPサーバーは仕様さえ満たせば誰でも作って公開できる。Python・TypeScript向けの公式SDKが提供されており、最低限のコードでサーバーを立てられる。

```python
from mcp.server import Server
from mcp.server.stdio import stdio_server
import mcp.types as types

server = Server("my-tool-server")

@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="get_weather",
            description="指定した都市の天気を取得する",
            inputSchema={
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"],
            },
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "get_weather":
        city = arguments["city"]
        # 実際には外部APIを呼ぶ
        return [types.TextContent(type="text", text=f"{city}の天気: 晴れ")]

async def main():
    async with stdio_server() as streams:
        await server.run(*streams, server.create_initialization_options())
```

社内の独自ツールをMCPサーバー化してClaude Codeなどから使う、といったことも現実的に行われている。

---

## 一言でまとめると

> **「N×M問題を解消した、AIとツールの共通プラグイン規格」** がMCPだ。

MCPサーバーを一度作れば、Claude・ChatGPT・Geminiなど対応AIすべてから使える。JSON-RPC 2.0をベースにした設計はシンプルで、公式SDKを使えば数十行で独自サーバーを実装できる。AIエージェントが増えるほど、MCPの標準化メリットは大きくなる。

---

## 参考文献・リンク

https://modelcontextprotocol.io/introduction

https://github.com/modelcontextprotocol/python-sdk

https://www.anthropic.com/news/model-context-protocol

---
