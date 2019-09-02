CREATE SEQUENCE public.access_privileges_by_client_types_id;

CREATE TYPE public.access_privileges_by_client_types_status AS ENUM ('active', 'inactive');

CREATE TABLE public.access_privileges_by_client_types (
    id INTEGER NOT NULL DEFAULT nextval('public.access_privileges_by_client_types_id'::regclass),
    id_client_type_by_service INTEGER NOT NULL,
    name character varying(250) NOT NULL,
    status public.access_privileges_by_client_types_status NOT NULL DEFAULT 'active',
    createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    unique (id_client_type_by_service, name),
    CONSTRAINT fk_access_privileges_by_client_types_id_client_type_by_service FOREIGN KEY (id_client_type_by_service)
        REFERENCES public.client_types_by_service (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE INDEX idx_access_privileges_by_client_types_name ON public.users (name);

COMMENT on column public.access_privileges_by_client_types.id_client_type_by_service is 'References client type that is related to a service user';
COMMENT on column public.access_privileges_by_client_types.name is 'The access privilege name';
COMMENT on column public.access_privileges_by_client_types.status is 'Status of the record';
COMMENT on column public.access_privileges_by_client_types.createdAt is 'Date on which the row was created';
COMMENT on column public.access_privileges_by_client_types.updatedAt is 'Date on which the row was last modified';
