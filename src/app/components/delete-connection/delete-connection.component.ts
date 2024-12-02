import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Neo4jService } from '../../services/neo4j.service';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-connection',
  standalone: true,
  imports: [MatCard, MatCardTitle, MatCardContent, MatFormField, MatSelectModule, MatButtonModule, CommonModule, ReactiveFormsModule],
  templateUrl: './delete-connection.component.html',
  styleUrls: ['./delete-connection.component.css']
})
export class DeleteConnectionComponent implements OnInit {
  deleteConnectionForm: FormGroup;
  cities: string[] = [];

  constructor(private fb: FormBuilder, private neo4jService: Neo4jService) {
    this.deleteConnectionForm = this.fb.group({
      fromCity: ['', Validators.required],
      toCity: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadCities();
  }

  async loadCities(): Promise<void> {
    try {
      const data = await this.neo4jService.fetchCities();
      this.cities = data;
    } catch (error) {
      console.error('Błąd podczas ładowania miast:', error);
    }
  }

  async deleteConnection(): Promise<void> {
    if (this.deleteConnectionForm.valid) {
      const { fromCity, toCity } = this.deleteConnectionForm.value;

      try {
        await this.neo4jService.deleteConnection(fromCity, toCity);
        alert(`Połączenie między "${fromCity}" a "${toCity}" zostało usunięte.`);
        this.deleteConnectionForm.reset();
      } catch (error) {
        console.error('Błąd podczas usuwania połączenia:', error);
        alert('Wystąpił błąd podczas usuwania połączenia.');
      }
    } else {
      alert('Proszę wybrać oba miasta.');
    }
  }
}
