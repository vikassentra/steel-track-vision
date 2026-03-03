
-- Core emissions data from WSA_OrgData
CREATE TABLE public.emissions_data (
  id BIGSERIAL PRIMARY KEY,
  facility_name TEXT NOT NULL,
  plant_name TEXT NOT NULL,
  scope_name TEXT NOT NULL,
  scope_category_name TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  activity_data_value NUMERIC,
  timestamp DATE NOT NULL,
  co2e_value NUMERIC DEFAULT 0,
  is_product SMALLINT DEFAULT 0,
  is_to_be_subtracted SMALLINT DEFAULT 0,
  is_accepted SMALLINT DEFAULT 1,
  user_type TEXT,
  source TEXT,
  emission_factor NUMERIC,
  ef_unit TEXT,
  ef_source TEXT
);

-- Benchmarks table
CREATE TABLE public.benchmarks (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  company TEXT NOT NULL,
  site TEXT,
  year TEXT NOT NULL,
  intensity_value NUMERIC NOT NULL
);

-- Pre-computed KPI values
CREATE TABLE public.kpi_values (
  id SERIAL PRIMARY KEY,
  metric_name TEXT NOT NULL UNIQUE,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emissions_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_values ENABLE ROW LEVEL SECURITY;

-- Public read policies (dashboard is read-only, no auth required for viewing)
CREATE POLICY "Allow public read on emissions_data" ON public.emissions_data FOR SELECT USING (true);
CREATE POLICY "Allow public read on benchmarks" ON public.benchmarks FOR SELECT USING (true);
CREATE POLICY "Allow public read on kpi_values" ON public.kpi_values FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX idx_emissions_timestamp ON public.emissions_data(timestamp);
CREATE INDEX idx_emissions_plant ON public.emissions_data(plant_name);
CREATE INDEX idx_emissions_scope ON public.emissions_data(scope_name);
CREATE INDEX idx_emissions_driver ON public.emissions_data(driver_name);
CREATE INDEX idx_emissions_plant_scope_ts ON public.emissions_data(plant_name, scope_name, timestamp);
