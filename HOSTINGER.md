# IBEMACASA: ejecución local y futura publicación

## En la laptop con Docker

Requisitos: Docker Desktop abierto.

```powershell
cd D:\IBEMA_CASA
docker compose up --build -d
```

Abrir `http://localhost:3000`. Los datos locales se guardan en el volumen
`ibemacasa_data`, por lo que no se pierden al reiniciar el contenedor.

Para ver el estado:

```powershell
docker compose ps
docker compose logs -f ibemacasa
```

Para detenerlo sin borrar los datos:

```powershell
docker compose down
```

No usar `docker compose down -v` en una instalación con datos reales: `-v`
elimina el volumen de la base local.

## Preparación para Hostinger

Este contenedor requiere un plan **VPS de Hostinger** con Docker; el hosting
compartido común no ejecuta contenedores. La secuencia prevista es:

1. Crear el VPS y apuntar un subdominio, por ejemplo `fabrica.ibemacasa.com`.
2. Instalar Docker y copiar/clonar este proyecto.
3. Ejecutar `docker compose up --build -d`.
4. Configurar el proxy HTTPS del VPS hacia el puerto 3000.
5. Crear copias de seguridad periódicas del volumen `ibemacasa_data`.
6. Antes de habilitar usuarios reales, activar autenticación y permisos de
   servidor para Almacén, Caja y Gerencia.

Para una operación con varias sucursales o más de un servidor, la base local
debe migrarse a PostgreSQL administrado. Para una sola fábrica y una sola
instancia, el volumen persistente es suficiente para la etapa piloto.
