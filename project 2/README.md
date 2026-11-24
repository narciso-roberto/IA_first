# Weekly Project Progress Tracker

## Local PostgreSQL database

Prerequisites: Docker Engine and the Docker Compose plugin.

From the `project 2` directory, create a local environment file and set a development-only password:

```bash
cp .env.example .env
```

Edit `.env` and replace `POSTGRES_PASSWORD` with a private local password. Update the password in `DATABASE_URL` to match. You can generate a URL-safe random password with `openssl rand -hex 24`.

Start PostgreSQL in the background:

```bash
docker compose up -d db
```

Check that the database is ready:

```bash
docker compose ps
docker compose logs db
```

The service reports `healthy` when PostgreSQL accepts connections. It is exposed only on `127.0.0.1`, using port `5432` by default. To use a different local port, change `POSTGRES_PORT` in `.env` and update the port in `DATABASE_URL`.

Stop and remove the local container while keeping the database data:

```bash
docker compose down
```

The named Docker volume preserves data across stops and container recreation. To start it again, run `docker compose up -d db`. Removing the database volume with `docker compose down --volumes` permanently deletes the local database contents.

The `.env` file contains local credentials and is ignored by Git. Commit `.env.example`, not `.env`. PostgreSQL's initialization variables are applied when the data volume is first created; changing the password in `.env` does not change the password inside an already initialized database.
