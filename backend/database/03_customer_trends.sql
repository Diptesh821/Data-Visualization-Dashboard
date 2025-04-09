CREATE TABLE IF NOT EXISTS customer_trends(
    trends_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trend_date DATE NOT NULL,
    customer_segment VARCHAR(100) NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    additional_context JSONB,
    business_name VARCHAR(255) NOT NULL,
    mongo_user_id VARCHAR(50) NOT NULL,  -- MongoDB user id as string
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);


