-- Create a table to hold application-wide configuration settings
CREATE TABLE IF NOT EXISTS public.app_config (
    config_key VARCHAR PRIMARY KEY,
    config_value VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.app_config
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Insert the DAM folder prefix into the new configuration table
-- This makes the path configurable without changing code/scripts.
INSERT INTO public.app_config (config_key, config_value, description)
VALUES ('dam_folder_prefix', 'sellit-media/', 'The prefix/folder for all assets stored in the Digital Asset Manager (DAM).')
ON CONFLICT (config_key) DO NOTHING;
