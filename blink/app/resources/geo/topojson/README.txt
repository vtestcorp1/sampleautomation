How to create these TopoJSON files:
---------------------------------------

1. Get shapefile data for the target level (e.g. county) from https://www.census.gov
2. Open the zip archive and run (ogr2og2 needs to be installed separately) to get a GeoJson file

       ogr2ogr -f "GeoJSON" us_county.geo.json tl_2014_us_county.shp

   (Optional) If we want to override the coordinate data from some other geo file, we can do that using
   'IMPORT_COORDINATE_DATA' command of topojson-processor.js script file, like:

       node scripts/geo/topojson-processor.js
            -f us_state.geo.json
            -dpf STATE_ABBR
            -sf us_state_another.geo.json
            -spf STATE_CODE

   where values specified in dpf and spf are the field names in the property metadata of each of object of destination
   geo json file (the file we are overriding) and source geo file (the file we are importing coordinate data from).
   These are used to match the objects across both files.

3. Since the GeoJson files have too many details making them too big to be used in a web application
   we do a lossy conversion to topojson

       topojson -o us_county.topo.json us_county.geo.json -s 7e-6 --id-property=+GEOID -p

4. Run the post-processor node script (scripts/geo/topojson-processor.js) on the topojson files. At the time of
   writing the only thing that script does is add unaccented values for properties in topojson objects.

       node scripts/geo/topojson-processor.js -f world.topo.json -a NORMALIZE_ACCENTED_NAMES -o objects.countries.geometries

