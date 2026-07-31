import json, osmium
from pathlib import Path
from shapely.geometry import LineString, box, mapping
from shapely.ops import polygonize, unary_union

PBF = Path('south-korea-260730.osm.pbf')
OUT = Path('data/busan-land.geojson')
BBOX = box(128.70, 34.85, 129.35, 35.35)

class Coastlines(osmium.SimpleHandler):
    def __init__(self):
        super().__init__(); self.lines = []
    def way(self, way):
        if way.tags.get('natural') != 'coastline': return
        try:
            coords = [(node.lon, node.lat) for node in way.nodes]
            if len(coords) > 1 and LineString(coords).intersects(BBOX): self.lines.append(LineString(coords))
        except osmium.InvalidLocationError: pass

h = Coastlines(); h.apply_file(str(PBF), locations=True)
polys = [p.intersection(BBOX) for p in polygonize(unary_union(h.lines)) if p.intersects(BBOX)]
land = unary_union(polys).intersection(BBOX)
OUT.parent.mkdir(exist_ok=True)
OUT.write_text(json.dumps({'type':'FeatureCollection','features':[{'type':'Feature','properties':{'source':'OpenStreetMap contributors','crs':'EPSG:4326'},'geometry':mapping(land)}]}, ensure_ascii=False), encoding='utf-8')
print(f'Wrote {OUT} from {len(h.lines)} coastline ways')
