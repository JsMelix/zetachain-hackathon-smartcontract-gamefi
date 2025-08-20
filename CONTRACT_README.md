# 🎮 Contrato Inteligente del Juego - ZetaChain

Este es un contrato inteligente completo para un juego blockchain desplegado en ZetaChain. Implementa un sistema de juego con tokens, NFTs, personajes y acciones del jugador.

## 🏗️ Arquitectura del Contrato

### Contratos Principales

1. **GameContract** - Contrato principal del juego
2. **GameToken** - Token ERC20 del juego (GTK)
3. **GameNFT** - Contrato ERC721 para personajes del juego

### Características del Juego

- ✅ Sistema de registro de jugadores
- ✅ Mint de personajes NFT con stats únicos
- ✅ Sistema de tokens in-game (GTK)
- ✅ Acciones del juego: Minería, Batallas, Misiones
- ✅ Sistema de experiencia y niveles
- ✅ Sistema de items y tienda
- ✅ Log de actividades del jugador
- ✅ Cooldown de acciones para prevenir spam
- ✅ Sistema de recompensas basado en nivel

## 🚀 Despliegue

### Prerrequisitos

1. **Node.js** (versión 18 o superior)
2. **Wallet con ZETA** para gas fees
3. **Clave privada** de la wallet

### Instalación

```bash
# Instalar dependencias
npm install

# Crear archivo .env
cp env.example .env
# Editar .env con tu clave privada
```

### Configuración

Edita el archivo `.env`:

```env
PRIVATE_KEY=tu_clave_privada_sin_0x
ZETASCAN_API_KEY=tu_api_key_opcional
REPORT_GAS=true
```

### Compilación

```bash
# Compilar contratos
npm run compile
```

### Despliegue

#### Testnet (Athens 3)
```bash
npm run deploy:testnet
```

#### Mainnet
```bash
npm run deploy:mainnet
```

#### Red Local (Hardhat)
```bash
npm run deploy:local
```

## 🧪 Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas específicas
npx hardhat test test/GameContract.test.ts
```

## 📋 Funciones del Contrato

### Para Jugadores

#### Registro
- `registerPlayer()` - Registra un nuevo jugador

#### Personajes
- `mintCharacter(name, class, imageURI)` - Mina un personaje NFT

#### Acciones del Juego
- `mine()` - Realiza minería para ganar tokens y experiencia
- `battle()` - Participa en batallas para recompensas
- `completeQuest()` - Completa misiones para recompensas especiales

#### Tienda
- `buyItem(itemId)` - Compra items con tokens del juego

### Para Consultas

- `getPlayerInfo(address)` - Obtiene información completa del jugador
- `getPlayerActivityLogs(address)` - Obtiene log de actividades
- `getAllItems()` - Lista todos los items disponibles

### Para el Owner

- `emergencyWithdraw()` - Retira fondos de emergencia

## 🎯 Sistema de Recompensas

| Acción | Recompensa Base | Bonus por Nivel |
|--------|----------------|-----------------|
| Minería | 10 GTK | +2 GTK por nivel |
| Batalla | 25 GTK | +2 GTK por nivel |
| Misión | 50 GTK | +2 GTK por nivel |

## ⚡ Cooldowns y Límites

- **Cooldown de acciones**: 5 minutos entre acciones
- **Tokens iniciales**: 100 GTK al registrarse
- **Costo de personaje**: 50 GTK
- **Experiencia para subir de nivel**: 100 × nivel actual

## 🛡️ Características de Seguridad

- **ReentrancyGuard** - Previene ataques de reentrancy
- **Ownable** - Control de acceso para funciones administrativas
- **Validaciones** - Verificaciones exhaustivas de parámetros
- **Cooldowns** - Prevención de spam y exploits

## 🔗 Redes Soportadas

### Testnet
- **Nombre**: ZetaChain Athens 3
- **Chain ID**: 7001
- **RPC**: https://rpc.ankr.com/zeta_testnet_athens_3
- **Explorador**: https://explorer.athens3.zetachain.com

### Mainnet
- **Nombre**: ZetaChain
- **Chain ID**: 7000
- **RPC**: https://rpc.ankr.com/zeta
- **Explorador**: https://explorer.zetachain.com

## 📊 Gas Optimization

- **Optimizador Solidity**: Habilitado con 200 runs
- **Versión Solidity**: 0.8.19 (última versión estable)
- **Libraries**: OpenZeppelin (auditadas y seguras)

## 🎨 Personalización

### Modificar Recompensas
```solidity
uint256 public constant MINING_REWARD = 10;    // Cambiar valor
uint256 public constant BATTLE_REWARD = 25;    // Cambiar valor
uint256 public constant QUEST_REWARD = 50;     // Cambiar valor
```

### Añadir Nuevos Items
```solidity
function _initializeGameItems() internal {
    _addItem("Nuevo Item", "Descripción", 0, 1, 30, 75, true);
}
```

### Modificar Stats de Personajes
```solidity
function _generateCharacterStats(string memory characterClass) internal pure returns (...) {
    // Añadir nuevas clases o modificar stats existentes
}
```

## 🚨 Solución de Problemas

### Error: "Insufficient funds for gas"
- Asegúrate de tener ZETA en tu wallet para gas fees

### Error: "Player not registered"
- Ejecuta `registerPlayer()` antes de otras funciones

### Error: "Action on cooldown"
- Espera 5 minutos entre acciones o modifica `ACTION_COOLDOWN`

### Error de compilación
- Verifica que tienes Node.js 18+ y las dependencias instaladas

## 📞 Soporte

- **Issues**: Crear issue en el repositorio
- **Documentación**: [ZetaChain Docs](https://docs.zetachain.com/)
- **Comunidad**: [ZetaChain Discord](https://discord.gg/zetachain)

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

**⚠️ Importante**: Este contrato está diseñado para propósitos educativos y de desarrollo. Realiza auditorías de seguridad antes de usar en producción.

