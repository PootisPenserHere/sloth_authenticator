CREATE TRIGGER clients_update_updatedAt
    BEFORE UPDATE
    ON public.clients
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updatedAt();
