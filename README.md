<p align="center">
  <img src="https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fmagemuse.png?alt=media&token=ca22149d-59a3-4e23-8ee0-a41f2147d025" width="20%" alt="MAGEMUSE-DISCORDBOT-logo">
</p>
<p align="center">
    <h1 align="center">MageMuse</h1>
</p>
<p align="center">
    <em><code>❯ DiscordBot</code></em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/saturnette/MageMuse-DiscordBot?style=flat&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/saturnette/MageMuse-DiscordBot?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/saturnette/MageMuse-DiscordBot?style=flat&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/saturnette/MageMuse-DiscordBot?style=flat&color=0080ff" alt="repo-language-count">
</p>
<p align="center">
		<em>Built with the tools and technologies:</em>
</p>
<p align="center">
	<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black" alt="JavaScript">
	<img src="https://img.shields.io/badge/sharp-99CC00.svg?style=flat&logo=sharp&logoColor=white" alt="sharp">
	<img src="https://img.shields.io/badge/Axios-5A29E4.svg?style=flat&logo=Axios&logoColor=white" alt="Axios">
	<img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=flat&logo=ESLint&logoColor=white" alt="ESLint">
	<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" alt="JSON">
</p>

<br>

---


##  Estructura

```sh
└── MageMuse-DiscordBot/
    ├── LICENSE
    ├── README.md
    ├── eslint.config.js
    ├── index.js
    ├── keep_alive.js
    ├── package.json
    └── src
        ├── commands
        ├── config
        ├── font
        ├── jobs
        ├── middlewares
        ├── models
        ├── scripts
        └── utils
```

---


## Comandos
- [Comandos de Administrador](#comandos-de-administrador)
  - [set-channel](#set-channel)
  - [set-role](#set-role)
  - [set-elo](#set-elo)
  - [set-gym-leader](#set-gym-leader)
  - [ban-ladder](#ban-ladder)
  - [unban-ladder](#unban-ladder)
- [Comandos de Líder](#comandos-de-líder)
  - [set-badge](#set-badge)
  - [set-win-leader](#set-win-leader)
- [Comandos de Alto Mando](#comandos-de-alto-mando)
  - [set-win-elite](#set-win-elite)
- [Comandos de Usuario](#comandos-de-usuario)
  - [set-pokemon](#set-pokemon)
  - [remove-pokemon](#remove-pokemon)
  - [register-team](#register-team)
  - [set-ladder-result](#set-ladder-result)
  - [log-leader](#log-leader)
  - [showdown-nick](#showdown-nick)
  - [profile](#profile)
  - [leaderboard](#leaderboard)


---

## Comandos de Administrador

---

### `/set-channel`
**Descripción**: Configura el ID de un canal específico.

- **Opciones:**
  - **channeltype** (requerido): El tipo de canal a configurar. Opciones:
    - `log`
    - `register`
    - `lobby`
    - `ladder`
  - **channel** (requerido): El canal a configurar.
- **Funcionalidad:**
  - Actualiza el tipo de canal especificado con el ID del canal proporcionado.
  - Crea una nueva entrada si el tipo de canal o el canal no existen.
- **Permisos:** Solo administradores.

---

### `/set-role`
**Descripción**: Configura el ID de un rol específico.

- **Opciones:**
  - **roletype** (requerido): El tipo de rol a configurar. Opciones:
    - `leader`
    - `elite`
  - **role** (requerido): El rol a configurar.
- **Funcionalidad:**
  - Actualiza el tipo de rol especificado con el ID del rol proporcionado.
  - Crea una nueva entrada si el tipo de rol o el rol no existen.
- **Permisos:** Solo administradores.

---

### `/set-elo`
**Descripción**: Establece el ELO (rating) de un usuario.

- **Opciones:**
  - **usuario** (requerido): El usuario al que se le establecerá el ELO.
  - **elo** (requerido): El nuevo valor de ELO.
- **Funcionalidad:**
  - Actualiza el ELO del usuario especificado en la base de datos.
  - Mensaje adecuado si el usuario no existe o el ELO no se proporciona.
- **Permisos:** Solo administradores.


---

### `/set-gym-leader`
**Descripción**: Asigna un tipo y un nombre de medalla a un usuario.

- **Opciones:**
  - **user** (requerido): El usuario al que se le asignará la medalla.
  - **badgetype** (requerido): El tipo de medalla a asignar.
  - **badgename** (requerido): El nombre de la medalla a asignar.
- **Funcionalidad:**
  - Asigna una medalla al usuario especificado y actualiza su perfil en la base de datos.
  - Responde con un mensaje confirmando la asignación de la medalla.
- **Permisos:** Solo administradores.

---


### `/ban-ladder`
**Descripción**: Banea a un usuario para que no pueda recibir desafíos.

- **Opciones:**
  - **user** (requerido): El usuario a banear.
- **Funcionalidad:**
  - Banea al usuario configurando su campo `allowChallenges` a `false`.
  - Mensaje adecuado si el usuario no existe o ya está baneado.
- **Permisos:** Solo administradores.

---


### `/unban-ladder`
**Descripción**: Desbanea a un usuario para que pueda recibir desafíos.

- **Opciones:**
  - **user** (requerido): El usuario a desbanear.
- **Funcionalidad:**
  - Desbanea al usuario configurando su campo `allowChallenges` a `true`.
  - Mensaje adecuado si el usuario no existe o ya está desbaneado.
- **Permisos:** Solo administradores.



---



## Comandos de Líder

### `/set-badge`
**Descripción**: ¡Otorga una medalla a un entrenador!

- **Opciones:**
  - **user** (requerido): El usuario que recibirá la medalla.
- **Funcionalidad:**
  - Verifica el perfil del usuario y si está registrado en la liga.
  - Verifica que el usuario haya realizado menos de dos intentos en el día.
  - Otorga una medalla y actualiza el perfil del líder.
  - Otorga tickets adicionales si el usuario obtiene la medalla número 8 o 10.
- **Permisos:** Solo para usuarios con el rol de líder.
- **Canal:** Solo en el canal de registro especificado.

---

### `/set-win-leader`
**Descripción**: ¡Registra una victoria!

- **Opciones:**
  - **user** (requerido): El usuario que ha perdido.
- **Funcionalidad:**
  - Verifica el perfil del usuario y si está registrado en la liga.
  - Verifica que el usuario haya realizado menos de dos intentos en el día.
  - Registra la victoria del líder y actualiza el perfil del usuario perdedor.
- **Permisos:** Solo para usuarios con el rol de líder.
- **Canal:** Solo en el canal de registro especificado.

---

## Comandos de Alto Mando

### `/set-win-elite`
**Descripción**: ¡Registra una victoria del alto mando!

- **Opciones:**
  - **user** (requerido): El usuario que ha perdido.
- **Funcionalidad:**
  - Verifica el perfil del usuario, registro en la liga y si tiene intentos disponibles (`tryEF`).
  - Reduce los intentos y guarda los cambios en la base de datos.
  - Envía un mensaje confirmando la derrota y el gasto de un boleto.
- **Permisos:** Solo para usuarios con el rol de alto mando.
- **Canal:** Solo en el canal de registro especificado.

---

## Comandos de Usuario

### `/set-pokemon`
**Descripción**: ¡Añade un Pokémon a tu equipo!

- **Funcionalidad:**
  - Agrega un nuevo Pokémon al equipo del usuario si no está registrado en la liga.
  - Verifica que el Pokémon exista utilizando la API de PokéAPI.
  - Verifica que el equipo del usuario no exceda el límite de 12 Pokémon.
  - Actualiza el equipo del usuario en la base de datos.
  - Responde con un mensaje de confirmación y el nuevo equipo del usuario.

- **Solo puede ser usado en el canal lobby configurado con el comando set-channel.**

---

### `/remove-pokemon`
**Descripción**: ¡Remueve un Pokémon de tu equipo!

- **Funcionalidad:**
  - Elimina un Pokémon del equipo del usuario si no está registrado en la liga.
  - Verifica que el Pokémon a eliminar esté en el equipo del usuario.
  - Actualiza el equipo del usuario en la base de datos.
  - Responde con un mensaje de confirmación y el nuevo equipo del usuario.

- **Solo puede ser usado en el canal lobby configurado con el comando set-channel.**

---

### `/register-team`
**Descripción**: Registra tu equipo de Pokémon para participar en la liga.

- **Funcionalidad:**
  - Verifica si el usuario ya está registrado o si tiene un equipo de Pokémon.
  - Envía la información del equipo del usuario a un canal de registro específico en Discord.
  - Marca al usuario como registrado en la base de datos.

- **Solo puede ser usado en el canal lobby configurado con el comando set-channel.**

---

### `/set-ladder-result`
**Descripción**: ¡Registra el resultado de la batalla!

- **Funcionalidad:**
  - Registra el resultado de una batalla entre dos usuarios especificando un ganador y un perdedor.
  - Verifica que el enlace de la repetición sea válido y que el ganador y el perdedor no sean la misma persona.
  - Actualiza el Elo de ambos usuarios en función del resultado.
  - Publica un mensaje en Discord con los detalles del resultado, incluyendo el cambio de Elo y un enlace a la repetición.

- **Opciones:**
  - **ganador** (requerido): El usuario ganador de la batalla.
  - **perdedor** (requerido): El usuario perdedor de la batalla.
  - **replay** (requerido): El enlace de la repetición de la batalla en Showdown.

- **Solo puede ser usado en el canal de ladder configurado con el comando `set-channel`.**

---

### `/log-leader`
**Descripción**: Muestra el rendimiento de los líderes de gimnasio.

- **Funcionalidad:**
  - Obtiene y muestra una lista de los líderes de gimnasio con sus respectivos rendimientos en batallas (ganadas y perdidas).
  - Ordena a los líderes por el total de batallas (ganadas + perdidas) en orden descendente.
  - Publica un mensaje en Discord con el rendimiento de cada líder.


- **Este comando no tiene ninguna restriccioń de rol o canal.**

---

### `/showdown-nick`
**Descripción**: Ingresa tu nick de Showdown para que puedas ser retado por otros entrenadores.

- **Funcionalidad:**
  - Actualiza el nick de Showdown del usuario en la base de datos.
  - Responde con un mensaje de confirmación que muestra el nuevo nick de Showdown del usuario.

- **Este comando no tiene ninguna restriccioń de rol o canal.**

---

### `/profile`
**Descripción**: Obtiene información de un entrenador.

<p align="center">
  <img src="https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fscreen02.jpg?alt=media&token=907ec3ac-d657-42e8-82ec-3e159458fc55" width="50%" alt="profile-command">
</p>

- **Funcionalidad:**
  - Muestra información del perfil del usuario, incluyendo medallas obtenidas y Pokémon en el equipo.
  - Crea una imagen personalizada del perfil usando `canvas`.
  - Guarda la imagen en Google Cloud Storage y la muestra en un mensaje embed en Discord.

- **Este comando no tiene ninguna restriccioń de rol o canal.**

---

### `/leaderboard`
**Descripción**: Obtiene la tabla de clasificación del servidor.

<p align="center">
  <img src="https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fscreen01.png?alt=media&token=2872b153-34a2-480f-87b0-d52695c00254" width="50%" alt="profile-command">
</p>

- **Funcionalidad:**
  - Obtiene los 10 usuarios con mayor puntaje de ELO.
  - Crea una imagen de la tabla de clasificación usando `canvas`.
  - Guarda la imagen en Google Cloud Storage y la muestra en un mensaje embed en Discord.

- **Este comando no tiene ninguna restriccioń de rol o canal.**

---

## Nota

Si tienes alguna sugerencia, mejora o simplemente quieres que te explique algo, no dudes en abrir un issue o enviar un pull request. ¡Agradeceré tu contribución!

---