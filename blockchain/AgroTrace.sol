// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AgroTrace {
    
    struct Product {
        string name;
        string origin;
        string timestamp;
        bool exists;
    }

    mapping(uint => Product) public products;

    // Events
    event ProductAdded(
        uint indexed id,
        string name,
        string origin,
        string timestamp
    );

    event ProductUpdated(
        uint indexed id,
        string name,
        string origin,
        string timestamp
    );

    event ProductDeleted(uint indexed id);

    // Validate input
    modifier validateProduct(
        uint _id,
        string memory _name,
        string memory _origin,
        string memory _timestamp
    ) {
        require(_id > 0, "Product ID must be greater than 0");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_origin).length > 0, "Origin cannot be empty");
        require(bytes(_timestamp).length > 0, "Timestamp cannot be empty");
        _;
    }

    // Thêm sản phẩm
    function addProduct(
        uint _id,
        string memory _name,
        string memory _origin,
        string memory _timestamp
    ) public validateProduct(_id, _name, _origin, _timestamp) {
        require(!products[_id].exists, "Product already exists");
        
        products[_id] = Product({
            name: _name,
            origin: _origin,
            timestamp: _timestamp,
            exists: true
        });
        
        emit ProductAdded(_id, _name, _origin, _timestamp);
    }

    // Lấy sản phẩm
    function getProduct(uint _id) public view returns (
        string memory, string memory, string memory
    ) {
        require(products[_id].exists, "Product does not exist");
        Product memory p = products[_id];
        return (p.name, p.origin, p.timestamp);
    }

    // Kiểm tra sản phẩm tồn tại
    function productExists(uint _id) public view returns (bool) {
        return products[_id].exists;
    }

    // Cập nhật sản phẩm
    function updateProduct(
        uint _id,
        string memory _name,
        string memory _origin,
        string memory _timestamp
    ) public validateProduct(_id, _name, _origin, _timestamp) {
        require(products[_id].exists, "Product does not exist");
        
        products[_id] = Product({
            name: _name,
            origin: _origin,
            timestamp: _timestamp,
            exists: true
        });
        
        emit ProductUpdated(_id, _name, _origin, _timestamp);
    }

    // Xóa sản phẩm
    function deleteProduct(uint _id) public {
        require(products[_id].exists, "Product does not exist");
        delete products[_id];
        emit ProductDeleted(_id);
    }
}

