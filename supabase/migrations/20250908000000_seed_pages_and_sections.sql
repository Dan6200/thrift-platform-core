-- Seed data for pages table
insert into public.pages (store_id, page_slug, page_title, page_type, seo_data) values
((select store_id from stores where store_name = 'John''s Gadgets'), 'home', 'Welcome to John''s Gadgets', 'homepage',  '{"meta_description": "Your one-stop shop for all electronic gadgets.", "canonical_url": "https://gadgets.example.com", "keywords": ["gadgets", "electronics", "tech"]}'),
((select store_id from stores where store_name = 'Peter''s Picks'), 'home', 'Peter''s Picks for the best products', 'homepage',  '{"meta_description": "Curated collection of the best products.", "canonical_url": "https://peterspicks.example.com", "keywords": ["curated", "products", "best picks"]}'),
((select store_id from stores where store_name = 'Bob''s Bargains'), 'home', 'Bob''s Bargains - Unbeatable prices', 'homepage',  '{"meta_description": "Find the best bargains on all products.", "canonical_url": "https://bargains.example.com", "keywords": ["bargains", "deals", "discounts"]}'),
((select store_id from stores where store_name = 'Kenji''s Tech'), 'home', 'Kenji''s Tech - The future of technology', 'homepage',  '{"meta_description": "The latest in tech and gadgets.", "canonical_url": "https://kenjitech.example.com", "keywords": ["tech", "gadgets", "future"]}'),
((select store_id from stores where store_name = 'Sophie''s Boutique'), 'home', 'Sophie''s Boutique - Unique fashion items', 'homepage',  '{"meta_description": "Unique and stylish fashion for everyone.", "canonical_url": "https://sophiesboutique.example.com", "keywords": ["fashion", "boutique", "style"]}'),
((select store_id from stores where store_name = 'Emily''s Emporium'), 'home', 'Emily''s Emporium of Wonders', 'homepage',  '{"meta_description": "An emporium of wonderful items.", "canonical_url": "https://emilysemp.example.com", "keywords": ["emporium", "wonders", "unique items"]}'),
((select store_id from stores where store_name = 'Global Goods'), 'home', 'Global Goods - Products from around the world', 'homepage',  '{"meta_description": "Sourced from around the world, just for you.", "canonical_url": "https://globalgoods.example.com", "keywords": ["global", "goods", "international"]}'),
((select store_id from stores where store_name = 'Artisan Alley'), 'home', 'Artisan Alley - Handcrafted goods', 'homepage',  '{"meta_description": "Beautifully handcrafted goods from local artisans.", "canonical_url": "https://artisanalley.example.com", "keywords": ["artisan", "handcrafted", "local"]}'),
((select store_id from stores where store_name = 'Tech Haven'), 'home', 'Tech Haven - Your sanctuary for tech', 'homepage',  '{"meta_description": "Your one-stop shop for all things tech.", "canonical_url": "https://techhaven.example.com", "keywords": ["tech", "haven", "electronics"]}'),
((select store_id from stores where store_name = 'Fashion Forward'), 'home', 'Fashion Forward - The latest trends', 'homepage',  '{"meta_description": "Stay ahead of the curve with the latest fashion trends.", "canonical_url": "https://fashionforward.example.com", "keywords": ["fashion", "trends", "style"]}');

-- Seed data for page_sections table
-- Sections for John's Gadgets
insert into public.page_sections (page_id, section_type, section_title, section_data, sort_order) values
((select page_id from pages where page_title = 'Welcome to John''s Gadgets'), 'hero', 'Welcome to John''s Gadgets', '{"subtitle": "Your one-stop shop for all electronic gadgets."}', 1),
((select page_id from pages where page_title = 'Welcome to John''s Gadgets'), 'product_grid', 'Featured Products', '{"product_ids": [1, 2, 3]}', 2);

-- Sections for Peter's Picks
insert into public.page_sections (page_id, section_type, section_title, section_data, sort_order) values
((select page_id from pages where page_title = 'Peter''s Picks for the best products'), 'hero', 'Peter''s Picks', '{"subtitle": "Curated collection of the best products."}', 1),
((select page_id from pages where page_title = 'Peter''s Picks for the best products'), 'testimonial_list', 'What our customers say', '{"testimonials": [{"name": "John Doe", "quote": "Great products!"}, {"name": "Jane Smith", "quote": "Amazing service!"}]}', 2);

-- Sections for Bob's Bargains
insert into public.page_sections (page_id, section_type, section_title, section_data, sort_order) values
((select page_id from pages where page_title = 'Bob''s Bargains - Unbeatable prices'), 'text_block', 'About Us', '{"content": "We find the best bargains so you don''t have to."}', 1);

-- Sections for Kenji's Tech
insert into public.page_sections (page_id, section_type, section_title, section_data, sort_order) values
((select page_id from pages where page_title = 'Kenji''s Tech - The future of technology'), 'hero', 'Kenji''s Tech', '{"subtitle": "The future of technology is here."}', 1);

-- Sections for Sophie's Boutique
insert into public.page_sections (page_id, section_type, section_title, section_data, sort_order) values
((select page_id from pages where page_title = 'Sophie''s Boutique - Unique fashion items'), 'product_grid', 'New Arrivals', '{"product_ids": [4, 5, 6]}', 1);

-- Sections for Emily's Emporium
insert into public.page_sections (page_id, section_type, section_title, section_data, sort_order) values
((select page_id from pages where page_title = 'Emily''s Emporium of Wonders'), 'hero', 'Emily''s Emporium', '{"subtitle": "A collection of wonderful items."}', 1);

-- Sections for Global Goods
insert into public.page_sections (page_id, section_type, section_title, section_data, sort_order) values
((select page_id from pages where page_title = 'Global Goods - Products from around the world'), 'text_block', 'Our Mission', '{"content": "To bring the world to your doorstep."}', 1);

-- Sections for Artisan Alley
insert into public.page_sections (page_id, section_type, section_title, section_data, sort_order) values
((select page_id from pages where page_title = 'Artisan Alley - Handcrafted goods'), 'product_grid', 'Our Artisans'' Work', '{"product_ids": [7, 8, 9]}', 1);

-- Sections for Tech Haven
insert into public.page_sections (page_id, section_type, section_title, section_data, sort_order) values
((select page_id from pages where page_title = 'Tech Haven - Your sanctuary for tech'), 'hero', 'Tech Haven', '{"subtitle": "Your sanctuary for all things tech."}', 1);

-- Sections for Fashion Forward
insert into public.page_sections (page_id, section_type, section_title, section_data, sort_order) values
((select page_id from pages where page_title = 'Fashion Forward - The latest trends'), 'testimonial_list', 'Style Icons', '{"testimonials": [{"name": "Fashionista", "quote": "I love this store!"}]}', 1);