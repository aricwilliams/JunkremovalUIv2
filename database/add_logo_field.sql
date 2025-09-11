-- Add logo field to businesses table
ALTER TABLE businesses ADD COLUMN logo_url VARCHAR(500) NULL AFTER years_in_business;

-- Add index for logo_url
CREATE INDEX idx_logo_url ON businesses(logo_url);
