-- Tạo bảng chuyên mục sản phẩm
CREATE TABLE categories (
    category_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(150) NOT NULL,
    slug          VARCHAR(150) NOT NULL UNIQUE,
    image_url     VARCHAR(500),
    sort_order    INT DEFAULT 0,
    status        VARCHAR(20) DEFAULT 'ACTIVE',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Thêm các cột còn thiếu vào bảng products
ALTER TABLE products
    ADD COLUMN description  TEXT,
    ADD COLUMN price        DECIMAL(15,2),
    ADD COLUMN image_url    VARCHAR(500),
    ADD COLUMN sort_order   INT DEFAULT 0,
    ADD COLUMN status       VARCHAR(20) DEFAULT 'ACTIVE',
    ADD COLUMN category_id  BIGINT,
    ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(category_id);
