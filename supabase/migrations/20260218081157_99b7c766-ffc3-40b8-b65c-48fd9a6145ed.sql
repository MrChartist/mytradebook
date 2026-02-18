CREATE OR REPLACE FUNCTION get_fno_underlyings()
RETURNS TABLE(underlying_symbol text) AS $$
  SELECT DISTINCT im.underlying_symbol
  FROM instrument_master im
  WHERE im.exchange = 'NFO'
    AND im.underlying_symbol IS NOT NULL
    AND im.underlying_symbol NOT LIKE '%NSETEST%'
  ORDER BY im.underlying_symbol;
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;