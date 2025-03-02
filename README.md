### Для старта приложения необходимо запустить команду ниже, предварительно установив docker на свою тачку

```bash
docker compose up -d --scale holder=2 --scale gateway=3 --build
```

### Для остановки приложения необходимо запустить команду ниже

```bash
docker compose down
```
