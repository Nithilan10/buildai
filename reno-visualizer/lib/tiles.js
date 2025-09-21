/**
 * Calculate the number of tiles needed for a given surface
 * @param {object} surface - { width: number, height: number } in meters
 * @param {object} tile - { width: number, height: number } in meters
 * @param {boolean} [allowPartial=false] - whether partial tiles are allowed
 * @returns {object} - { rows, columns, totalTiles, leftoverWidth, leftoverHeight }
 */
export function calculateTileUsage(surface, tile, allowPartial = false) {
    const rows = Math.floor(surface.height / tile.height);
    const columns = Math.floor(surface.width / tile.width);
  
    const leftoverWidth = surface.width - columns * tile.width;
    const leftoverHeight = surface.height - rows * tile.height;
  
    const totalTiles = allowPartial
      ? Math.ceil(surface.width / tile.width) * Math.ceil(surface.height / tile.height)
      : rows * columns;
  
    return {
      rows,
      columns,
      totalTiles,
      leftoverWidth,
      leftoverHeight,
    };
  }
  
  /**
   * Example: Calculate tile usage for a wall or floor
   * @param {Array} surfaces - [{ width, height }]
   * @param {object} tile - { width, height }
   * @returns {Array} - [{ surface, usage }]
   */
  export function calculateTilesForMultipleSurfaces(surfaces, tile) {
    return surfaces.map((surface) => ({
      surface,
      usage: calculateTileUsage(surface, tile),
    }));
  }
  