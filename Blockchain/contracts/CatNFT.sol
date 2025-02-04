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
    }

    Cat[] public cats;
    mapping(uint256 => address) public catToOwner;
    mapping(address => uint256[]) public ownerToCats;

    event CatCreated(uint256 catId, string imageUrl, string name, uint8 quality, address owner);
    event CatPriceUpdated(uint256 catId, uint256 newPrice);
    event CatListedForSale(uint256 catId, uint256 price);
    event CatDelisted(uint256 catId);
    event CatSold(uint256 catId, address buyer, uint256 price);

    function createCat(string memory _imageUrl, string memory _name, uint256 _price) public {
        uint8 _quality = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 5) + 1;
        uint256 catId = cats.length;
        cats.push(Cat({
            imageUrl: _imageUrl,
            name: _name,
            quality: _quality,
            price: _price,
            isForSale: false,
            owner: msg.sender
        }));
        catToOwner[catId] = msg.sender;
        ownerToCats[msg.sender].push(catId);
        emit CatCreated(catId, _imageUrl, _name, _quality, msg.sender);
    }

    function updatePrice(uint256 _catId, uint256 _newPrice) public {
        require(catToOwner[_catId] == msg.sender, "You are not the owner of this cat");
        cats[_catId].price = _newPrice;
        emit CatPriceUpdated(_catId, _newPrice);
    }

    function listForSale(uint256 _catId, uint256 _price) public {
        require(catToOwner[_catId] == msg.sender, "You are not the owner of this cat");
        cats[_catId].isForSale = true;
        cats[_catId].price = _price;
        emit CatListedForSale(_catId, _price);
    }

    function delist(uint256 _catId) public {
        require(catToOwner[_catId] == msg.sender, "You are not the owner of this cat");
        cats[_catId].isForSale = false;
        emit CatDelisted(_catId);
    }

    function buyCat(uint256 _catId) public payable {
        require(cats[_catId].isForSale, "This cat is not for sale");
        require(msg.value >= cats[_catId].price, "Insufficient funds");

        address previousOwner = catToOwner[_catId];
        catToOwner[_catId] = msg.sender;
        cats[_catId].isForSale = false;
        cats[_catId].owner = msg.sender;

        // Remove cat from previous owner's list
        uint256[] storage previousOwnerCats = ownerToCats[previousOwner];
        for (uint256 i = 0; i < previousOwnerCats.length; i++) {
            if (previousOwnerCats[i] == _catId) {
                previousOwnerCats[i] = previousOwnerCats[previousOwnerCats.length - 1];
                previousOwnerCats.pop();
                break;
            }
        }

        // Add cat to new owner's list
        ownerToCats[msg.sender].push(_catId);

        // Transfer funds to the previous owner
        payable(previousOwner).transfer(msg.value);

        emit CatSold(_catId, msg.sender, msg.value);
    }

    function getMarketplaceCats() public view returns (uint256[] memory) {
        uint256[] memory marketplaceCats = new uint256[](cats.length);
        uint256 count = 0;
        for (uint256 i = 0; i < cats.length; i++) {
            if (cats[i].isForSale) {
                marketplaceCats[count] = i;
                count++;
            }
        }
        // Resize the array to remove unused slots
        assembly {
            mstore(marketplaceCats, count)
        }
        return marketplaceCats;
    }

    function getCatsByOwner(address _owner) public view returns (uint256[] memory) {
        return ownerToCats[_owner];
    }
}