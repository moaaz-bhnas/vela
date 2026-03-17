# Use your existing docker-compose file for infra
docker_compose('docker-compose.yml')

# Long-running backend dev server
local_resource(
  name='backend-dev',
  serve_cmd='cd backend && pnpm dev',
  labels=['dev'],
  resource_deps=['postgres', 'redis', 'minio', 'meilisearch'],
  links=['http://localhost:9000'] # Standard Medusa/Backend port
)

# Long-running storefront dev server
local_resource(
  name='storefront-dev',
  serve_cmd='cd storefront && pnpm dev',
  labels=['dev'],
  links=['http://localhost:8000'] # Standard Storefront port
)