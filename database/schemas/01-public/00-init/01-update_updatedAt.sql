-- FUNCTION: public.update_updatedAt()

-- DROP FUNCTION public.update_updatedAt();

CREATE FUNCTION public.update_updatedAt()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF SECURITY DEFINER
AS $BODY$
  BEGIN
      NEW.updatedAt = NOW();
      RETURN NEW;
  END;
  $BODY$;

ALTER FUNCTION public.update_updatedAt()
    OWNER TO db_sloth;

COMMENT ON FUNCTION public.update_updatedAt()
    IS 'Updates the updatedAt field on on the row that triggered the action';
