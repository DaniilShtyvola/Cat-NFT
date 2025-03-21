// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract CatNFT {
    struct Cat {
        string imageUrl;
        string name;
        uint8 quality;
        uint256 price;
        bool isForSale;
        address owner;
        uint256 creationTime;
    }

    Cat[] public cats;
    mapping(uint256 => address) public catToOwner;
    mapping(address => mapping(uint256 => bool)) public ownerHasCat;

    address payable public owner;
    uint256 public constant MINT_PRICE = 0.0025 ether;

    event CatCreated(
        uint256 catId,
        string imageUrl,
        string name,
        uint8 quality,
        address owner,
        uint256 creationTime
    );
    event CatPriceUpdated(uint256 catId, uint256 newPrice);
    event CatListedForSale(uint256 catId, uint256 price);
    event CatDelisted(uint256 catId);
    event CatSold(uint256 catId, address buyer, uint256 price);
    event CatBurned(uint256 catId);

    constructor() {
        owner = payable(msg.sender);
    }

    function createCat(string memory _imageUrl, string memory _name) public {
        uint256 randomValue = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, msg.sender, cats.length)
            )
        ) % 100;

        uint8 _quality;
        if (randomValue < 35) {
            _quality = 1;
        } else if (randomValue < 60) {
            _quality = 2;
        } else if (randomValue < 80) {
            _quality = 3;
        } else if (randomValue < 93) {
            _quality = 4;
        } else {
            _quality = 5;
        }

        uint256 catId = cats.length;
        cats.push(
            Cat({
                imageUrl: _imageUrl,
                name: _name,
                quality: _quality,
                price: 0,
                isForSale: false,
                owner: msg.sender,
                creationTime: block.timestamp
            })
        );

        catToOwner[catId] = msg.sender;
        ownerHasCat[msg.sender][catId] = true;

        emit CatCreated(
            catId,
            _imageUrl,
            _name,
            _quality,
            msg.sender,
            block.timestamp
        );
    }

    function withdrawFunds() public {
        require(msg.sender == owner, "Only owner can withdraw funds");
        payable(owner).transfer(address(this).balance);
    }

    function updatePrice(uint256 _catId, uint256 _newPrice) public {
        require(
            catToOwner[_catId] == msg.sender,
            "You are not the owner of this cat"
        );
        cats[_catId].price = _newPrice;
        emit CatPriceUpdated(_catId, _newPrice);
    }

    function listForSale(uint256 _catId, uint256 _price) public {
        require(
            catToOwner[_catId] == msg.sender,
            "You are not the owner of this cat"
        );
        cats[_catId].isForSale = true;
        cats[_catId].price = _price;
        emit CatListedForSale(_catId, _price);
    }

    function delist(uint256 _catId) public {
        require(
            catToOwner[_catId] == msg.sender,
            "You are not the owner of this cat"
        );
        cats[_catId].isForSale = false;
        emit CatDelisted(_catId);
    }

    function buyCat(uint256 _catId) public payable {
        require(cats[_catId].isForSale, "This cat is not for sale");
        require(msg.value >= cats[_catId].price, "Insufficient funds");

        address previousOwner = catToOwner[_catId];

        require(previousOwner != msg.sender, "You already own this cat");

        catToOwner[_catId] = msg.sender;
        cats[_catId].isForSale = false;
        cats[_catId].owner = msg.sender;

        ownerHasCat[previousOwner][_catId] = false;
        ownerHasCat[msg.sender][_catId] = true;

        (bool success, ) = payable(previousOwner).call{value: msg.value}("");
        require(success, "Transfer failed");

        emit CatSold(_catId, msg.sender, msg.value);
    }

    function getMarketplaceCats(
        address _user
    ) public view returns (uint256[] memory) {
        uint256 totalCats = cats.length;
        uint256 count = 0;

        for (uint256 i = 0; i < totalCats; i++) {
            if (_user == address(0) && cats[i].isForSale) {
                count++;
            } else if (cats[i].isForSale && catToOwner[i] != _user) {
                count++;
            }
        }

        uint256[] memory marketplaceCats = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < totalCats; i++) {
            if (_user == address(0) && cats[i].isForSale) {
                marketplaceCats[index] = i;
                index++;
            } else if (cats[i].isForSale && catToOwner[i] != _user) {
                marketplaceCats[index] = i;
                index++;
            }
        }

        return marketplaceCats;
    }

    function getCatsByOwner(
        address _owner
    ) public view returns (uint256[] memory) {
        uint256 totalCats = cats.length;
        uint256 count = 0;

        for (uint256 i = 0; i < totalCats; i++) {
            if (ownerHasCat[_owner][i]) {
                count++;
            }
        }

        uint256[] memory ownerCats = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < totalCats; i++) {
            if (ownerHasCat[_owner][i]) {
                ownerCats[index] = i;
                index++;
            }
        }

        return ownerCats;
    }

    function burnCat(uint256 _catId) public {
        require(catToOwner[_catId] == msg.sender, "You are not the owner");
        
        ownerHasCat[msg.sender][_catId] = false;
        delete catToOwner[_catId];
        delete cats[_catId];

        emit CatBurned(_catId);
    }
}
