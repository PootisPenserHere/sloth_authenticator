CREATE SEQUENCE public.client_types_by_service_id;

CREATE TYPE public.client_types_by_service_status AS ENUM ('active', 'inactive');

CREATE TABLE public.client_types_by_service (
    id INTEGER NOT NULL DEFAULT nextval('public.client_types_by_service_id'::regclass),
    id_service INTEGER NOT NULL,
    name character varying(100) NOT NULL,
    status public.client_types_by_service_status NOT NULL DEFAULT 'active',
    createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    unique (id_service, name),
    CONSTRAINT fk_client_types_by_service_id_service FOREIGN KEY (id_service)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE INDEX idx_client_types_by_service_name ON public.client_types_by_service (name);

COMMENT on column public.client_types_by_service.id_service is 'References the service to which the user type belongs';
COMMENT on column public.client_types_by_service.name is 'The type of user';
COMMENT on column public.client_types_by_service.status is 'Status of the record';
COMMENT on column public.client_types_by_service.createdAt is 'Date on which the row was created';
COMMENT on column public.client_types_by_service.updatedAt is 'Date on which the row was last modified';
