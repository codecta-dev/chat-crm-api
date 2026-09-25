# Servidor jypsac (Tailscale 100.77.254.40) — Checklist global
# Archivo de referencia, NO se usa directo. Cada servicio tiene su propio compose prod.
# Lo ejecutas tú por SSH.

## 0. Conexión
```bash
ssh jypsac@100.77.254.40
ls -la /home/jypsac/Proyectos/CRM/
# esperado: chat-crm-api/ chat-crm-app/ chat-crm-ia/ (o solo chat-crm-app si aún no clonaste los otros)
```

## 1. Red compartida (se crea sola por `name: crm-network`, pero puedes pre-crearla)
```bash
docker network ls | grep crm-network || docker network create crm-network
```

## 2. Orden de despliegue
1. `chat-crm-api` (MySQL+Redis+API :3000)
2. `chat-crm-ia` (:8000, en crm-network)
3. `chat-crm-app` (nginx :8081)

```bash
cd /home/jypsac/Proyectos/CRM/chat-crm-api
git pull
cp -n .env.prod.example .env.prod  # solo primera vez
nano .env.prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up --build -d

cd ../chat-crm-ia
git pull  # o scp si aún no es repo
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

cd ../chat-crm-app
git pull
cp -n .env.prod.example .env.prod
nano .env.prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up --build -d
```

## 3. Validación global
```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
curl -s http://localhost:3000/health
curl -s http://localhost:8000/health
curl -s http://localhost:8081/health
docker logs nestjs-app --tail 30
docker logs chat-crm-ia --tail 20
docker logs chat-crm-app-prod --tail 20
```

## 4. Puertos en servidor
- 3000 API (navegador + front la usan directo)
- 8000 IA (solo interna, puedes cerrarlo con firewall si quieres)
- 8081 Front nginx
- NO exponer 3306/6379 en prod (ya están con `ports: !override []`)

## 5. Seguridad pendiente
- `chat-crm-api/.env` local tiene tokens reales y puede estar en historial git → rota `WHATSAPP_ACCESS_TOKEN` y `JWT_SECRET`, verifica `git ls-files | grep env`, y agrega `.env.prod` a `.gitignore` (línea `.env.prod`).
- Genera secretos: `openssl rand -hex 32`
- `CORS_ORIGIN=http://100.77.254.40:8081`, `COOKIE_SECURE=0` (solo 1 si hay HTTPS).
