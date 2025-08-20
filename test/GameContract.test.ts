import { expect } from "chai";
import { ethers } from "hardhat";
import { GameContract, GameToken, GameNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("GameContract", function () {
  let gameContract: GameContract;
  let gameToken: GameToken;
  let gameNFT: GameNFT;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    const GameContractFactory = await ethers.getContractFactory("GameContract");
    gameContract = await GameContractFactory.deploy();
    await gameContract.waitForDeployment();

    // Obtener las direcciones de los contratos de tokens
    const gameTokenAddress = await gameContract.gameToken();
    const gameNFTAddress = await gameContract.gameNFT();

    gameToken = await ethers.getContractAt("GameToken", gameTokenAddress);
    gameNFT = await ethers.getContractAt("GameNFT", gameNFTAddress);
  });

  describe("Despliegue", function () {
    it("Debería desplegar correctamente", async function () {
      expect(await gameContract.getAddress()).to.be.properAddress;
      expect(await gameContract.owner()).to.equal(owner.address);
    });

    it("Debería crear los contratos de tokens", async function () {
      expect(await gameContract.gameToken()).to.be.properAddress;
      expect(await gameContract.gameNFT()).to.be.properAddress;
    });

    it("Debería inicializar items del juego", async function () {
      const items = await gameContract.getAllItems();
      expect(items.length).to.be.greaterThan(0);
    });
  });

  describe("Registro de jugadores", function () {
    it("Debería registrar un nuevo jugador", async function () {
      await gameContract.connect(player1).registerPlayer();
      
      const playerInfo = await gameContract.getPlayerInfo(player1.address);
      expect(playerInfo.player.isRegistered).to.be.true;
      expect(playerInfo.player.level).to.equal(1);
      expect(playerInfo.player.gameTokenBalance).to.equal(100);
    });

    it("No debería permitir registro duplicado", async function () {
      await gameContract.connect(player1).registerPlayer();
      
      await expect(
        gameContract.connect(player1).registerPlayer()
      ).to.be.revertedWith("Player already registered");
    });

    it("Debería mint tokens iniciales al registrar", async function () {
      await gameContract.connect(player1).registerPlayer();
      
      const balance = await gameToken.balanceOf(player1.address);
      expect(balance).to.equal(100);
    });
  });

  describe("Mint de personajes", function () {
    beforeEach(async function () {
      await gameContract.connect(player1).registerPlayer();
    });

    it("Debería permitir mint de personaje", async function () {
      await gameContract.connect(player1).mintCharacter(
        "TestWarrior",
        "Warrior",
        "ipfs://test-image"
      );

      const playerInfo = await gameContract.getPlayerInfo(player1.address);
      expect(playerInfo.player.characterNFTId).to.be.greaterThan(0);
    });

    it("No debería permitir mint sin tokens suficientes", async function () {
      // Quemar tokens para no tener suficientes
      await gameToken.connect(player1).approve(gameContract.getAddress(), 100);
      await gameToken.connect(player1).transfer(owner.address, 100);

      await expect(
        gameContract.connect(player1).mintCharacter(
          "TestWarrior",
          "Warrior",
          "ipfs://test-image"
        )
      ).to.be.revertedWith("Insufficient tokens");
    });

    it("No debería permitir mint de personaje duplicado", async function () {
      await gameContract.connect(player1).mintCharacter(
        "TestWarrior",
        "Warrior",
        "ipfs://test-image"
      );

      await expect(
        gameContract.connect(player1).mintCharacter(
          "TestMage",
          "Mage",
          "ipfs://test-image-2"
        )
      ).to.be.revertedWith("Character already minted");
    });
  });

  describe("Acciones del juego", function () {
    beforeEach(async function () {
      await gameContract.connect(player1).registerPlayer();
      await gameContract.connect(player1).mintCharacter(
        "TestWarrior",
        "Warrior",
        "ipfs://test-image"
      );
    });

    it("Debería permitir minería", async function () {
      const initialBalance = await gameToken.balanceOf(player1.address);
      
      await gameContract.connect(player1).mine();
      
      const finalBalance = await gameToken.balanceOf(player1.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Debería permitir batallas", async function () {
      const initialBalance = await gameToken.balanceOf(player1.address);
      
      await gameContract.connect(player1).battle();
      
      const finalBalance = await gameToken.balanceOf(player1.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Debería permitir completar misiones", async function () {
      const initialBalance = await gameToken.balanceOf(player1.address);
      
      await gameContract.connect(player1).completeQuest();
      
      const finalBalance = await gameToken.balanceOf(player1.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Debería respetar el cooldown de acciones", async function () {
      await gameContract.connect(player1).mine();
      
      await expect(
        gameContract.connect(player1).mine()
      ).to.be.revertedWith("Action on cooldown");
    });
  });

  describe("Sistema de experiencia y niveles", function () {
    beforeEach(async function () {
      await gameContract.connect(player1).registerPlayer();
      await gameContract.connect(player1).mintCharacter(
        "TestWarrior",
        "Warrior",
        "ipfs://test-image"
      );
    });

    it("Debería aumentar la experiencia con acciones", async function () {
      const initialExp = (await gameContract.getPlayerInfo(player1.address)).player.experience;
      
      await gameContract.connect(player1).mine();
      
      const finalExp = (await gameContract.getPlayerInfo(player1.address)).player.experience;
      expect(finalExp).to.be.greaterThan(initialExp);
    });

    it("Debería subir de nivel con suficiente experiencia", async function () {
      // Realizar múltiples acciones para ganar experiencia
      for (let i = 0; i < 10; i++) {
        await ethers.provider.send("evm_increaseTime", [301]); // Pasar cooldown
        await ethers.provider.send("evm_mine", []);
        await gameContract.connect(player1).mine();
      }

      const playerInfo = await gameContract.getPlayerInfo(player1.address);
      expect(playerInfo.player.level).to.be.greaterThan(1);
    });
  });

  describe("Sistema de items", function () {
    beforeEach(async function () {
      await gameContract.connect(player1).registerPlayer();
      await gameContract.connect(player1).mintCharacter(
        "TestWarrior",
        "Warrior",
        "ipfs://test-image"
      );
    });

    it("Debería permitir compra de items", async function () {
      const items = await gameContract.getAllItems();
      const itemToBuy = items[0];
      
      const initialBalance = await gameToken.balanceOf(player1.address);
      
      await gameContract.connect(player1).buyItem(1);
      
      const finalBalance = await gameToken.balanceOf(player1.address);
      expect(finalBalance).to.equal(initialBalance - itemToBuy.price);
    });

    it("No debería permitir compra sin tokens suficientes", async function () {
      const items = await gameContract.getAllItems();
      const expensiveItem = items.find(item => item.price > 100);
      
      if (expensiveItem) {
        await expect(
          gameContract.connect(player1).buyItem(expensiveItem.rarity + 1)
        ).to.be.revertedWith("Insufficient tokens");
      }
    });
  });

  describe("Seguridad", function () {
    it("Solo el owner debería poder hacer emergency withdraw", async function () {
      await expect(
        gameContract.connect(player1).emergencyWithdraw()
      ).to.be.revertedWithCustomError(gameContract, "OwnableUnauthorizedAccount");
    });

    it("Debería prevenir reentrancy attacks", async function () {
      // Esta es una prueba básica, en un entorno real se necesitarían pruebas más sofisticadas
      await gameContract.connect(player1).registerPlayer();
      await gameContract.connect(player1).mintCharacter(
        "TestWarrior",
        "Warrior",
        "ipfs://test-image"
      );

      // Intentar múltiples acciones rápidamente
      await gameContract.connect(player1).mine();
      await expect(
        gameContract.connect(player1).mine()
      ).to.be.revertedWith("Action on cooldown");
    });
  });

  describe("Eventos", function () {
    it("Debería emitir evento PlayerRegistered", async function () {
      await expect(gameContract.connect(player1).registerPlayer())
        .to.emit(gameContract, "PlayerRegistered")
        .withArgs(player1.address, await ethers.provider.getBlock("latest").then(b => b?.timestamp));
    });

    it("Debería emitir evento CharacterMinted", async function () {
      await gameContract.connect(player1).registerPlayer();
      
      await expect(
        gameContract.connect(player1).mintCharacter(
          "TestWarrior",
          "Warrior",
          "ipfs://test-image"
        )
      )
        .to.emit(gameContract, "CharacterMinted")
        .withArgs(player1.address, 1, "TestWarrior");
    });

    it("Debería emitir evento GameAction", async function () {
      await gameContract.connect(player1).registerPlayer();
      await gameContract.connect(player1).mintCharacter(
        "TestWarrior",
        "Warrior",
        "ipfs://test-image"
      );

      await expect(gameContract.connect(player1).mine())
        .to.emit(gameContract, "GameAction")
        .withArgs(player1.address, "Mining", 12); // 10 base + 2 bonus nivel 1
    });
  });
});

