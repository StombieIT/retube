### Для старта приложения необходимо запустить команду ниже, предварительно установив docker на свою тачку

```bash
docker compose up -d --scale holder=2 --scale gateway=3 --build
```

### Для старта локального приложения необходимо запустить команду
```bash
docker compose up -f docker-compose.dev.yml -d
```

### Для остановки приложения необходимо запустить команду ниже

```bash
docker compose down
```

#### Перед запуском необходимо обязательно определить переменные окружения в файле .env

На локалке разработки он выглядит примерно так:

```conf
PASSWORD_HASH_SECRET=hash_secret
JWT_SECRET=jwt_secret
HOST=localhost
```
