import { ethers } from "hardhat";
import { verify } from "./verify";

async function main() {
  console.log("🚀 Iniciando despliegue del contrato del juego en ZetaChain...");

  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Desplegando desde la cuenta: ${deployer.address}`);
  console.log(`💰 Balance de la cuenta: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ZETA`);

  // Desplegar el contrato principal del juego
  console.log("\n🎮 Desplegando GameContract...");
  const GameContract = await ethers.getContractFactory("GameContract");
  const gameContract = await GameContract.deploy();
  await gameContract.waitForDeployment();

  const gameContractAddress = await gameContract.getAddress();
  console.log(`✅ GameContract desplegado en: ${gameContractAddress}`);

  // Obtener las direcciones de los contratos de tokens
  const gameTokenAddress = await gameContract.gameToken();
  const gameNFTAddress = await gameContract.gameNFT();

  console.log(`🪙 GameToken desplegado en: ${gameTokenAddress}`);
  console.log(`🖼️  GameNFT desplegado en: ${gameNFTAddress}`);

  // Verificar el contrato en el explorador (solo en testnet/mainnet)
  const network = await ethers.provider.getNetwork();
  if (network.chainId === 7001n || network.chainId === 7000n) {
    console.log("\n🔍 Verificando contrato en el explorador...");
    try {
      await verify(gameContractAddress, []);
      console.log("✅ Contrato verificado exitosamente");
    } catch (error) {
      console.log("⚠️  Error al verificar el contrato:", error);
    }
  }

  // Mostrar información del despliegue
  console.log("\n🎯 DESPLIEGUE COMPLETADO");
  console.log("=" * 50);
  console.log(`🌐 Red: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`🎮 GameContract: ${gameContractAddress}`);
  console.log(`🪙 GameToken: ${gameTokenAddress}`);
  console.log(`🖼️  GameNFT: ${gameNFTAddress}`);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log("=" * 50);

  // Guardar las direcciones en un archivo para uso posterior
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    gameContract: gameContractAddress,
    gameToken: gameTokenAddress,
    gameNFT: gameNFTAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\n💾 Información del despliegue guardada en deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error durante el despliegue:", error);
    process.exit(1);
  });

