CREATE TRIGGER client_types_by_service_update_updatedAt
    BEFORE UPDATE
    ON public.client_types_by_service
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updatedAt();
