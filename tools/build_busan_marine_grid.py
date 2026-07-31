"""Build a static, coast-safe marine grid for the browser.

The expensive geometry work happens once here, not while the GitHub Pages app is
loading.  Output coordinates remain EPSG:4326 for Leaflet.
"""
import json
from pathlib import Path

from pyproj import Transformer
from shapely.geometry import box, shape, mapping
from shapely.ops import transform

LAND_FILE = Path("data/busan-land.geojson")
OUT_FILE = Path("data/busan-marine-grid.geojson")
GRID_METERS = 1000
COASTAL_BELT_METERS = 5000

# All islands in busan-land.geojson use the same five-kilometre coastal belt.
INCLUDE_ISLANDS = True


def main():
    collection = json.loads(LAND_FILE.read_text(encoding="utf-8"))
    land_wgs84 = shape(collection["features"][0]["geometry"])

    # EPSG:5179 is a metre-based Korean national projected coordinate system.
    to_meters = Transformer.from_crs("EPSG:4326", "EPSG:5179", always_xy=True).transform
    to_wgs84 = Transformer.from_crs("EPSG:5179", "EPSG:4326", always_xy=True).transform
    land = transform(to_meters, land_wgs84)
    sea_belt = land.buffer(COASTAL_BELT_METERS).difference(land)

    min_x, min_y, max_x, max_y = sea_belt.bounds
    features = []
    x = (int(min_x) // GRID_METERS) * GRID_METERS
    while x < max_x:
        y = (int(min_y) // GRID_METERS) * GRID_METERS
        while y < max_y:
            square = box(x, y, x + GRID_METERS, y + GRID_METERS)
            # Clip shore-edge cells instead of dropping them, so the sea area has no
            # artificial gaps while no part of a cell overlaps land.
            marine_part = square.intersection(sea_belt)
            if not marine_part.is_empty and marine_part.area > 2500:
                center = marine_part.representative_point()
                # Deterministic temporary inputs until live marine APIs are connected.
                flow = abs(__import__("math").sin(center.x / 1700 + center.y / 2900))
                terrain = abs(__import__("math").cos(center.x / 2100 - center.y / 1500))
                depth = 8 + abs(__import__("math").sin(center.x / 3300)) * 42
                chance = round(min(100, 20 + flow * 38 + terrain * 26 + (50 - depth) * 0.32))
                features.append({
                    "type": "Feature",
                    "properties": {
                        "chance": chance,
                        "depth_m": round(depth, 1),
                        "coastal_limit_km": COASTAL_BELT_METERS // 1000,
                    },
                    "geometry": mapping(transform(to_wgs84, marine_part)),
                })
            y += GRID_METERS
        x += GRID_METERS

    payload = {
        "type": "FeatureCollection",
        "properties": {
            "source": "OpenStreetMap contributors",
            "crs": "EPSG:4326",
            "grid_size_m": GRID_METERS,
            "coastal_belt_m": COASTAL_BELT_METERS,
            "include_islands": INCLUDE_ISLANDS,
        },
        "features": features,
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {OUT_FILE} with {len(features)} clipped marine cells")


if __name__ == "__main__":
    main()
