# 0031 - Add Next Devtools MCP Server

## Status
Accepted

## Context
To enhance the development experience and enable advanced debugging and introspection capabilities for Next.js applications within the Cursor IDE, an MCP (Multi-Component Platform) server for Next.js Devtools is required.

## Decision
We will add the following configuration to `.cursor/settings.json` to integrate the `next-devtools` MCP server:

```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

This configuration instructs Cursor to use `npx next-devtools-mcp@latest` as the command to start the `next-devtools` MCP server.

## Consequences
- The Cursor IDE will now be able to connect to and utilize the Next.js Devtools MCP server.
- Developers will have access to enhanced debugging and development features for Next.js applications directly within the IDE.
- The `next-devtools-mcp` package will be downloaded and executed via `npx` when the MCP server is initialized by Cursor.