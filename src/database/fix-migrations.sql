-- Insert existing migrations into typeorm_migrations table
-- This marks the already-applied migrations as executed

INSERT INTO site.typeorm_migrations (timestamp, name) VALUES
(1770554179243, 'InitSchema1770554179243'),
(1770558606117, 'AddStockToProduct1770558606117'),
(1771324512906, 'NewMigration1771324512906'),
(1771327743374, 'AddProductIdToOrderItem1771327743374')
ON CONFLICT DO NOTHING;