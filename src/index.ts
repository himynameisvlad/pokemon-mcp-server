#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import express, { Request, Response } from "express";
import cors from "cors";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

async function fetchPokeAPI(endpoint: string): Promise<unknown> {
  const url = `${POKEAPI_BASE_URL}${endpoint}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`PokeAPI request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

const server = new McpServer(
  {
    name: "pirog-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register get_pokemon tool
server.registerTool(
  "get_pokemon",
  {
    description: "Get detailed information about a specific Pokemon by name or ID. Returns stats, types, abilities, moves, and more.",
    inputSchema: {
      identifier: z.string().describe("Pokemon name (e.g., 'pikachu') or ID (e.g., '25')"),
    },
  },
  async (args) => {
    const data = await fetchPokeAPI(`/pokemon/${args.identifier.toLowerCase()}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Register get_pokemon_species tool
server.registerTool(
  "get_pokemon_species",
  {
    description: "Get Pokemon species information including evolution chain, habitat, flavor text, and generation details.",
    inputSchema: {
      identifier: z.string().describe("Pokemon species name or ID"),
    },
  },
  async (args) => {
    const data = await fetchPokeAPI(`/pokemon-species/${args.identifier.toLowerCase()}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Register get_ability tool
server.registerTool(
  "get_ability",
  {
    description: "Get detailed information about a Pokemon ability including its effects and which Pokemon can have it.",
    inputSchema: {
      identifier: z.string().describe("Ability name (e.g., 'static') or ID"),
    },
  },
  async (args) => {
    const data = await fetchPokeAPI(`/ability/${args.identifier.toLowerCase()}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Register get_move tool
server.registerTool(
  "get_move",
  {
    description: "Get detailed information about a Pokemon move including power, accuracy, PP, type, and damage class.",
    inputSchema: {
      identifier: z.string().describe("Move name (e.g., 'thunderbolt') or ID"),
    },
  },
  async (args) => {
    const data = await fetchPokeAPI(`/move/${args.identifier.toLowerCase()}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Register get_type tool
server.registerTool(
  "get_type",
  {
    description: "Get information about a Pokemon type including damage relations (strengths/weaknesses) and Pokemon of that type.",
    inputSchema: {
      identifier: z.string().describe("Type name (e.g., 'electric', 'fire') or ID"),
    },
  },
  async (args) => {
    const data = await fetchPokeAPI(`/type/${args.identifier.toLowerCase()}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Register list_pokemon tool
server.registerTool(
  "list_pokemon",
  {
    description: "List Pokemon with pagination support. Returns names and URLs for detailed information.",
    inputSchema: {
      limit: z.number().optional().default(20).describe("Number of Pokemon to return (default: 20, max: 100)"),
      offset: z.number().optional().default(0).describe("Offset for pagination (default: 0)"),
    },
  },
  async (args) => {
    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;
    const cappedLimit = Math.min(limit, 100);
    const data = await fetchPokeAPI(`/pokemon?limit=${cappedLimit}&offset=${offset}`) as PokemonListResponse;
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Register get_evolution_chain tool
server.registerTool(
  "get_evolution_chain",
  {
    description: "Get the evolution chain for a Pokemon species by evolution chain ID.",
    inputSchema: {
      id: z.string().describe("Evolution chain ID"),
    },
  },
  async (args) => {
    const data = await fetchPokeAPI(`/evolution-chain/${args.id}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

async function main() {
  const app = express();
  const PORT = 8000;

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.post("/sse", async (_req: Request, res: Response) => {
    const transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
  });

  app.listen(PORT, () => {
    console.error(`Pokemon MCP Server running on http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
