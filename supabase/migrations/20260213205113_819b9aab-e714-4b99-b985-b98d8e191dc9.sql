
-- Add chart_link column to trades table
ALTER TABLE public.trades ADD COLUMN chart_link text;

-- Add chart_link column to alerts table  
ALTER TABLE public.alerts ADD COLUMN chart_link text;
