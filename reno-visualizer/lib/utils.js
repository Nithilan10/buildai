export function dedupeProducts(products) {
    const map = new Map();
    products.forEach(p => {
      const key = p.id || p.product_url || p.name;
      if (!map.has(key)) map.set(key, p);
    });
    return Array.from(map.values());
  }
  
  export function filterProducts(products, { category, style, maxPrice }) {
    return products.filter(p => {
      if (category && p.category !== category) return false;
      if (style && p.metadata?.style !== style) return false;
      if (maxPrice && p.price > maxPrice) return false;
      return true;
    });
  }