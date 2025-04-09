CREATE TABLE IF NOT EXISTS products(
    products_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category VARCHAR(100) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    mongo_user_id VARCHAR(50) NOT NULL,  -- MongoDB user id as string
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_product_per_business ON products(business_name, product_name);