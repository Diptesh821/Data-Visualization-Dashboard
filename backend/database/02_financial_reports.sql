CREATE TABLE IF NOT EXISTS financial_reports(
    financial_report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_date DATE NOT NULL,
    revenue NUMERIC NOT NULL,
    expenses NUMERIC NOT NULL,
    net_profit NUMERIC NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    mongo_user_id VARCHAR(50) NOT NULL,  -- MongoDB user id as string
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);


CREATE UNIQUE INDEX IF NOT EXISTS unique_report_per_business_month 
ON financial_reports (business_name, report_date);
