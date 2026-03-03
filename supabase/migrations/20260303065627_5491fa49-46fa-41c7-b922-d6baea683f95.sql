
CREATE TABLE public.plant_kpis (
  id serial PRIMARY KEY,
  plant_name text NOT NULL,
  total_emissions numeric NOT NULL,
  production numeric NOT NULL DEFAULT 5000000,
  intensity numeric NOT NULL,
  s1_intensity numeric NOT NULL DEFAULT 0,
  s2_intensity numeric NOT NULL DEFAULT 0,
  s3_intensity numeric NOT NULL DEFAULT 0,
  s3_mining_intensity numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.plant_kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on plant_kpis"
  ON public.plant_kpis FOR SELECT
  USING (true);

INSERT INTO public.plant_kpis (plant_name, total_emissions, production, intensity, s1_intensity, s2_intensity, s3_intensity, s3_mining_intensity) VALUES
  ('Basic Oxygen Furnace (BOF)', 2688120, 5000000, 0.538, 0.214, 0.176, 0.141, 0.006),
  ('Sinter plant', 3165356, 5000000, 0.633, 0.501, 0.056, 0.075, 0.001),
  ('Blast Furnace', 9911069, 5000000, 1.982, 2.324, -0.057, -0.288, 0.003),
  ('Rebar mill', 963779, 5000000, 0.193, 0.093, 0.094, 0.000, 0.006),
  ('Coke oven', 2457590, 5000000, 0.492, 0.368, -0.277, 0.000, 0.401),
  ('Heat treatment', 37235, 5000000, 0.007, 0.000, 0.007, 0.000, 0.000),
  ('BRT', 4592, 5000000, 0.001, 0.001, 0.000, 0.000, 0.000);
