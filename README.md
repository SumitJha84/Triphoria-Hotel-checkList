# Hotel Offer Orchestrator

A backend application that compares hotel offers from two mock HTTP suppliers, deduplicates hotel names, chooses the cheapest offer, caches results in Redis, and coordinates the flow with Temporal.

## Architecture

```text
Client -> Express API -> Temporal Client
                           |
                           v
Temporal Server -> Temporal Worker
                   |            |
                   | Supplier A/B activities call supplier routes over HTTP
                   + Redis persistence activity
```

The Express API is independently deployable from the worker. The workflow is deterministic; network calls and Redis operations exist only in activities.

## Technology

- Node.js 22 and TypeScript
- Express 4
- Temporal TypeScript SDK
- Redis 7 with sorted sets and hashes
- Docker and Docker Compose
- Axios

## Project Structure

```text
src/config/       Environment, Redis, and Temporal connections
src/suppliers/    Mock supplier routes and datasets
src/hotels/       API routes, validation, cache, and workflow client
src/temporal/     Workflow, activities, and worker
src/middleware/   Structured error handling
postman/          Importable Postman collection
test/             Automated tests
```

## Prerequisites

- Node.js 22+
- npm
- Docker Desktop or Docker Engine

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Express port |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `CACHE_TTL_SECONDS` | `300` | Cache lifetime |
| `TEMPORAL_ADDRESS` | `localhost:7233` | Temporal frontend |
| `TEMPORAL_NAMESPACE` | `default` | Temporal namespace |
| `TEMPORAL_TASK_QUEUE` | `hotel-offers` | Worker task queue |
| `SUPPLIER_A_URL` | `http://localhost:3000` | Supplier A base URL |
| `SUPPLIER_B_URL` | `http://localhost:3000` | Supplier B base URL |

## Local Setup

Start Redis and Temporal, then run the API and worker in separate terminals:

```powershell
npm install
npm run build

# Terminal 1
npm start

# Terminal 2
npm run worker
```

Redis and Temporal must already be running and reachable. For Redis: `docker run --name hotel-redis -p 6379:6379 redis:7-alpine`. For a local Temporal server, use Temporal's standard development server on port 7233.

Development with automatic reload:

```powershell
npm run dev
npm run worker
```

## Docker Setup

```powershell
docker compose up --build
docker compose ps
```

The Compose stack includes Redis, Temporal, the Express API, and the worker. Redis data is persisted with the `redis-data` volume.

Stop and remove containers while keeping Redis data:

```powershell
docker compose down
```

Remove Redis data too:

```powershell
docker compose down -v
```

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/hotels?city=delhi` | Start/return the workflow result |
| GET | `/api/hotels?city=mumbai&minPrice=4000&maxPrice=7000` | Redis-side inclusive price filter |
| GET | `/supplierA/hotels?city=delhi` | Mock Supplier A |
| GET | `/supplierB/hotels?city=delhi` | Mock Supplier B |
| GET | `/health` | Dependency health |

Example response:

```json
[
  { "name": "Holtin", "price": 5340, "supplier": "Supplier B", "commissionPct": 20 },
  { "name": "Radison", "price": 5900, "supplier": "Supplier A", "commissionPct": 13 }
]
```

Accepted cities are `delhi`, `mumbai`, and `chennai`. Chennai intentionally has no supplier inventory. Missing or unsupported cities return `400`.

## Redis Design

Each city uses separate keys:

- `hotels:delhi:prices`: ZSET whose member is a normalized hotel name and score is price.
- `hotels:delhi:details`: hash keyed by normalized hotel name with the complete offer JSON.

On cache hits, price filters use Redis `ZRANGEBYSCORE` for the lower and/or upper bound. The API then reads only matching hotel details. Both keys expire after `CACHE_TTL_SECONDS`.

## Temporal Flow

1. Express validates input and checks Redis.
2. On a cache miss, Express starts `hotelOfferWorkflow`.
3. The workflow invokes Supplier A and Supplier B activities concurrently with `Promise.allSettled`.
4. If one supplier fails, the workflow uses the successful supplier.
5. The workflow normalizes names and keeps the lower-priced duplicate.
6. A Redis activity writes the ZSET and details hash.
7. Express returns the workflow result.

Activity retries cover transient supplier and Redis failures. Workflow execution has a 30-second timeout.

## Testing

Import `postman/Hotel-Offer-Orchestrator.postman_collection.json` into Postman and set `baseUrl` if not using `http://localhost:3000`.

Run unit/build checks:

```powershell
npm test
npm run build
```

## Production Deployment

Deploy the API and worker as separate services:

1. Provision a managed Redis instance and a Temporal Cloud namespace or Temporal cluster.
2. Deploy the Express service with `docker compose`-incompatible container settings:
   - `npm start`
   - set production Redis, Temporal, and supplier URLs.
3. Deploy a second instance with `npm run worker:start`.
4. Scale the worker independently according to workflow volume.
5. Give Supplier A/B URLs publicly or privately reachable network addresses.
6. Use TLS Redis URLs and Temporal Cloud/API credentials as environment variables.
7. Place the Express API behind a load balancer and monitor `/health`.

Production architecture:

```text
Load Balancer -> API containers -> Temporal service
                                      |
                               Worker containers
                                      |
                                  Redis
```
