# 🚀 Guía Completa de Instalación y Configuración SIGIES

Esta guía ofrece instrucciones detalladas para instalar y configurar SIGIES en diferentes plataformas (Linux, Windows y macOS) usando Docker y PHPStorm.

---

## 📦 Requisitos previos

### 🔸 Sistemas Operativos compatibles

- **Linux**: Ubuntu 20.04+, Debian 11, CentOS 8
- **Windows**: 10 y 11
- **macOS**: Ventura o superior

### 🔸 Software necesario

- Docker (v20.10+)
- Docker Compose
- PHPStorm (v2023.1.6)
- Symfony CLI (PHP 7.4+)

### 🔸 Acceso requerido

- Permisos administrativos (sudo en Linux y macOS)
- Conexión VPN o red con acceso al dominio `uci.cu`

---

## 🛠 Instalación Docker

### Linux

```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo touch /etc/docker/daemon.json
```

### macOS

```bash
brew install docker docker-compose
```

### Windows

Descarga Docker Desktop desde [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/) y sigue las instrucciones del instalador.

---

## ✅ Configuración Docker (Multiplataforma)

**Editar archivo:** `/etc/docker/daemon.json`

```json
{
  "dns": ["10.0.0.2", "10.0.0.3", "10.0.0.4", "8.8.8.8"],
  "dns-search": ["uci.cu"],
  "insecure-registries": ["docker.prod.uci.cu"],
  "registry-mirrors": ["https://docker.prod.uci.cu"]
}
```

Reiniciar Docker:

- Linux y macOS:

```bash
sudo systemctl daemon-reload
sudo service docker restart
```

- Windows: Reiniciar Docker Desktop manualmente.

---

## 🚧 Clonación y ejecución del proyecto SIGIES

1. **Clonar el repositorio**:

```bash
git clone -b <rama> https://gitlab.prod.uci.cu/fortes/SIGIES.git
```

2. **Levantar contenedores** (dentro del directorio del proyecto):

```bash
docker-compose up -d
```

3. **Verificar sitio web**:

Abrir navegador y visitar: `http://localhost:5800`

---

## 🔧 Restauración y configuración PostgreSQL

1. **Mover y descomprimir backup:**

```bash
mv nombreFichero.tar /PGADMIN/pgadmin_data/storage/pgadmin2_uci.cu/
cd /PGADMIN/pgadmin_data/storage/pgadmin2_uci.cu/
gzip -d nombreFichero.tar
```

Esto generará un fichero `.sql`.

2. **Editar y ejecutar script de restauración:**

```bash
nano pg_restore.sh
```

Editar variables:

```bash
POSTGRES_DB="sigies-backup"
BACKUP_FILE="nuevo_nombre_backup.sql"
POSTGRES_HOST="172.18.0.2"
```

Ejecutar:

```bash
sh pg_restore.sh
```

Luego actualizar los cambios en el archivo `.env`:

```env
POSTGRES_PORT=5465
POSTGRES_HOST=localhost
POSTGRES_DB=sigies-backup
SDR_CONNECTION_DATABASE_NAME=sigies-backup
SDR_CONNECTION_HOST="IP_DE_LA_PC"
```

3. **Actualizar la contraseña del usuario:**

```bash
docker exec -it sigies_app bash
php app/console fos:user:change-password
```

Salir con `Ctrl+C` o `Ctrl+D`.

---

## 🛠 Configuración IDE PHPStorm

1. Descargar PHPStorm v2023.1.6 ([sitio oficial](https://www.jetbrains.com/phpstorm/)).
2. Descomprimir y reemplazar el fichero `phpstorm64.options` en la carpeta `bin` con el proporcionado.
3. Editar última línea del fichero con ruta específica hacia carpeta del activador proporcionado.
4. Activar con código en "Activation Code" usando el archivo proporcionado.

### Configuración CLI PHPStorm

- Abrir `File > Settings > PHP`.
- Añadir nuevo CLI interpreter usando VPN (datos móviles).
- En Path Mappings mapear:

```plaintext
/var/www/html/SIGIES
```

---

## ⚠️ Manejo de Errores y Soluciones

- **Problemas Docker**:

  - Verifica servicio Docker activo (`systemctl status docker`).
  - Reinicia Docker si da problemas de conexión.

- **Errores PostgreSQL**:

  - Verifica que el contenedor PostgreSQL esté activo.
  - Ejecuta:

```bash
docker inspect sigies_postgres | grep IPAddress
```

- **Errores reportes Symfony**:

  - Entra al contenedor y ejecuta:

```bash
docker exec -it sigies_app bash
php app/console -s
cache:clear
sigies:reinstall-report:sdr
docker-compose down
sudo chmod 777 -R *
```

---

## 🔍 Configuración adicional

**Persistence.xml:**

```xml
<property name="javax.persistence.jdbc.url" value="jdbc:postgresql://IP_DE_LA_PC:5465/sdr"/>
```

- Actualizar en PGAdmin en `sys_user` la columna `subred` con la IP del contenedor obtenida mediante:

```bash
docker inspect nombre_del_contenedor
```

---

## 📝 Recomendaciones finales

- Usa VPN al configurar la red.
- Mantén actualizado Docker y PHPStorm.
- Informa de problemas o mejoras a tu equipo de desarrollo.

¡Ahora tienes un entorno completamente configurado y listo para desarrollar con SIGIES!
