/**
 * MapPicker Component for Leaflet.js Integration
 * Provides interactive map functionality with geofence capabilities
 */

import L from "leaflet";

class MapPicker {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.map = null;
    this.marker = null;
    this.circle = null;
    this.onMapUpdate = options.onMapUpdate || (() => {});
    this.options = {
      center: options.center || [1.18546, 104.10201],
      zoom: options.zoom || 13,
      radius: options.radius || 100,
      ...options,
    };

    this.initialized = false;
  }

  /**
   * Initialize the map
   */
  init() {
    if (this.initialized) return;

    try {
      // Create map instance
      this.map = L.map(this.containerId).setView(
        this.options.center,
        this.options.zoom,
      );

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      // Create draggable marker
      this.marker = L.marker(this.options.center, {
        draggable: true,
      }).addTo(this.map);

      // Create radius circle
      this.circle = L.circle(this.options.center, {
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.2,
        radius: this.options.radius,
      }).addTo(this.map);

      // Bind events
      this.bindEvents();

      this.initialized = true;
      console.log("MapPicker initialized successfully");
    } catch (error) {
      console.error("Error initializing MapPicker:", error);
    }
  }

  /**
   * Bind map events
   */
  bindEvents() {
    // Marker drag event
    this.marker.on("dragend", (e) => {
      const position = e.target.getLatLng();
      this.updatePosition(position.lat, position.lng);
    });

    // Map click event
    this.map.on("click", (e) => {
      this.updatePosition(e.latlng.lat, e.latlng.lng);
    });
  }

  /**
   * Update marker and circle position
   */
  updatePosition(lat, lng) {
    if (!this.map || !this.marker || !this.circle) return;

    const newLatLng = L.latLng(lat, lng);

    // Update marker position
    this.marker.setLatLng(newLatLng);

    // Update circle position
    this.circle.setLatLng(newLatLng);

    // Trigger callback with updated data
    this.onMapUpdate({
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      radius: this.circle.getRadius(),
    });

    // Reverse geocode to get address
    this.reverseGeocode(lat, lng);
  }

  /**
   * Update radius of the geofence circle
   */
  updateRadius(radius) {
    if (!this.circle) return;

    const numRadius = parseFloat(radius) || 100;
    this.circle.setRadius(numRadius);

    // Trigger callback
    this.onMapUpdate({
      latitude: this.marker.getLatLng().lat.toFixed(6),
      longitude: this.marker.getLatLng().lng.toFixed(6),
      radius: numRadius,
    });
  }

  /**
   * Set map center and marker position
   */
  setPosition(lat, lng, radius = null) {
    if (!this.map || !this.marker || !this.circle) return;

    const position = L.latLng(parseFloat(lat), parseFloat(lng));

    // Update map view
    this.map.setView(position, this.options.zoom);

    // Update marker
    this.marker.setLatLng(position);

    // Update circle
    this.circle.setLatLng(position);

    if (radius !== null) {
      this.updateRadius(radius);
    }
  }

  /**
   * Search for location using Nominatim API
   */
  async searchLocation(query) {
    if (!query || query.trim().length < 3) {
      throw new Error("Query must be at least 3 characters long");
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id`,
      );

      if (!response.ok) {
        throw new Error("Failed to search location");
      }

      const results = await response.json();

      if (results.length === 0) {
        throw new Error("No locations found");
      }

      return results.map((result) => ({
        display_name: result.display_name,
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        importance: result.importance,
      }));
    } catch (error) {
      console.error("Location search error:", error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      );

      if (response.ok) {
        const result = await response.json();
        if (result.display_name) {
          // Update description through callback
          this.onMapUpdate({
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
            radius: this.circle.getRadius(),
            description: result.display_name,
          });
        }
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  }

  /**
   * Resize map (useful when container size changes)
   */
  resize() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }
  }

  /**
   * Destroy map instance
   */
  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
      this.circle = null;
      this.initialized = false;
    }
  }

  /**
   * Get current map state
   */
  getState() {
    if (!this.marker || !this.circle) return null;

    const position = this.marker.getLatLng();
    return {
      latitude: position.lat.toFixed(6),
      longitude: position.lng.toFixed(6),
      radius: this.circle.getRadius(),
    };
  }
}

export default MapPicker;
