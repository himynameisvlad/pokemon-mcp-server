# Pirog MCP Server

An MCP (Model Context Protocol) server that wraps the [PokeAPI](https://pokeapi.co/) to provide Pokemon data access through standardized tools. Built using the high-level `McpServer` API with Zod schema validation.

## Features

This MCP server provides the following tools:

- **get_pokemon** - Get detailed information about a Pokemon (stats, types, abilities, moves)
- **get_pokemon_species** - Get species information (evolution chain, habitat, flavor text)
- **get_ability** - Get information about a Pokemon ability
- **get_move** - Get information about a Pokemon move
- **get_type** - Get information about a Pokemon type (strengths/weaknesses)
- **list_pokemon** - List Pokemon with pagination
- **get_evolution_chain** - Get evolution chain information

## Installation

```bash
npm install
npm run build
```

## Configuration

### Using with Claude Desktop

Add this to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pirog": {
      "command": "node",
      "args": ["/absolute/path/to/pirog-mcp/build/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/pirog-mcp` with the actual path to this project.

### Using with Other MCP Clients

This server uses stdio transport. Run it with:

```bash
node build/index.js
```

## Usage Examples

Once configured, you can ask Claude questions like:

- "Tell me about Pikachu"
- "What are the weaknesses of electric type Pokemon?"
- "Show me the evolution chain for Eevee"
- "What does the ability 'Intimidate' do?"
- "List the first 50 Pokemon"
- "Tell me about the move Thunderbolt"

## Development

### Technologies

- **MCP SDK**: Uses the high-level `McpServer` API for simplified tool registration
- **Zod**: Schema validation for tool inputs
- **TypeScript**: Full type safety and modern JavaScript features

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

## API Reference

All tools interact with the [PokeAPI v2](https://pokeapi.co/docs/v2). The server fetches data from `https://pokeapi.co/api/v2/` endpoints and returns JSON responses.

## License

MIT
