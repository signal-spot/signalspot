import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { SignalSpot } from '../../entities/signal-spot.entity';
import { SacredSite, SiteTier } from '../entities/sacred-site.entity';

interface ClusterPoint {
  id: string;
  latitude: number;
  longitude: number;
  weight: number; // engagement score
  timestamp: Date;
  type: 'spot' | 'activity';
}

interface Cluster {
  id: string;
  centerLat: number;
  centerLng: number;
  radius: number;
  points: ClusterPoint[];
  density: number;
  totalWeight: number;
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

interface ClusteringParams {
  minPoints: number;
  maxDistance: number; // meters
  minWeight: number;
  timeDecayFactor: number;
}

@Injectable()
export class ClusteringService {
  private readonly logger = new Logger(ClusteringService.name);

  constructor(private readonly em: EntityManager) {}

  /**
   * Main clustering method using modified DBSCAN algorithm
   */
  async performClustering(params?: Partial<ClusteringParams>): Promise<Cluster[]> {
    const clusteringParams: ClusteringParams = {
      minPoints: 3,      // Reduced from 5 to 3
      maxDistance: 500,  // Increased from 200m to 500m
      minWeight: 5,      // Reduced from 10 to 5
      timeDecayFactor: 0.1,
      ...params,
    };

    this.logger.log(`Starting clustering with params: ${JSON.stringify(clusteringParams)}`);

    try {
      // Get all signal spots with their engagement data
      const spots = await this.getClusteringData();
      
      this.logger.log(`Found ${spots.length} signal spots for clustering`);
      
      if (spots.length < clusteringParams.minPoints) {
        this.logger.warn(`Insufficient data points (${spots.length}) for clustering, need at least ${clusteringParams.minPoints}`);
        return [];
      }

      // Apply time-based weighting
      const weightedPoints = this.applyTimeWeighting(spots, clusteringParams.timeDecayFactor);
      
      // Log weight distribution
      const totalWeight = weightedPoints.reduce((sum, p) => sum + p.weight, 0);
      this.logger.log(`Total weighted points: ${weightedPoints.length}, Total weight: ${totalWeight.toFixed(2)}`);

      // Perform DBSCAN clustering
      const clusters = this.dbscanClustering(weightedPoints, clusteringParams);
      
      this.logger.log(`DBSCAN found ${clusters.length} raw clusters`);

      // Post-process clusters
      const processedClusters = this.postProcessClusters(clusters, clusteringParams);

      this.logger.log(`After post-processing: ${processedClusters.length} valid clusters`);
      
      // Log details of each cluster
      processedClusters.forEach((cluster, index) => {
        this.logger.log(
          `Cluster ${index + 1}: ${cluster.points.length} points, ` +
          `weight: ${cluster.totalWeight.toFixed(2)}, ` +
          `radius: ${cluster.radius.toFixed(0)}m`
        );
      });

      return processedClusters;
    } catch (error) {
      this.logger.error(`Error during clustering: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get data points for clustering from signal spots
   */
  private async getClusteringData(): Promise<ClusterPoint[]> {
    const spots = await this.em.find(SignalSpot, {}, {
      populate: ['creator'],
      orderBy: { createdAt: 'DESC' },
      limit: 10000, // Limit for performance
    });

    return spots.map(spot => ({
      id: spot.id,
      latitude: spot.latitude,
      longitude: spot.longitude,
      weight: this.calculateSpotWeight(spot),
      timestamp: spot.createdAt,
      type: 'spot' as const,
    }));
  }

  /**
   * Calculate weight for a signal spot based on engagement
   */
  private calculateSpotWeight(spot: SignalSpot): number {
    const baseWeight = 1;
    const likeWeight = spot.likeCount * 2;
    const commentWeight = spot.replyCount * 3;
    const shareWeight = spot.shareCount * 5;
    const viewWeight = Math.log10(spot.viewCount + 1);

    return baseWeight + likeWeight + commentWeight + shareWeight + viewWeight;
  }

  /**
   * Apply time-based decay to point weights
   */
  private applyTimeWeighting(points: ClusterPoint[], decayFactor: number): ClusterPoint[] {
    const now = Date.now();
    
    return points.map(point => {
      const ageInDays = (now - point.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      const timeWeight = Math.exp(-ageInDays * decayFactor);
      
      return {
        ...point,
        weight: point.weight * timeWeight,
      };
    });
  }

  /**
   * DBSCAN clustering algorithm implementation
   */
  private dbscanClustering(points: ClusterPoint[], params: ClusteringParams): Cluster[] {
    const clusters: Cluster[] = [];
    const visited = new Set<string>();
    const clustered = new Set<string>();

    for (const point of points) {
      if (visited.has(point.id)) continue;

      visited.add(point.id);
      const neighbors = this.getNeighbors(point, points, params.maxDistance);

      if (neighbors.length < params.minPoints) {
        continue; // Point is noise, skip
      }

      // Create new cluster
      const cluster = this.createCluster(point, neighbors, params);
      if (cluster.totalWeight >= params.minWeight) {
        clusters.push(cluster);
        
        // Mark all points in cluster as clustered
        cluster.points.forEach(p => clustered.add(p.id));

        // Expand cluster
        this.expandCluster(cluster, neighbors, points, visited, clustered, params);
      }
    }

    return clusters;
  }

  /**
   * Get neighbors within distance threshold
   */
  private getNeighbors(point: ClusterPoint, allPoints: ClusterPoint[], maxDistance: number): ClusterPoint[] {
    return allPoints.filter(otherPoint => {
      if (point.id === otherPoint.id) return false;
      
      const distance = this.calculateDistance(
        point.latitude, point.longitude,
        otherPoint.latitude, otherPoint.longitude
      );
      
      return distance <= maxDistance;
    });
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Create initial cluster from core point and its neighbors
   */
  private createCluster(corePoint: ClusterPoint, neighbors: ClusterPoint[], params: ClusteringParams): Cluster {
    const clusterPoints = [corePoint, ...neighbors];
    const centroid = this.calculateCentroid(clusterPoints);
    const boundingBox = this.calculateBoundingBox(clusterPoints);
    const radius = this.calculateClusterRadius(centroid, clusterPoints);

    return {
      id: `cluster_${corePoint.id}_${Date.now()}`,
      centerLat: centroid.lat,
      centerLng: centroid.lng,
      radius,
      points: clusterPoints,
      density: clusterPoints.length / (Math.PI * radius * radius),
      totalWeight: clusterPoints.reduce((sum, p) => sum + p.weight, 0),
      boundingBox,
    };
  }

  /**
   * Expand cluster by adding density-reachable points
   */
  private expandCluster(
    cluster: Cluster,
    neighbors: ClusterPoint[],
    allPoints: ClusterPoint[],
    visited: Set<string>,
    clustered: Set<string>,
    params: ClusteringParams
  ): void {
    const queue = [...neighbors];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (!visited.has(current.id)) {
        visited.add(current.id);
        const currentNeighbors = this.getNeighbors(current, allPoints, params.maxDistance);
        
        if (currentNeighbors.length >= params.minPoints) {
          // Add new neighbors to queue
          currentNeighbors.forEach(neighbor => {
            if (!clustered.has(neighbor.id)) {
              queue.push(neighbor);
            }
          });
        }
      }

      if (!clustered.has(current.id)) {
        cluster.points.push(current);
        clustered.add(current.id);
        
        // Update cluster properties
        this.updateClusterProperties(cluster);
      }
    }
  }

  /**
   * Calculate centroid of cluster points
   */
  private calculateCentroid(points: ClusterPoint[]): { lat: number; lng: number } {
    const totalWeight = points.reduce((sum, p) => sum + p.weight, 0);
    
    if (totalWeight === 0) {
      // Fallback to simple average
      const lat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
      const lng = points.reduce((sum, p) => sum + p.longitude, 0) / points.length;
      return { lat, lng };
    }

    // Weighted centroid
    const lat = points.reduce((sum, p) => sum + (p.latitude * p.weight), 0) / totalWeight;
    const lng = points.reduce((sum, p) => sum + (p.longitude * p.weight), 0) / totalWeight;
    
    return { lat, lng };
  }

  /**
   * Calculate bounding box for cluster points
   */
  private calculateBoundingBox(points: ClusterPoint[]): Cluster['boundingBox'] {
    const lats = points.map(p => p.latitude);
    const lngs = points.map(p => p.longitude);

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }

  /**
   * Calculate cluster radius as maximum distance from centroid to any point
   */
  private calculateClusterRadius(centroid: { lat: number; lng: number }, points: ClusterPoint[]): number {
    let maxDistance = 0;
    
    for (const point of points) {
      const distance = this.calculateDistance(
        centroid.lat, centroid.lng,
        point.latitude, point.longitude
      );
      maxDistance = Math.max(maxDistance, distance);
    }

    // Add small buffer
    return maxDistance * 1.1;
  }

  /**
   * Update cluster properties after adding points
   */
  private updateClusterProperties(cluster: Cluster): void {
    const centroid = this.calculateCentroid(cluster.points);
    cluster.centerLat = centroid.lat;
    cluster.centerLng = centroid.lng;
    cluster.radius = this.calculateClusterRadius(centroid, cluster.points);
    cluster.boundingBox = this.calculateBoundingBox(cluster.points);
    cluster.density = cluster.points.length / (Math.PI * cluster.radius * cluster.radius);
    cluster.totalWeight = cluster.points.reduce((sum, p) => sum + p.weight, 0);
  }

  /**
   * Post-process clusters to merge nearby ones and filter weak clusters
   */
  private postProcessClusters(clusters: Cluster[], params: ClusteringParams): Cluster[] {
    // Sort clusters by total weight (strongest first)
    const sortedClusters = clusters.sort((a, b) => b.totalWeight - a.totalWeight);

    // Merge nearby clusters
    const mergedClusters = this.mergeNearbyData(sortedClusters, params.maxDistance * 1.5);

    // Filter clusters that don't meet minimum requirements
    return mergedClusters.filter(cluster => 
      cluster.points.length >= params.minPoints &&
      cluster.totalWeight >= params.minWeight
    );
  }

  /**
   * Merge clusters that are very close to each other
   */
  private mergeNearbyData(clusters: Cluster[], mergeDistance: number): Cluster[] {
    const merged: Cluster[] = [];
    const processed = new Set<string>();

    for (const cluster of clusters) {
      if (processed.has(cluster.id)) continue;

      const nearbyImages = clusters.filter(other => 
        !processed.has(other.id) &&
        other.id !== cluster.id &&
        this.calculateDistance(
          cluster.centerLat, cluster.centerLng,
          other.centerLat, other.centerLng
        ) <= mergeDistance
      );

      if (nearbyImages.length > 0) {
        // Merge clusters
        const combinedPoints = [cluster, ...nearbyImages].flatMap(c => c.points);
        const mergedCluster = this.createMergedCluster(combinedPoints, cluster.id);
        merged.push(mergedCluster);

        // Mark all as processed
        processed.add(cluster.id);
        nearbyImages.forEach(c => processed.add(c.id));
      } else {
        merged.push(cluster);
        processed.add(cluster.id);
      }
    }

    return merged;
  }

  /**
   * Create merged cluster from combined points
   */
  private createMergedCluster(points: ClusterPoint[], baseId: string): Cluster {
    const centroid = this.calculateCentroid(points);
    const boundingBox = this.calculateBoundingBox(points);
    const radius = this.calculateClusterRadius(centroid, points);

    return {
      id: `merged_${baseId}`,
      centerLat: centroid.lat,
      centerLng: centroid.lng,
      radius,
      points,
      density: points.length / (Math.PI * radius * radius),
      totalWeight: points.reduce((sum, p) => sum + p.weight, 0),
      boundingBox,
    };
  }

  /**
   * Generate suggested name for a cluster based on its location and characteristics
   */
  async generateClusterName(cluster: Cluster): Promise<string> {
    try {
      // Try to get address from coordinates
      // This would typically use a geocoding service
      const address = await this.getAddressFromCoordinates(cluster.centerLat, cluster.centerLng);
      
      if (address) {
        return this.generateNameFromAddress(address, cluster);
      }

      // Fallback to generic name
      return this.generateGenericName(cluster);
    } catch (error) {
      this.logger.warn(`Could not generate name for cluster: ${error.message}`);
      return this.generateGenericName(cluster);
    }
  }

  /**
   * Get address from coordinates (placeholder - would use actual geocoding service)
   */
  private async getAddressFromCoordinates(lat: number, lng: number): Promise<string | null> {
    // TODO: Implement actual geocoding service integration
    // For now, return null to use generic names
    return null;
  }

  /**
   * Generate name from address information
   */
  private generateNameFromAddress(address: string, cluster: Cluster): string {
    const tierPrefix = this.getTierPrefix(cluster);
    
    // Extract meaningful parts from address
    const parts = address.split(',').map(part => part.trim());
    const relevantPart = parts[0] || parts[parts.length - 1];
    
    return `${tierPrefix}${relevantPart} Sacred Site`;
  }

  /**
   * Generate generic name based on cluster characteristics
   */
  private generateGenericName(cluster: Cluster): string {
    const tierPrefix = this.getTierPrefix(cluster);
    const coordinates = `${cluster.centerLat.toFixed(4)}, ${cluster.centerLng.toFixed(4)}`;
    
    return `${tierPrefix}Sacred Site (${coordinates})`;
  }

  /**
   * Get tier prefix for naming
   */
  private getTierPrefix(cluster: Cluster): string {
    if (cluster.totalWeight >= 1000) return 'Legendary ';
    if (cluster.totalWeight >= 500) return 'Major ';
    if (cluster.totalWeight >= 100) return 'Minor ';
    return '';
  }
}