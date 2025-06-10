# 🚀 SIGIES – Guía Completa de Instalación y Configuración

> **Bienvenido a SIGIES!**  
> Sigue esta guía paso a paso para desplegar tu entorno de desarrollo y producción con Docker, PostgreSQL y Symfony.

---

## 🔧 Requisitos Previos

- **Sistemas Operativos**
  - Linux: Ubuntu 20.04+, Debian 11, CentOS 8
  - macOS (Catalina+), Windows 10/11
- **Herramientas**
  - Docker 20.10+ & Docker Compose
  - PHP 7.4+ (CLI, mbstring, xml)
  - Symfony CLI (recomendado)
  - Git
  - Acceso SSH con permisos `sudo` (en servidores remotos)

---

## 🐳 Instalación de Docker & Docker Compose

### Linux (Ubuntu/Debian)

    sudo apt update && sudo apt install -y \
      docker.io \
      docker-compose \
      git \
      php7.4 php7.4-cli php7.4-mbstring php7.4-xml

    sudo systemctl enable docker
    sudo systemctl start docker

### macOS

    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    brew install --cask docker
    brew install php@7.4
    brew install symfony-cli/tap/symfony-cli
    open /Applications/Docker.app

### Windows

1. Instalar [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/).
2. En PowerShell (admin):  
    choco install php --version=7.4
3. Descargar e instalar Symfony CLI desde https://symfony.com/download

---

## ⚙️ Configuración del Daemon de Docker (red UCI)

Edita (o crea) `/etc/docker/daemon.json` con:

    {
      "dns": ["10.0.0.2","10.0.0.3","10.0.0.4","8.8.8.8"],
      "dns-search": ["uci.cu"],
      "insecure-registries": ["docker.prod.uci.cu"],
      "registry-mirrors": ["https://docker.prod.uci.cu"]
    }

> Si da error JSON, valida con:

    sudo cat /etc/docker/daemon.json | jq .

Reinicia Docker:

    sudo systemctl daemon-reload
    sudo systemctl restart docker

---

## ✅ Verificar e “Hello World”

    docker pull docker.prod.uci.cu/docker-all/hello-world
    docker run --rm hello-world

Si ves “Hello from Docker!”, ¡listo!

---

## 📥 Clonar y Levantar SIGIES

    git clone -b <rama> https://gitlab.prod.uci.cu/fortes/SIGIES.git
    cd SIGIES
    docker-compose up -d

Abre en tu navegador: `http://localhost:5800`  
_(Comprueba acceso a `_.uci.cu` si trabajas en la red UCI.)\*

---

## 💾 Restauración de Base de Datos

> **Script**: coloca este contenido en `pg_restore.sh` y hazlo ejecutable con `chmod +x pg_restore.sh`

    #!/usr/bin/env bash
    set -euo pipefail

    POSTGRES_CONTAINER="sigies_postgres"
    POSTGRES_DB="sigies-backup"
    BACKUP_PATH="./backups/backup.sql"
    POSTGRES_USER="postgres"
    POSTGRES_PASSWORD="postgres"

    echo "📦 Verificando contenedor PostgreSQL..."
    if ! docker inspect "$POSTGRES_CONTAINER" &>/dev/null; then
      echo "❌ Contenedor $POSTGRES_CONTAINER no existe."
      exit 1
    fi

    echo "▶️ Copiando backup a contenedor..."
    docker cp "$BACKUP_PATH" "$POSTGRES_CONTAINER":/tmp/backup.sql

    echo "🔄 Restaurando base de datos..."
    docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" -it "$POSTGRES_CONTAINER" \
      psql -U "$POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS $POSTGRES_DB;"
    docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" -it "$POSTGRES_CONTAINER" \
      psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $POSTGRES_DB;"
    docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" -it "$POSTGRES_CONTAINER" \
      psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/backup.sql

    echo "✅ Base de datos '$POSTGRES_DB' restaurada."

---

## ⚙️ Variables de Entorno (`.env`)

Crea o edita `./.env`:

    POSTGRES_PORT=5465
    POSTGRES_HOST=localhost
    POSTGRES_DB=sigies-backup
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres

    SDR_CONNECTION_DATABASE_NAME=sigies-backup
    SDR_CONNECTION_HOST=localhost

_(Si existe `.env.example`, haz `cp .env.example .env` y ajusta.)_

---

## 👤 Gestión de Usuarios Symfony

    docker exec -it sigies_app bash
    php bin/console fos:user:change-password

---

## 🛠️ Solución de Problemas Frecuentes

| Síntoma                                    | Causa posible               | Solución rápida                                      |
| ------------------------------------------ | --------------------------- | ---------------------------------------------------- |
| `docker-compose: command not found`        | Compose no está en PATH     | Usa `docker compose up -d` o instala Compose.        |
| JSON inválido en `daemon.json`             | Error de sintaxis           | Valida con `jq`, corrige comas/comillas.             |
| `permission denied` al restaurar DB        | Credenciales incorrectas    | Revisa `POSTGRES_USER/PASSWORD` en el script.        |
| Symfony no encuentra `fos:user:*` comandos | Binaries no instalados      | Ejecuta `composer install` y `php bin/console list`. |
| Error conexión a registry UCI              | DNS interno no configurado  | Revisa sección DNS en daemon Docker.                 |
| Sitio no carga en `localhost:5800`         | Contenedor falló al iniciar | Ejecuta `docker-compose logs app` y corrige error.   |

---

## 💡 Configuración de PHPStorm

1. Descarga PHPStorm 2023.1.6 (tar.gz).
2. Descomprime y reemplaza `phpstormv64.options` en `/bin`.
3. Activa con el código del Centro.
4. En PHPStorm:
   - **File ▸ Settings ▸ PHP ▸ CLI Interpreter**: señala tu `php` local
   - **Path Mappings**:  
      `/ruta/local/SIGIES` → `/var/www/html/SIGIES`
5. Instala extensión Firebug (o Firefox Dev) y habilita debug (icono escarabajo).

---

## 📖 Recursos & Contacto

- 🌐 Docker Docs: https://docs.docker.com/
- 🐘 PostgreSQL Docs: https://www.postgresql.org/docs/
- 🕸️ Symfony Docs: https://symfony.com/doc/current/index.html
- 🤝 Soporte SIGIES:
  - Email: `sigies-dev@empresa.com`
  - Slack: `#sigies-dev`

---

_Este README.md es tu “todo en uno” para desplegar SIGIES sin sorpresas. ¡A copiar y a disfrutar!_
