# Hello RSK Squid

A complete Subsquid v2 EVM indexer for the Rootstock (RSK) blockchain. This indexer tracks blocks, transactions, and ERC-20 token transfers on the RSK network.

## 🚀 What This Does

This indexer provides a GraphQL API that allows you to query:

- **Blocks**: Block height, timestamp, and hash information
- **Transactions**: Transaction details including sender, receiver, value, and success status
- **ERC-20 Transfers**: Token transfer events with sender, receiver, token address, and amount

The indexer continuously syncs with the RSK blockchain and stores all data in a PostgreSQL database for fast querying.

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- A Rootstock (RSK) RPC endpoint

## 🛠️ Local Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd hello-rsk-squid
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Rootstock RPC endpoint (required)
RSK_RPC_URL=https://public-node.rsk.co

# Starting block number (optional - defaults to 0)
START_BLOCK=5600000

# Database configuration (usually no need to change)
DB_NAME=squid
DB_USER=squid
DB_PASS=squid
DB_HOST=localhost
DB_PORT=5432
```

### 3. Start the Database

```bash
npm run db:up
```

This starts a PostgreSQL database in Docker.

### 4. Generate TypeScript Models

```bash
npm run codegen
```

This generates TypeScript entity models from your GraphQL schema.

### 5. Build the Project

```bash
npm run build
```

### 6. Generate and Apply Database Migrations

```bash
npm run mig:gen
npm run mig:apply
```

This creates the database tables based on your schema.

### 7. Start the Indexer

```bash
npm run process
```

The indexer will start processing blocks from the RSK blockchain. You'll see output like:

```
{"level":2,"msg":"processing blocks from 5600000"}
{"level":2,"msg":"5600009 / 8064059, rate: 3 blocks/sec, mapping: 98 blocks/sec, 177 items/sec, eta: 224h 49m"}
```

### 8. Start the GraphQL Server (in a new terminal)

```bash
npm run serve
```

The GraphQL API will be available at `http://localhost:4000/graphql`

## 🔍 Using the GraphQL API

### Example Queries

#### Get Recent Blocks
```graphql
query {
  blocks(limit: 10, orderBy: height_DESC) {
    id
    height
    timestamp
    transactions {
      hash
      from
      to
      value
      success
    }
  }
}
```

#### Get Transactions by Address
```graphql
query {
  transactions(where: {from_eq: "0x123..."}, limit: 10) {
    id
    hash
    from
    to
    value
    success
    block {
      height
      timestamp
    }
  }
}
```

#### Get ERC-20 Transfers
```graphql
query {
  transfers(limit: 10, orderBy: block_height_DESC) {
    id
    token
    from
    to
    value
    tx {
      hash
      from
      to
    }
    block {
      height
      timestamp
    }
  }
}
```

#### Get Transfers for a Specific Token
```graphql
query {
  transfers(where: {token_eq: "0x..."}, limit: 10) {
    id
    from
    to
    value
    block {
      height
      timestamp
    }
  }
}
```

## 📊 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build the TypeScript project |
| `npm run codegen` | Generate TypeScript models from schema |
| `npm run mig:gen` | Generate database migrations |
| `npm run mig:apply` | Apply database migrations |
| `npm run process` | Start the blockchain indexer |
| `npm run serve` | Start the GraphQL API server |
| `npm run db:up` | Start PostgreSQL database |
| `npm run db:down` | Stop and remove database |

## 🏗️ Project Structure

```
hello-rsk-squid/
├── src/
│   ├── processor.ts          # Main indexer logic
│   ├── server.ts             # GraphQL server entry point
│   ├── model/
│   │   ├── index.ts          # Model exports
│   │   └── generated/        # Auto-generated TypeScript models
│   └── mappings/
│       └── erc20.ts          # ERC-20 transfer handling
├── schema.graphql            # GraphQL schema definition
├── squid.yaml               # Subsquid configuration
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## 🔧 Configuration

### RPC Endpoints

The default RPC endpoint (`https://public-node.rsk.co`) may have limitations. For production use, consider:

- **RSK Mainnet**: Use a premium RPC provider like Infura, Alchemy, or QuickNode
- **RSK Testnet**: `https://public-node.testnet.rsk.co`

### Performance Tuning

- **START_BLOCK**: Set to a recent block number for faster initial sync
- **rateLimit**: Adjust in `processor.ts` based on your RPC provider's limits
- **finalityConfirmation**: Set in `processor.ts` (default: 5 blocks)

## 🚨 Troubleshooting

### Common Issues

#### 1. RPC Method Not Available
```
RpcError: the method eth_getLogs does not exist/is not available
```
**Solution**: The public RSK node doesn't support `eth_getLogs`. Use a premium RPC provider or remove ERC-20 indexing temporarily.

#### 2. Database Connection Issues
```
Error: connect ECONNREFUSED
```
**Solution**: Make sure the database is running with `npm run db:up`

#### 3. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::4000
```
**Solution**: Kill existing processes or change the port in `squid.yaml`

### Reset Everything

To start fresh:

```bash
npm run db:down
npm run db:up
npm run mig:apply
npm run build
npm run process
```

## 📈 Monitoring

- **Processor Logs**: Watch the terminal running `npm run process` for indexing progress
- **GraphQL Playground**: Visit `http://localhost:4000/graphql` to test queries
- **Prometheus Metrics**: Available on a random port (shown in processor logs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Useful Links

- [Subsquid Documentation](https://docs.subsquid.io/)
- [Rootstock Documentation](https://developers.rsk.co/)
- [GraphQL Playground](http://localhost:4000/graphql)

---

**Happy Indexing! 🦑**