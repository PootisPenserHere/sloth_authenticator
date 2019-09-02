CREATE TRIGGER access_privileges_by_client_types_update_updatedAt
    BEFORE UPDATE
    ON public.access_privileges_by_client_types
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updatedAt();
