CREATE SEQUENCE public.clients_id;

CREATE TYPE public.clients_status AS ENUM ('active', 'inactive');

CREATE TABLE public.clients (
    id INTEGER NOT NULL DEFAULT nextval('public.clients_id'::regclass),
    id_user INTEGER NOT NULL,
    id_client_type INTEGER NOT NULL,
    status public.clients_status NOT NULL DEFAULT 'active',
    createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_clients_id_user FOREIGN KEY (id_user)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_clients_id_client_type FOREIGN KEY (id_client_type)
        REFERENCES public.client_types_by_service (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE INDEX idx_clients_username_password ON public.clients (id_user, id_client_type);

COMMENT on column public.clients.id_user is 'The id of the user the clint has';
COMMENT on column public.clients.id_client_type is 'The privigile or access right the client has';
COMMENT on column public.clients.status is 'Status of the record';
COMMENT on column public.clients.createdAt is 'Date on which the row was created';
COMMENT on column public.clients.updatedAt is 'Date on which the row was last modified';
