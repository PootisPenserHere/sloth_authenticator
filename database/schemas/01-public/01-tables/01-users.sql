CREATE SEQUENCE public.users_id;

CREATE TYPE public.users_status AS ENUM ('active', 'inactive');

CREATE TABLE public.users (
    id INTEGER NOT NULL DEFAULT nextval('public.users_id'::regclass),
    name character varying(250) NOT NULL DEFAULT '' UNIQUE,
    username character varying(100) NOT NULL DEFAULT '' UNIQUE,
    password character varying(100) NOT NULL DEFAULT '' UNIQUE,
    status public.users_status NOT NULL DEFAULT 'active',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE INDEX idx_users_name ON public.users (name);
CREATE INDEX idx_users_username_password ON public.users (username, password);

COMMENT on column public.users.name is 'Name oe description of the user to aid in its identifying';
COMMENT on column public.users.username is 'Username to sign in';
COMMENT on column public.users.password is 'Login password for the user';
COMMENT on column public.users.status is 'Status of the record';
COMMENT on column public.users.createdAt is 'Date on which the row was created';
COMMENT on column public.users.updatedAt is 'Date on which the row was last modified';

CREATE TRIGGER users_update_updatedAt
    BEFORE UPDATE
    ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updatedAt();
