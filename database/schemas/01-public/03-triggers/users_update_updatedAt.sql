CREATE TRIGGER users_update_updatedAt
    BEFORE UPDATE
    ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updatedAt();