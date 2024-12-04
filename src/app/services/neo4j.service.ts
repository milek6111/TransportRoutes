import { Injectable } from '@angular/core';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable({
  providedIn: 'root',
})
export class Neo4jService {
  private driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      'neo4j+s://4729738e.databases.neo4j.io',
      neo4j.auth.basic('neo4j', 'viJH9xevDJX41aTOzoeaNy14v05NMIlBgi8pmu-zgtU') 
    );
  }
  async runQuery(query: string, params: Record<string, any> = {}): Promise<any[]> {
    const session: Session = this.driver.session();
    try {
      const result = await session.run(query, params);
      return result.records.map((record) => record.toObject());
    } finally {
      await session.close();
    }
  }

  async searchConnections(city1: string, city2: string): Promise<any[]> {
    const query = `
      MATCH path = (c1:Miasto {nazwa: $city1})-[*..3]->(c2:Miasto {nazwa: $city2})
      WHERE ALL(node IN nodes(path)[1..-1] WHERE single(n IN nodes(path) WHERE n = node))
      WITH path, 
           reduce(totalDist = 0, r IN relationships(path) | totalDist + coalesce(r.dystans, 0)) AS totalDistance
      ORDER BY totalDistance ASC
      LIMIT 3
      RETURN 
        [n IN nodes(path) | n.nazwa] AS cities, 
        [r IN relationships(path) | type(r)] AS transportTypes,
        totalDistance
    `;
  
    const params = {
      city1: city1,
      city2: city2
    };
  
    const session = this.driver.session();
  
    try {
      const result = await session.run(query, params);
      return result.records.map(record => ({
        cities: record.get('cities'),
        transportTypes: record.get('transportTypes'),
        totalDistance: record.get('totalDistance'),
      }));
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw new Error('Failed to fetch connections.');
    } finally {
      await session.close();
    }
  }
  
  

  async fetchCitiesAndConnections(): Promise<any[]> {
    const query = `
      // Pobieranie wszystkich miast z ich połączeniami oraz miast bez połączeń
      MATCH (c1:Miasto)
      OPTIONAL MATCH (c1)-[r]->(c2:Miasto)
      WITH c1, c2, r,
           CASE 
             WHEN r IS NULL THEN null
             ELSE type(r)
           END AS relationshipType
      RETURN DISTINCT
             c1.nazwa AS city1,
             CASE WHEN c2 IS NULL THEN null ELSE c2.nazwa END AS city2,
             COALESCE(r.dystans, 0) AS distance,
             COALESCE(r.czas, 0) AS travelTime,
             CASE 
               WHEN relationshipType = 'DROGA' THEN 'Road'
               WHEN relationshipType = 'LOT' THEN 'Air'
               WHEN relationshipType = 'MORSKA' THEN 'Sea'
               ELSE 'Unknown'
             END AS transportType
    `;
    
    const session: Session = this.driver.session();
  
    try {
      const result = await session.run(query);
      const connections = result.records.map((record) => ({
        city1: record.get('city1'),
        city2: record.get('city2'),
        distance: record.get('distance'),
        travelTime: record.get('travelTime'),
        transportType: record.get('transportType'),
      }));
  
      // Usuń potencjalne duplikaty wynikające z braku relacji.
      const uniqueConnections = connections.filter((connection, index, self) => {
        return (
          !connection.city2 || 
          self.findIndex(c => 
            c.city1 === connection.city1 && 
            c.city2 === connection.city2 && 
            c.transportType === connection.transportType
          ) === index
        );
      });
      
      return uniqueConnections;
    } catch (error) {
      console.error('Error fetching cities and connections:', error);
      throw new Error('Failed to fetch cities and connections');
    } finally {
      await session.close();
    }
  }
  
  
  async addCity(cityData: { nazwa: string}): Promise<void> {
    const session: Session = this.driver.session();
    const query = `
    MERGE (m:Miasto {nazwa: $nazwa})
    RETURN m
  `;
    
    try {
      const result = await session.run(query, {
        nazwa: cityData.nazwa
      });

      if (result.records.length > 0) {
        console.log(`Miasto ${cityData.nazwa} zostało dodane lub już istnieje.`);
      } else {
        console.error('Nie dodano miasta, sprawdź parametry wejściowe.');
      }
    } catch (error) {
      console.error('Błąd podczas dodawania miasta:', error);
      throw new Error('Nie udało się dodać miasta.');
    } finally {
      await session.close();
    }
  }

  async deleteCity(cityName: string): Promise<void> {
    const query = `
      MATCH (m:Miasto {nazwa: $cityName})
      DETACH DELETE m
    `;
    try {
      await this.runQuery(query, { cityName });
    } catch (error) {
      console.error('Error deleting city:', error);
      throw error;
    }
  }

  async deleteConnection(fromCity: string, toCity: string): Promise<void> {
    const query = `
      MATCH (m1:Miasto {nazwa: $fromCity})-[r]->(m2:Miasto {nazwa: $toCity})
      DELETE r
      WITH m1, m2
      MATCH (m2)-[r]->(m1)
      DELETE r
    `;
    try {
      await this.runQuery(query, { fromCity, toCity });
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw error;
    }
  }
  

  async addConnection(data: any): Promise<void> {
    const query = `
      MATCH (from:Miasto {nazwa: $fromCity}), (to:Miasto {nazwa: $toCity})
      MERGE (from)-[r1:${data.transportType} {
        dystans: $distance,
        czas: $travelTime,
        transport: $transportType
      }]->(to)
      MERGE (to)-[r2:${data.transportType} {
        dystans: $distance,
        czas: $travelTime,
        transport: $transportType
      }]->(from)
    `;
    try {
      console.log(data);
      await this.runQuery(query, {
        fromCity: data.fromCity,
        toCity: data.toCity,
        distance: data.distance || null,
        travelTime: data.travelTime || null,
        transportType: data.transportType || 'unknown',
      });
    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  }
  
  
  async fetchCities(): Promise<string[]> {
    const query = `
      MATCH (m:Miasto)
      RETURN m.nazwa AS nazwa
    `;
    try {
      const result = await this.runQuery(query);
      return result.map((record: any) => record.nazwa); // Odczytujemy pole "nazwa"
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  }
  
  async fetchStats(): Promise<any> {
    const query = `
      MATCH (c:Miasto)
      WITH COUNT(c) AS totalCities
      MATCH ()-[r]->()
      WITH totalCities, COUNT(r) AS totalConnections, MAX(r.dystans) AS longestDistance, MIN(r.dystans) AS shortestDistance
      OPTIONAL MATCH (c1:Miasto)-[r1]->(c2:Miasto)
      WHERE r1.dystans = longestDistance
      WITH totalCities, totalConnections, longestDistance, shortestDistance, c1, c2, r1
      OPTIONAL MATCH (c3:Miasto)-[r2]->(c4:Miasto)
      WHERE r2.dystans = shortestDistance
      RETURN 
        totalCities,
        totalConnections,
        longestDistance,
        shortestDistance,
        c1.nazwa AS longestFrom,
        c2.nazwa AS longestTo,
        r1.dystans AS longestDistanceValue,
        c3.nazwa AS shortestFrom,
        c4.nazwa AS shortestTo,
        r2.dystans AS shortestDistanceValue
    `;
  
    const session = this.driver.session();
  
    try {
      const result = await session.run(query);
      const record = result.records[0];
  
      return {
        totalCities: record.get('totalCities'),
        totalConnections: record.get('totalConnections'),
        longestConnection: {
          distance: record.get('longestDistanceValue'),
          from: record.get('longestFrom'),
          to: record.get('longestTo'),
        },
        shortestConnection: {
          distance: record.get('shortestDistanceValue'),
          from: record.get('shortestFrom'),
          to: record.get('shortestTo'),
        },
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
  
}
