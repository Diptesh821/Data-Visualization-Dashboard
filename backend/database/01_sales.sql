CREATE TABLE IF NOT EXISTS sales(
    sales_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_date DATE NOT NULL,
    total_amount NUMERIC NOT NULL,
    quantity INTEGER NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    mongo_user_id VARCHAR(50) NOT NULL,  -- MongoDB user id as string
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);


