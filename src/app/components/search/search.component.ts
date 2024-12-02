import { Component, OnInit } from '@angular/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Neo4jService } from '../../services/neo4j.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [MatCard, MatCardContent, MatCardTitle, MatFormField, MatLabel, MatSelectModule, FormsModule, CommonModule, MatButton],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  city1: string = '';
  city2: string = '';
  cities: string[] = [];
  connections: any[] = [];

  constructor(private neo4jService: Neo4jService) {}

  async ngOnInit(): Promise<void> {
    await this.loadCities();
  }

  async loadCities(): Promise<void> {
    try {
      const data = await this.neo4jService.fetchCities();
      this.cities = data 
    } catch (error) {
      console.error('Błąd podczas ładowania miast:', error);
    }
  }

  async search(): Promise<void> {
    if (this.city1 && this.city2) {
      try {
        this.connections = await this.neo4jService.searchConnections(this.city1, this.city2);
      } catch (error) {
        console.error('Błąd podczas wyszukiwania połączeń:', error);
      }
    } else {
      alert('Proszę wybrać oba miasta.');
    }
  }
}
