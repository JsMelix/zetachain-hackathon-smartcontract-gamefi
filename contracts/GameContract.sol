// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GameContract
 * @dev Contrato principal del juego para ZetaChain
 * Implementa sistema de tokens, NFTs y acciones del jugador
 */
contract GameContract is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Estructuras de datos
    struct Player {
        uint256 level;
        uint256 experience;
        uint256 gameTokenBalance;
        uint256 characterNFTId;
        string[] items;
        uint256 lastActionTime;
        bool isRegistered;
    }
    
    struct Character {
        string name;
        string characterClass;
        string imageURI;
        uint256 level;
        uint256 experience;
        uint256 strength;
        uint256 agility;
        uint256 intelligence;
        uint256 vitality;
    }
    
    struct Item {
        string name;
        string description;
        uint256 itemType; // 0: Weapon, 1: Armor, 2: Consumable, 3: Special
        uint256 rarity; // 0: Common, 1: Uncommon, 2: Rare, 3: Epic, 4: Legendary
        uint256 power;
        uint256 price;
        bool isTradeable;
    }
    
    struct ActivityLog {
        uint256 id;
        string message;
        uint256 timestamp;
        ActivityStatus status;
    }
    
    enum ActivityStatus { Pending, Success, Failed }
    
    // Variables de estado
    Counters.Counter private _characterIds;
    Counters.Counter private _itemIds;
    Counters.Counter private _activityLogIds;
    
    mapping(address => Player) public players;
    mapping(uint256 => Character) public characters;
    mapping(uint256 => Item) public items;
    mapping(address => ActivityLog[]) public playerActivityLogs;
    
    // Tokens del juego
    GameToken public gameToken;
    GameNFT public gameNFT;
    
    // Configuración del juego
    uint256 public constant MINING_REWARD = 10;
    uint256 public constant BATTLE_REWARD = 25;
    uint256 public constant QUEST_REWARD = 50;
    uint256 public constant LEVEL_UP_EXPERIENCE = 100;
    uint256 public constant ACTION_COOLDOWN = 300; // 5 minutos
    
    // Eventos
    event PlayerRegistered(address indexed player, uint256 timestamp);
    event CharacterMinted(address indexed player, uint256 characterId, string name);
    event LevelUp(address indexed player, uint256 newLevel, uint256 experience);
    event ItemAcquired(address indexed player, uint256 itemId, string itemName);
    event GameAction(address indexed player, string action, uint256 reward);
    event ActivityLogged(address indexed player, string message, ActivityStatus status);
    
    // Modificadores
    modifier onlyRegisteredPlayer() {
        require(players[msg.sender].isRegistered, "Player not registered");
        _;
    }
    
    modifier hasCharacter() {
        require(players[msg.sender].characterNFTId > 0, "No character minted");
        _;
    }
    
    modifier actionCooldown() {
        require(
            block.timestamp >= players[msg.sender].lastActionTime + ACTION_COOLDOWN,
            "Action on cooldown"
        );
        _;
    }
    
    constructor() {
        gameToken = new GameToken();
        gameNFT = new GameNFT();
        _initializeGameItems();
    }
    
    /**
     * @dev Registra un nuevo jugador
     */
    function registerPlayer() external {
        require(!players[msg.sender].isRegistered, "Player already registered");
        
        players[msg.sender] = Player({
            level: 1,
            experience: 0,
            gameTokenBalance: 100, // Tokens iniciales
            characterNFTId: 0,
            items: new string[](0),
            lastActionTime: 0,
            isRegistered: true
        });
        
        // Mint tokens iniciales
        gameToken.mint(msg.sender, 100);
        
        emit PlayerRegistered(msg.sender, block.timestamp);
        _logActivity(msg.sender, "Player registered successfully", ActivityStatus.Success);
    }
    
    /**
     * @dev Mina un personaje NFT
     */
    function mintCharacter(
        string memory name,
        string memory characterClass,
        string memory imageURI
    ) external onlyRegisteredPlayer nonReentrant {
        require(players[msg.sender].characterNFTId == 0, "Character already minted");
        require(gameToken.balanceOf(msg.sender) >= 50, "Insufficient tokens");
        
        // Quema tokens para mint
        gameToken.burn(msg.sender, 50);
        
        _characterIds.increment();
        uint256 characterId = _characterIds.current();
        
        // Genera stats aleatorios basados en la clase
        (uint256 strength, uint256 agility, uint256 intelligence, uint256 vitality) = 
            _generateCharacterStats(characterClass);
        
        characters[characterId] = Character({
            name: name,
            characterClass: characterClass,
            imageURI: imageURI,
            level: 1,
            experience: 0,
            strength: strength,
            agility: agility,
            intelligence: intelligence,
            vitality: vitality
        });
        
        players[msg.sender].characterNFTId = characterId;
        
        // Mint NFT
        gameNFT.mint(msg.sender, characterId, imageURI);
        
        emit CharacterMinted(msg.sender, characterId, name);
        _logActivity(msg.sender, "Character minted successfully", ActivityStatus.Success);
    }
    
    /**
     * @dev Realiza una acción de minería
     */
    function mine() external onlyRegisteredPlayer hasCharacter actionCooldown nonReentrant {
        _updateLastActionTime();
        
        uint256 reward = MINING_REWARD + _calculateBonusReward();
        
        // Mint tokens como recompensa
        gameToken.mint(msg.sender, reward);
        players[msg.sender].gameTokenBalance += reward;
        
        // Añadir experiencia
        _addExperience(reward);
        
        emit GameAction(msg.sender, "Mining", reward);
        _logActivity(msg.sender, "Mining completed successfully", ActivityStatus.Success);
    }
    
    /**
     * @dev Realiza una batalla
     */
    function battle() external onlyRegisteredPlayer hasCharacter actionCooldown nonReentrant {
        _updateLastActionTime();
        
        uint256 reward = BATTLE_REWARD + _calculateBonusReward();
        
        // Mint tokens como recompensa
        gameToken.mint(msg.sender, reward);
        players[msg.sender].gameTokenBalance += reward;
        
        // Añadir experiencia
        _addExperience(reward);
        
        // Posibilidad de obtener item
        if (_shouldDropItem()) {
            uint256 itemId = _generateRandomItem();
            _giveItemToPlayer(msg.sender, itemId);
        }
        
        emit GameAction(msg.sender, "Battle", reward);
        _logActivity(msg.sender, "Battle completed successfully", ActivityStatus.Success);
    }
    
    /**
     * @dev Completa una misión
     */
    function completeQuest() external onlyRegisteredPlayer hasCharacter actionCooldown nonReentrant {
        _updateLastActionTime();
        
        uint256 reward = QUEST_REWARD + _calculateBonusReward();
        
        // Mint tokens como recompensa
        gameToken.mint(msg.sender, reward);
        players[msg.sender].gameTokenBalance += reward;
        
        // Añadir experiencia
        _addExperience(reward);
        
        // Recompensa garantizada de item
        uint256 itemId = _generateRandomItem();
        _giveItemToPlayer(msg.sender, itemId);
        
        emit GameAction(msg.sender, "Quest", reward);
        _logActivity(msg.sender, "Quest completed successfully", ActivityStatus.Success);
    }
    
    /**
     * @dev Compra un item con tokens del juego
     */
    function buyItem(uint256 itemId) external onlyRegisteredPlayer nonReentrant {
        Item storage item = items[itemId];
        require(item.price > 0, "Item not found");
        require(gameToken.balanceOf(msg.sender) >= item.price, "Insufficient tokens");
        
        gameToken.burn(msg.sender, item.price);
        _giveItemToPlayer(msg.sender, itemId);
        
        emit ItemAcquired(msg.sender, itemId, item.name);
        _logActivity(msg.sender, "Item purchased successfully", ActivityStatus.Success);
    }
    
    /**
     * @dev Obtiene información del jugador
     */
    function getPlayerInfo(address playerAddress) external view returns (
        Player memory player,
        Character memory character,
        uint256 tokenBalance
    ) {
        player = players[playerAddress];
        if (player.characterNFTId > 0) {
            character = characters[player.characterNFTId];
        }
        tokenBalance = gameToken.balanceOf(playerAddress);
    }
    
    /**
     * @dev Obtiene el log de actividades del jugador
     */
    function getPlayerActivityLogs(address playerAddress) external view returns (ActivityLog[] memory) {
        return playerActivityLogs[playerAddress];
    }
    
    /**
     * @dev Obtiene todos los items disponibles
     */
    function getAllItems() external view returns (Item[] memory) {
        Item[] memory allItems = new Item[](_itemIds.current());
        for (uint256 i = 1; i <= _itemIds.current(); i++) {
            allItems[i-1] = items[i];
        }
        return allItems;
    }
    
    // Funciones internas
    function _updateLastActionTime() internal {
        players[msg.sender].lastActionTime = block.timestamp;
    }
    
    function _addExperience(uint256 amount) internal {
        players[msg.sender].experience += amount;
        
        // Verificar level up
        uint256 currentLevel = players[msg.sender].level;
        uint256 requiredExp = currentLevel * LEVEL_UP_EXPERIENCE;
        
        if (players[msg.sender].experience >= requiredExp) {
            players[msg.sender].level++;
            players[msg.sender].characterNFTId > 0 ? characters[players[msg.sender].characterNFTId].level++ : 0;
            
            emit LevelUp(msg.sender, players[msg.sender].level, players[msg.sender].experience);
        }
    }
    
    function _calculateBonusReward() internal view returns (uint256) {
        uint256 playerLevel = players[msg.sender].level;
        return playerLevel * 2; // Bonus basado en nivel
    }
    
    function _shouldDropItem() internal view returns (bool) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100 < 30; // 30% chance
    }
    
    function _generateRandomItem() internal view returns (uint256) {
        uint256 randomValue = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % _itemIds.current();
        return randomValue + 1; // +1 porque los IDs empiezan en 1
    }
    
    function _giveItemToPlayer(address player, uint256 itemId) internal {
        Item storage item = items[itemId];
        players[player].items.push(item.name);
    }
    
    function _generateCharacterStats(string memory characterClass) internal pure returns (
        uint256 strength, uint256 agility, uint256 intelligence, uint256 vitality
    ) {
        if (keccak256(abi.encodePacked(characterClass)) == keccak256(abi.encodePacked("Warrior"))) {
            return (80, 60, 40, 90);
        } else if (keccak256(abi.encodePacked(characterClass)) == keccak256(abi.encodePacked("Mage"))) {
            return (30, 50, 90, 60);
        } else if (keccak256(abi.encodePacked(characterClass)) == keccak256(abi.encodePacked("Archer"))) {
            return (50, 90, 60, 70);
        } else {
            return (60, 60, 60, 60); // Default balanced stats
        }
    }
    
    function _initializeGameItems() internal {
        _addItem("Iron Sword", "A basic iron sword", 0, 0, 15, 25, true);
        _addItem("Steel Armor", "Protective steel armor", 1, 1, 20, 50, true);
        _addItem("Health Potion", "Restores health", 2, 0, 0, 10, true);
        _addItem("Magic Staff", "A powerful magic staff", 0, 2, 25, 100, true);
        _addItem("Dragon Scale Armor", "Legendary dragon armor", 1, 4, 50, 500, true);
    }
    
    function _addItem(
        string memory name,
        string memory description,
        uint256 itemType,
        uint256 rarity,
        uint256 power,
        uint256 price,
        bool isTradeable
    ) internal {
        _itemIds.increment();
        items[_itemIds.current()] = Item({
            name: name,
            description: description,
            itemType: itemType,
            rarity: rarity,
            power: power,
            price: price,
            isTradeable: isTradeable
        });
    }
    
    function _logActivity(address player, string memory message, ActivityStatus status) internal {
        _activityLogIds.increment();
        ActivityLog memory log = ActivityLog({
            id: _activityLogIds.current(),
            message: message,
            timestamp: block.timestamp,
            status: status
        });
        playerActivityLogs[player].push(log);
        
        emit ActivityLogged(player, message, status);
    }
    
    // Función de emergencia para el owner
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

/**
 * @title GameToken
 * @dev Token ERC20 del juego
 */
contract GameToken is ERC20, Ownable {
    constructor() ERC20("GameToken", "GTK") {}
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

/**
 * @title GameNFT
 * @dev NFT ERC721 para los personajes del juego
 */
contract GameNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    constructor() ERC721("GameCharacter", "GCHR") {}
    
    function mint(address to, uint256 tokenId, string memory tokenURI) external onlyOwner {
        _tokenIds.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

