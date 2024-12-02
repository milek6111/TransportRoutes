import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { Neo4jService } from '../../services/neo4j.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [MatCard, MatCardContent, MatCardTitle, CommonModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent {
  stats: any = null;
  error: string | null = null;

  constructor(private neo4jService: Neo4jService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.stats = await this.neo4jService.fetchStats();
    } catch (err) {
      console.error('Error fetching stats:', err);
      this.error = 'Wystąpił problem podczas pobierania statystyk.';
    }
  }
}
