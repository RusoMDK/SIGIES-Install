---

## title: "SIGIES – Guía de Instalación y Configuración"

# 🚀 SIGIES – Guía Completa de Instalación y Configuración

> **Bienvenido a SIGIES!**
> Esta guía “todo en uno” te permitirá desplegar SIGIES en cualquier entorno Linux, macOS o Windows usando repositorios UCI para ahorrar megas y acelerar descargas.

---

## 🗂️ Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configurar Repositorios UCI (Linux)](#configurar-repositorios-uci-linux)
3. [Instalación de Docker & Docker Compose](#instalación-de-docker--docker-compose)
4. [Configurar el Daemon de Docker (red UCI)](#configurar-el-daemon-de-docker-red-uci)
5. [Verificar “Hello World”](#verificar-hello-world)
6. [Clonar y Levantar SIGIES](#clonar-y-levantar-sigies)
7. [Restauración de Base de Datos](#restauración-de-base-de-datos)

   - [Script `pg_restore.sh`](#script-pg_restoresh)

8. [Variables de Entorno (`.env`)](#variables-de-entorno-env)
9. [Gestión de Usuarios Symfony](#gestión-de-usuarios-symfony)
10. [Solución de Problemas Frecuentes](#solución-de-problemas-frecuentes)
11. [Configuración de PHPStorm](#configuración-de-phpstorm)
12. [Recursos & Contacto](#recursos--contacto)

---

## 🔧 Requisitos Previos

- **SO soportados**

  - **Linux**: Ubuntu 20.04+, Debian 11, CentOS 8
  - **macOS** (Catalina+), **Windows** 10/11

- **Herramientas**

  - Docker 20.10+ & Docker Compose
  - PHP 7.4+ (CLI, mbstring, xml)
  - Symfony CLI (opcional)
  - Git
  - SSH con permisos `sudo` (servidores remotos)

---

## ⚙️ Configurar Repositorios UCI (Linux)

> Ahorra ancho de banda usando los mirrors internos de la UCI.

### Ubuntu / Debian

Crea `/etc/apt/sources.list.d/uci.list` con:

```text
deb http://mirrors.uci.cu/ubuntu/ focal main restricted universe multiverse
deb http://mirrors.uci.cu/ubuntu/ focal-updates main restricted universe multiverse
deb http://mirrors.uci.cu/ubuntu/ focal-security main restricted universe multiverse
```

```bash
sudo apt update
```

### CentOS 8

Crea `/etc/yum.repos.d/uci.repo`:

```ini
[uci-base]
name=UCI Base
baseurl=http://mirrors.uci.cu/centos/8/os/$basearch/
enabled=1
gpgcheck=0
```

```bash
sudo yum makecache
```

---

## 🐳 Instalación de Docker & Docker Compose

### Linux (tras configurar repos UCI)

```bash
sudo apt install -y docker.io docker-compose    # Ubuntu/Debian
# o
sudo yum install -y docker docker-compose       # CentOS

sudo systemctl enable --now docker
```

### macOS

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install --cask docker
brew install php@7.4 symfony-cli/tap/symfony-cli
open /Applications/Docker.app
```

### Windows

1. Instala [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/).
2. En PowerShell (admin):

   ```powershell
   choco install php --version=7.4
   ```

3. Instala Symfony CLI desde [https://symfony.com/download](https://symfony.com/download)

---

## 🛠️ Configurar el Daemon de Docker (red UCI)

Edita (o crea) `/etc/docker/daemon.json`:

```json
{
  "dns": ["10.0.0.2", "10.0.0.3", "10.0.0.4", "8.8.8.8"],
  "dns-search": ["uci.cu"],
  "insecure-registries": ["docker.prod.uci.cu"],
  "registry-mirrors": ["https://docker.prod.uci.cu"]
}
```

Si da error JSON, valida con:

```bash
sudo cat /etc/docker/daemon.json | jq .
```

Reinicia:

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

---

## ✅ Verificar “Hello World”

```bash
docker pull docker.prod.uci.cu/docker-all/hello-world
docker run --rm hello-world
```

Debes ver **“Hello from Docker!”**.

---

## 📥 Clonar y Levantar SIGIES

```bash
git clone -b <rama> https://gitlab.prod.uci.cu/fortes/SIGIES.git
cd SIGIES
docker-compose up -d
```

Abre `http://localhost:5800` y confirma que carga. _(Si estás en UCI, verifica acceso a `_.uci.cu`.)\*

---

## 💾 Restauración de Base de Datos

### Script `pg_restore.sh`

Guarda como `pg_restore.sh` y haz ejecutable (`chmod +x pg_restore.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

CONTAINER="sigies_postgres"
DB="sigies-backup"
BACKUP="./backups/backup.sql"
USER="postgres"
PASS="postgres"

echo "✅ Restaurando [${DB}] en ${CONTAINER}..."
docker cp "${BACKUP}" "${CONTAINER}":/tmp/backup.sql

docker exec -e PGPASSWORD="${PASS}" -it "${CONTAINER}" \
  psql -U "${USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB};" \
  && psql -U "${USER}" -d postgres -c "CREATE DATABASE ${DB};"
docker exec -e PGPASSWORD="${PASS}" -it "${CONTAINER}" \
  psql -U "${USER}" -d "${DB}" -f /tmp/backup.sql

echo "🎉 Base de datos '${DB}' lista."
```

Ejecuta:

```bash
./pg_restore.sh
```

---

## ⚙️ Variables de Entorno (`.env`)

Crea/edita `./.env`:

```dotenv
POSTGRES_HOST=localhost
POSTGRES_PORT=5465
POSTGRES_DB=sigies-backup
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

SDR_CONNECTION_DATABASE_NAME=sigies-backup
SDR_CONNECTION_HOST=localhost
```

_(Puedes copiar `.env.example` si existe.)_

---

## 👤 Gestión de Usuarios Symfony

```bash
docker exec -it sigies_app bash
php bin/console fos:user:change-password
```

---

## 🛠️ Solución de Problemas Frecuentes

| Síntoma                        | Causa posible              | Solución rápida                         |
| ------------------------------ | -------------------------- | --------------------------------------- |
| `docker-compose` no encontrado | PATH o versión             | Usa `docker compose up -d`              |
| JSON inválido en daemon.json   | Sintaxis                   | Valida con `jq`, corrige comillas       |
| Permiso denegado al restaurar  | Credenciales en script     | Revisa `USER`/`PASS` en `pg_restore.sh` |
| Symfony no encuentra comandos  | Dependencias no instaladas | `composer install` + `php bin/console`  |
| El sitio no carga              | Contenedor falló           | `docker-compose logs app`               |

---

## 💡 Configuración de PHPStorm

1. Descarga PHPStorm 2023.1.6 (tar.gz).
2. Reemplaza `phpstormv64.options` en `/bin`.
3. Activa con el código de la UCI.
4. En PHPStorm:

   - **CLI Interpreter**: apunta a tu PHP local
   - **Path Mappings**:

     ```
     /ruta/local/SIGIES → /var/www/html/SIGIES
     ```

5. Instala Firebug (o Firefox Dev) y habilita el debug (escarabajo).

---

## 📖 Recursos & Contacto

- 🌐 [Docker Docs](https://docs.docker.com/)
- 🐘 [PostgreSQL Docs](https://www.postgresql.org/docs/)
- 🕸️ [Symfony Docs](https://symfony.com/doc/current)
- 🤝 **Soporte SIGIES**

  - Email: `sigies-dev@empresa.com`
  - Slack: `#sigies-dev`

---

_¡Todo listo para copiar, pegar y desplegar SIGIES sin sorpresas!_
