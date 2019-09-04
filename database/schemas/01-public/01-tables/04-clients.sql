CREATE SEQUENCE public.clients_id;

CREATE TYPE public.clients_status AS ENUM ('active', 'inactive');

CREATE TABLE public.clients (
    id INTEGER NOT NULL DEFAULT nextval('public.clients_id'::regclass),
    name character varying(250) NOT NULL DEFAULT '' UNIQUE,
    username character varying(100) NOT NULL DEFAULT '' UNIQUE,
    password character varying(100) NOT NULL DEFAULT '',
    id_client_type INTEGER NOT NULL,
    status public.clients_status NOT NULL DEFAULT 'active',
    createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_clients_id_client_type FOREIGN KEY (id_client_type)
        REFERENCES public.client_types_by_service (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE INDEX idx_clients_name ON public.clients (name);
CREATE INDEX idx_clients_username_password ON public.clients (username, password);

COMMENT on column public.clients.name is 'Name or description of the client to aid in its identifying';
COMMENT on column public.clients.username is 'The username the client will provide to sign in';
COMMENT on column public.clients.password is 'A matching password provided by the client to sign in';
COMMENT on column public.clients.id_client_type is 'The privigile or access right the client has';
COMMENT on column public.clients.status is 'Status of the record';
COMMENT on column public.clients.createdAt is 'Date on which the row was created';
COMMENT on column public.clients.updatedAt is 'Date on which the row was last modified';
