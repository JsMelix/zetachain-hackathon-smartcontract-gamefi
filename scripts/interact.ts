import { ethers } from "hardhat";

async function main() {
  console.log("🎮 Interactuando con el contrato del juego...");

  // Direcciones del contrato (reemplazar con las direcciones reales después del despliegue)
  const GAME_CONTRACT_ADDRESS = "0x..."; // Reemplazar con dirección real
  const GAME_TOKEN_ADDRESS = "0x...";    // Reemplazar con dirección real
  const GAME_NFT_ADDRESS = "0x...";     // Reemplazar con dirección real

  // Obtener signers
  const [owner, player1, player2] = await ethers.getSigners();
  console.log(`👤 Owner: ${owner.address}`);
  console.log(`🎮 Player 1: ${player1.address}`);
  console.log(`🎮 Player 2: ${player2.address}`);

  // Conectar al contrato
  const gameContract = await ethers.getContractAt("GameContract", GAME_CONTRACT_ADDRESS);
  const gameToken = await ethers.getContractAt("GameToken", GAME_TOKEN_ADDRESS);
  const gameNFT = await ethers.getContractAt("GameNFT", GAME_NFT_ADDRESS);

  console.log("\n🎯 Iniciando interacciones del juego...");

  try {
    // 1. Registrar jugador 1
    console.log("\n📝 Registrando Player 1...");
    const tx1 = await gameContract.connect(player1).registerPlayer();
    await tx1.wait();
    console.log("✅ Player 1 registrado exitosamente");

    // 2. Verificar balance inicial
    const balance1 = await gameToken.balanceOf(player1.address);
    console.log(`💰 Balance inicial de Player 1: ${balance1} GTK`);

    // 3. Mint de personaje
    console.log("\n🖼️  Mint de personaje para Player 1...");
    const tx2 = await gameContract.connect(player1).mintCharacter(
      "TestWarrior",
      "Warrior",
      "ipfs://QmTestWarriorImage"
    );
    await tx2.wait();
    console.log("✅ Personaje mintado exitosamente");

    // 4. Verificar información del jugador
    const playerInfo = await gameContract.getPlayerInfo(player1.address);
    console.log(`📊 Player 1 - Nivel: ${playerInfo.player.level}, Exp: ${playerInfo.player.experience}`);
    console.log(`⚔️  Personaje: ${playerInfo.character.name} (${playerInfo.character.characterClass})`);

    // 5. Realizar acciones del juego
    console.log("\n⛏️  Realizando minería...");
    const tx3 = await gameContract.connect(player1).mine();
    await tx3.wait();
    console.log("✅ Minería completada");

    // 6. Verificar recompensas
    const balanceAfterMining = await gameToken.balanceOf(player1.address);
    const newPlayerInfo = await gameContract.getPlayerInfo(player1.address);
    console.log(`💰 Balance después de minería: ${balanceAfterMining} GTK`);
    console.log(`📈 Nueva experiencia: ${newPlayerInfo.player.experience}`);

    // 7. Realizar batalla
    console.log("\n⚔️  Iniciando batalla...");
    // Esperar cooldown
    await ethers.provider.send("evm_increaseTime", [301]);
    await ethers.provider.send("evm_mine", []);
    
    const tx4 = await gameContract.connect(player1).battle();
    await tx4.wait();
    console.log("✅ Batalla completada");

    // 8. Verificar items obtenidos
    const finalPlayerInfo = await gameContract.getPlayerInfo(player1.address);
    console.log(`🎒 Items del jugador: ${finalPlayerInfo.player.items.join(", ")}`);

    // 9. Comprar un item
    console.log("\n🛒 Comprando item...");
    const items = await gameContract.getAllItems();
    if (items.length > 0) {
      const itemToBuy = items[0];
      console.log(`🛍️  Comprando: ${itemToBuy.name} por ${itemToBuy.price} GTK`);
      
      const tx5 = await gameContract.connect(player1).buyItem(1);
      await tx5.wait();
      console.log("✅ Item comprado exitosamente");
    }

    // 10. Verificar log de actividades
    console.log("\n📋 Log de actividades del Player 1:");
    const activityLogs = await gameContract.getPlayerActivityLogs(player1.address);
    activityLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.message} - ${new Date(Number(log.timestamp) * 1000).toLocaleString()}`);
    });

    // 11. Registrar Player 2 y hacer algunas interacciones
    console.log("\n📝 Registrando Player 2...");
    const tx6 = await gameContract.connect(player2).registerPlayer();
    await tx6.wait();
    console.log("✅ Player 2 registrado exitosamente");

    // 12. Mostrar estadísticas finales
    console.log("\n🎯 ESTADÍSTICAS FINALES");
    console.log("=" * 50);
    
    const player1Final = await gameContract.getPlayerInfo(player1.address);
    const player2Final = await gameContract.getPlayerInfo(player2.address);
    
    console.log(`👤 Player 1: Nivel ${player1Final.player.level}, ${player1Final.player.experience} exp, ${await gameToken.balanceOf(player1.address)} GTK`);
    console.log(`👤 Player 2: Nivel ${player2Final.player.level}, ${player2Final.player.experience} exp, ${await gameToken.balanceOf(player2.address)} GTK`);
    
    const totalSupply = await gameToken.totalSupply();
    console.log(`🪙 Total supply de GTK: ${totalSupply}`);
    
    console.log("=" * 50);

  } catch (error) {
    console.error("❌ Error durante la interacción:", error);
  }
}

// Función para mostrar información del contrato
async function showContractInfo() {
  console.log("\n📋 INFORMACIÓN DEL CONTRATO");
  console.log("=" * 40);
  
  try {
    const gameContract = await ethers.getContractAt("GameContract", "0x..."); // Reemplazar con dirección real
    
    const miningReward = await gameContract.MINING_REWARD();
    const battleReward = await gameContract.BATTLE_REWARD();
    const questReward = await gameContract.QUEST_REWARD();
    const levelUpExp = await gameContract.LEVEL_UP_EXPERIENCE();
    const actionCooldown = await gameContract.ACTION_COOLDOWN();
    
    console.log(`⛏️  Recompensa de minería: ${miningReward} GTK`);
    console.log(`⚔️  Recompensa de batalla: ${battleReward} GTK`);
    console.log(`🎯 Recompensa de misión: ${questReward} GTK`);
    console.log(`📈 Experiencia para subir de nivel: ${levelUpExp}`);
    console.log(`⏱️  Cooldown de acciones: ${actionCooldown} segundos`);
    
    const items = await gameContract.getAllItems();
    console.log(`🛒 Items disponibles: ${items.length}`);
    items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - ${item.price} GTK (${item.rarity === 0 ? 'Common' : item.rarity === 1 ? 'Uncommon' : item.rarity === 2 ? 'Rare' : item.rarity === 3 ? 'Epic' : 'Legendary'})`);
    });
    
  } catch (error) {
    console.error("❌ Error al obtener información del contrato:", error);
  }
}

// Función principal
async function run() {
  const command = process.argv[2];
  
  switch (command) {
    case "info":
      await showContractInfo();
      break;
    case "play":
      await main();
      break;
    default:
      console.log("🎮 Script de interacción del juego");
      console.log("Uso:");
      console.log("  npm run interact:info  - Mostrar información del contrato");
      console.log("  npm run interact:play  - Ejecutar interacciones del juego");
      break;
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

