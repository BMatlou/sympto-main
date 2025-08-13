
-- Fix the security issues by setting proper search paths for all functions
ALTER FUNCTION public.handle_updated_at() SET search_path = '';

-- Fix calculate_health_score functions (there are multiple with different signatures)
ALTER FUNCTION public.calculate_health_score(uuid, date) SET search_path = '';
ALTER FUNCTION public.calculate_health_score() SET search_path = '';
ALTER FUNCTION public.calculate_health_score(text) SET search_path = '';
ALTER FUNCTION public.calculate_health_score(bigint) SET search_path = '';
ALTER FUNCTION public.calculate_health_score(bigint, timestamp with time zone) SET search_path = '';

-- Fix decode_sa_id function
ALTER FUNCTION public.decode_sa_id(text) SET search_path = '';

-- Add validation trigger for severity instead of check constraint
CREATE OR REPLACE FUNCTION public.validate_severity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF NEW.severity IS NOT NULL AND (NEW.severity < 1 OR NEW.severity > 10) THEN
    RAISE EXCEPTION 'Severity must be between 1 and 10';
  END IF;
  RETURN NEW;
END;
$function$;

-- Apply the trigger to symptoms_log table
DROP TRIGGER IF EXISTS validate_severity_trigger ON symptoms_log;
CREATE TRIGGER validate_severity_trigger
  BEFORE INSERT OR UPDATE ON symptoms_log
  FOR EACH ROW EXECUTE FUNCTION validate_severity();
