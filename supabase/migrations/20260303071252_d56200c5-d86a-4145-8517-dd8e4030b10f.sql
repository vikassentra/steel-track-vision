
ALTER TABLE public.plant_kpis
  ADD COLUMN s1_emissions numeric NOT NULL DEFAULT 0,
  ADD COLUMN s2_emissions numeric NOT NULL DEFAULT 0,
  ADD COLUMN s3_emissions numeric NOT NULL DEFAULT 0,
  ADD COLUMN s3_mining_emissions numeric NOT NULL DEFAULT 0;
