-- Table: site.s_product
-- DROP TABLE IF EXISTS site.s_product;
CREATE TABLE IF NOT EXISTS site.s_product
(
    id integer NOT NULL DEFAULT nextval('site.s_product_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    price numeric NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    stock numeric DEFAULT 0,
    CONSTRAINT s_product_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;
ALTER TABLE IF EXISTS site.s_product
    OWNER to postgres;
-- Index: idx_product_id
-- DROP INDEX IF EXISTS site.idx_product_id;
CREATE INDEX IF NOT EXISTS idx_product_id
    ON site.s_product USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;


-- Table: site.s_order
-- DROP TABLE IF EXISTS site.s_order;
CREATE TABLE IF NOT EXISTS site.s_order
(
    id integer NOT NULL DEFAULT nextval('site.s_order_id_seq'::regclass),
    user_id integer,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    total numeric NOT NULL,
    "idempotencyKey" uuid NOT NULL DEFAULT gen_random_uuid(),
    customer_name character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
    status order_status NOT NULL DEFAULT 'PENDING'::order_status,
    CONSTRAINT s_order_pkey PRIMARY KEY (id),
    CONSTRAINT "FK_7bbb701bf96fdc6a3427412d15c" FOREIGN KEY (user_id)
        REFERENCES site.s_user (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;
ALTER TABLE IF EXISTS site.s_order
    OWNER to postgres;
-- Index: idx_order_created_at
-- DROP INDEX IF EXISTS site.idx_order_created_at;
CREATE INDEX IF NOT EXISTS idx_order_created_at
    ON site.s_order USING btree
    (created_at ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: site.s_order_item
-- DROP TABLE IF EXISTS site.s_order_item;
CREATE TABLE IF NOT EXISTS site.s_order_item
(
    id integer NOT NULL DEFAULT nextval('site.s_order_item_id_seq'::regclass),
    quantity integer NOT NULL,
    price numeric NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    order_id integer,
    product_id integer,
    CONSTRAINT "PK_56b42fde106acc4efe561e4ef15" PRIMARY KEY (id),
    CONSTRAINT "FK_24597a80c8003213934a0a5ff52" FOREIGN KEY (product_id)
        REFERENCES site.s_product (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "FK_92ebda743c20ab7a29f8da1b64e" FOREIGN KEY (order_id)
        REFERENCES site.s_order (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;
ALTER TABLE IF EXISTS site.s_order_item
    OWNER to postgres;
-- Index: idx_order_item_order_id
-- DROP INDEX IF EXISTS site.idx_order_item_order_id;
CREATE INDEX IF NOT EXISTS idx_order_item_order_id
    ON site.s_order_item USING btree
    (order_id ASC NULLS LAST)
    TABLESPACE pg_default;


-- Table: site.s_user
-- DROP TABLE IF EXISTS site.s_user;
CREATE TABLE IF NOT EXISTS site.s_user
(
    id integer NOT NULL DEFAULT nextval('site.s_user_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT s_user_pkey PRIMARY KEY (id),
    CONSTRAINT s_user_email_key UNIQUE (email)
)
TABLESPACE pg_default;
ALTER TABLE IF EXISTS site.s_user
    OWNER to postgres;