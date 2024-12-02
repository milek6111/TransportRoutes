import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import * as d3 from 'd3';
import { Neo4jService } from '../../services/neo4j.service';
import { Router, NavigationEnd } from '@angular/router'; // Import Router
import { filter } from 'rxjs/operators'; // Import filter operator

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MatCard, MatCardTitle, MatCardContent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  @ViewChild('graph', { static: true }) private graphContainer!: ElementRef;

  private width = 800;
  private height = 600;
  private nodes: any[] = [];
  private links: any[] = [];

  constructor(private neo4jService: Neo4jService, private router: Router) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadData();
    });

    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const data = await this.neo4jService.fetchCitiesAndConnections();
      this.nodes = this.extractNodes(data);
      this.links = this.extractLinks(data);
      this.clearGraph();
      this.createGraph();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  

  private clearGraph(): void {
    // Usuwanie poprzedniego SVG, aby nie duplikować grafu
    d3.select(this.graphContainer.nativeElement).selectAll('svg').remove();
  }

  private extractNodes(data: any[]): any[] {
    const nodes = new Set<string>();
    data.forEach((connection) => {
      if (connection.city1) nodes.add(connection.city1);
      if (connection.city2) nodes.add(connection.city2);
    });
    return Array.from(nodes).map((id) => ({ id }));
  }
  

  private extractLinks(data: any[]): any[] {
    return data
      .filter(d => d.city1 && d.city2) // Usuń niekompletne połączenia
      .map((d) => ({
        source: d.city1,
        target: d.city2,
        distance: d.distance,
        travelTime: d.travelTime,
        transportType: d.transportType || 'Unknown'
      }));
  }
  

  private createGraph(): void {
    const svg = d3.select(this.graphContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const radius = Math.min(this.width, this.height) / 3;

    this.nodes.forEach((node, i) => {
      const angle = (i / this.nodes.length) * 2 * Math.PI;
      node.x = this.width / 2 + radius * Math.cos(angle);
      node.y = this.height / 2 + radius * Math.sin(angle);
    });

    const link = svg.selectAll('.link')
      .data(this.links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', '#888')
      .attr('stroke-width', 2);

    const linkLabel = svg.selectAll('.link-label')
      .data(this.links)
      .enter().append('text')
      .attr('class', 'link-label')
      .attr('x', (d: any) => (this.getMidpoint(d, 'x')))
      .attr('y', (d: any) => (this.getMidpoint(d, 'y')))
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'black')
      .text((d: any) => d.transportType);

    const node = svg.selectAll('.node')
      .data(this.nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', 10)
      .attr('fill', 'skyblue')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y);

    svg.selectAll('.label')
      .data(this.nodes)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y)
      .attr('dy', -20)
      .attr('text-anchor', 'middle')
      .text((d: any) => d.id);

    link
      .attr('x1', (d: any) => this.nodes.find(node => node.id === d.source)?.x || 0)
      .attr('y1', (d: any) => this.nodes.find(node => node.id === d.source)?.y || 0)
      .attr('x2', (d: any) => this.nodes.find(node => node.id === d.target)?.x || 0)
      .attr('y2', (d: any) => this.nodes.find(node => node.id === d.target)?.y || 0);
  }

  private getMidpoint(d: any, axis: 'x' | 'y'): number {
    const sourceNode = this.nodes.find(node => node.id === d.source);
    const targetNode = this.nodes.find(node => node.id === d.target);
    if (sourceNode && targetNode) {
      return (sourceNode[axis] + targetNode[axis]) / 2;
    }
    return 0;
  }
}
